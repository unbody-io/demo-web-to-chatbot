import { CollectionName, CollectionQueryConfig, QueryIntent, QueryContext, PromptTemplate, PromptContext, PromptComposer, BotIdentityConfig, PartialPromptSystemConfig, PromptSystemConfig } from "./rag-pipeline.types";

export const DEFAULT_COLLECTION_CONFIG: Record<CollectionName, CollectionQueryConfig<any, any>> = {
  GoogleDoc: { 
      fields: ['title', "autoSummary", "_addiotional.certainty"], 
      limit: 3, 
      autocut: 3,
      getDataForPrompt: (record) => `${record.title}\nSummary${record.autoSummary}`,
      key: "GoogleDoc"
    },
  
    TextDocument: { 
      fields: ['title', 'autoSummary', "_additional.certainty"], 
      limit: 3, 
      autocut: 3,
      getDataForPrompt: (record) => `${record.title}\nSummary: ${record.autoSummary}`,
      key: "TextDocument"
    },
  
    ImageBlock: { 
      fields: ['url', 'autoCaption', 'autoOCR', "_additional.certainty"], 
      limit: 3, 
      autocut: 3,
      getDataForPrompt: (record) => `Caption: ${record.autoCaption}\nOCR: ${record.autoOCR}`,
      key: "ImageBlock"
    },
  
    WebPage: { 
      fields: ['title', 'autoSummary', "_additional.certainty"], 
      limit: 3, 
      autocut: 3,
      getDataForPrompt: (record) => `${record.title}\n${record.autoSummary}`,
      key: "WebPage"
    },
    TextBlock: { 
      fields: ['text',  "_additional.certainty"], 
      limit: 3, 
      autocut: 3,
      getDataForPrompt: (record) => record.text,
      key: "TextBlock"
    },
  };
  

export const REQUIRED_FIELDS = [
  "_additional.certainty",
  "__typename",
]

// Default bot identity configuration
export const DEFAULT_BOT_IDENTITY: BotIdentityConfig = {
  role: "AI assistant that helps users find information from a specific set of data",
  personality: {
    tone: "Professional and helpful",
    style: "Clear and concise",
    expertise: "Information retrieval and analysis"
  },
  behavior: {
    responseStyle: "Direct and informative",
    interactionStyle: "Engaging and supportive",
    limitations: "Only provide information based on available data"
  },
  goals: [
    "Provide accurate information",
    "Help users find what they need",
    "Maintain context awareness",
    "Be transparent about limitations"
  ]
};

// Intent-specific prompts to guide response style
export const SPECIALIZED_PROMPTS: Record<QueryIntent, string> = {
  // Intent-based prompts
  informational: `Focus on providing clear, factual information. 
Structure your response to directly answer the user's question while providing relevant context.`,

  comparative: `Focus on highlighting similarities and differences. 
Structure your response to provide a balanced comparison with clear criteria.`,

  analytical: `Focus on breaking down complex topics into understandable parts. 
Structure your response to provide a logical analysis with clear reasoning.`,

  procedural: `Focus on providing clear, step-by-step instructions. 
Structure your response as a sequence of actionable steps.`,

  exploratory: `Focus on guiding the user through a topic. 
Structure your response to encourage further inquiry and discovery.`,

  clarification: `Focus on resolving ambiguity and providing clear explanations. 
Structure your response to address specific points of confusion.`,

  meta: `Focus on explaining your capabilities and limitations. 
Structure your response to be informative about what you can and cannot do.`,

  followup: `Focus on maintaining context from previous interactions. 
Structure your response to build upon previous information while providing new insights.`
};

// Context modifiers to further customize responses
export const CONTEXT_MODIFIERS: Record<keyof QueryContext, string> = {
  isTechnical: `Use appropriate technical terminology and provide detailed technical explanations.`,
  requiresDetail: `Provide comprehensive details and thorough explanations.`,
  needsExamples: `Include relevant examples and practical illustrations.`,
  isTimeSensitive: `Prioritize current and up-to-date information.`,
  requiresSources: `Cite specific sources and provide references.`
};

// Default base templates for the prompt composer
export const DEFAULT_BASE_TEMPLATES: PromptTemplate[] = [
  {
    id: 'core-identity',
    content: `You are an AI assistant that helps users find information from a specific set of data.
Your primary goal is to provide accurate, helpful, and contextually relevant responses.`,
    priority: 1
  },
  {
    id: 'response-guidelines',
    content: `When responding:
- Base your answers on the provided context
- Be clear and concise
- Admit when you're unsure
- Ask for clarification when needed
- Maintain a helpful and professional tone`,
    priority: 2
  }
];

// Generate dynamic templates based on context
const DEFAULT_DYNAMIC_TEMPLATES = (context: PromptContext): PromptTemplate[] => {
  const templates: PromptTemplate[] = [];
  
  // Add context-specific templates
  if (context.retrievedDocuments?.length) {
    templates.push({
      id: 'retrieved-context',
      content: `You have access to the following information:
${context.retrievedDocuments.map(doc => `- ${doc.content}`).join('\n')}`,
      priority: 3
    });
  }

  // Add conversation history template if available
  if (context.conversationHistory?.length) {
    templates.push({
      id: 'conversation-history',
      content: `Previous conversation:
${context.conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}`,
      priority: 4
    });
  }

  return templates;
};

// Select which templates to include
const DEFAULT_TEMPLATE_SELECTOR = (context: PromptContext): string[] => {
  const selected: string[] = ['core-identity', 'response-guidelines'];
  
  if (context.retrievedDocuments?.length) {
    selected.push('retrieved-context');
  }
  
  if (context.conversationHistory?.length) {
    selected.push('conversation-history');
  }
  
  return selected;
};

// Merge templates into a single prompt
const DEFAULT_TEMPLATE_MERGER = (templates: Array<{ id: string; content: string; priority?: number }>, context: PromptContext): string => {
  // Sort by priority
  const sortedTemplates = [...templates].sort((a, b) => (a.priority || 0) - (b.priority || 0));
  
  // Combine templates with clear separation
  return sortedTemplates.map(t => t.content).join('\n\n');
};

// Format the merged template with context-specific values
const DEFAULT_TEMPLATE_FORMATTER = (template: string, context: PromptContext): string => {
  // Replace variables with actual values
  let formatted = template;
  
  if (context.query) {
    formatted = formatted.replace(/\{query\}/g, context.query);
  }
  
  // Add more variable replacements as needed
  
  return formatted;
};

// Default prompt composer implementation
export const DEFAULT_PROMPT_COMPOSER: PromptComposer = {
  compose(context: PromptContext): string {
    const templates = [
      ...this.baseTemplates,
      ...this.dynamicTemplates(context)
    ];
    const selected = this.templateSelector(context);
    const filtered = templates.filter(t => selected.includes(t.id));
    return this.templateMerger(filtered, context);
  },
  baseTemplates: DEFAULT_BASE_TEMPLATES,
  dynamicTemplates: DEFAULT_DYNAMIC_TEMPLATES,
  templateSelector: DEFAULT_TEMPLATE_SELECTOR,
  templateMerger: DEFAULT_TEMPLATE_MERGER,
  templateFormatter: DEFAULT_TEMPLATE_FORMATTER
};

// Helper to create a custom bot identity
export const createBotIdentity = (overrides: Partial<BotIdentityConfig>): BotIdentityConfig => ({
  ...DEFAULT_BOT_IDENTITY,
  ...overrides,
  personality: {
    ...DEFAULT_BOT_IDENTITY.personality,
    ...overrides.personality
  },
  behavior: {
    ...DEFAULT_BOT_IDENTITY.behavior,
    ...overrides.behavior
  },
  goals: overrides.goals || DEFAULT_BOT_IDENTITY.goals
});


export const renderBotIdentity = (identity: BotIdentityConfig): string => (`
  You are ${identity.role}.
  Your personality is ${identity.personality.tone} and ${identity.personality.style}.
  You have expertise in ${identity.personality.expertise}.

  Your behavior should be:
  - ${identity.behavior.responseStyle}
  - ${identity.behavior.interactionStyle}
  - ${identity.behavior.limitations}

  Your primary goals are:
  ${identity.goals.map(goal => `- ${goal}`).join('\n')}`
);


// Create a prompt system configuration from overrides
export const createPromptSystem = (overrides: PartialPromptSystemConfig): PromptSystemConfig => {
  // Start with default identity
  const identity = overrides.identity ? createBotIdentity(overrides.identity) : DEFAULT_BOT_IDENTITY;
  
  // Create the identity template (highest priority)
  const identityTemplate: PromptTemplate = {
    id: 'identity',
    content: renderBotIdentity(identity),
    priority: 0
  };

  // Create intent-based templates with proper priorities
  const intentTemplates: PromptTemplate[] = Object.entries(SPECIALIZED_PROMPTS)
    .map(([intent, content], index) => ({
      id: `intent-${intent}`,
      content,
      priority: 10 // Lower priority than identity but higher than dynamic content
    }));

  // Default base templates combined with identity template and any custom templates
  const baseTemplates = [
    identityTemplate,
    ...intentTemplates,
    ...DEFAULT_BASE_TEMPLATES,
    ...(overrides.baseTemplates || [])
  ];

  return {
    identity,
    baseTemplates,
    dynamicTemplates: overrides.dynamicTemplates || DEFAULT_PROMPT_COMPOSER.dynamicTemplates,
    templateSelector: overrides.templateSelector || DEFAULT_PROMPT_COMPOSER.templateSelector,
    templateMerger: overrides.templateMerger || DEFAULT_PROMPT_COMPOSER.templateMerger,
    templateFormatter: overrides.templateFormatter || DEFAULT_PROMPT_COMPOSER.templateFormatter,
    conversationHistory: overrides.conversationHistory
  };
};

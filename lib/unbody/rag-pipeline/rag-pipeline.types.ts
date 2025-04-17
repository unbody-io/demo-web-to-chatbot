import { IAudioFile, IGoogleDoc, IImageBlock, ITextBlock, ITextDocument, IVideoFile, IWebPage } from "unbody";

export type StageContext<T> = {
  output: T;
};

export type QueryIntent = 
  | 'informational'    // General information seeking
  | 'comparative'      // Comparing things
  | 'analytical'       // Analysis or breakdown
  | 'procedural'       // How-to or step-by-step
  | 'exploratory'      // Open-ended exploration
  | 'clarification'    // Seeking clarification
  | 'meta'            // Questions about the system itself
  | 'followup';       // Follow-up to previous query

export interface QueryContext {
  isTechnical: boolean;
  requiresDetail: boolean;
  needsExamples: boolean;
  isTimeSensitive: boolean;
  requiresSources: boolean;
}

export interface UnderstandingOutput {
  query: string;
  searchQuery: string;
  concepts: string[];
  intent: QueryIntent | null;
  context: QueryContext;
  isNotRelevant: boolean;
}


export interface RetrievalOutput<TCustom = {}> {
  results: (NativeCollectionMap & TCustom)[keyof (NativeCollectionMap & TCustom)][];
}

export interface RetrieverInput<TCollectionMap extends Record<string, any>> {
}

export interface GenerationOutput {
  answer: string;
  followUps: string[];
}

export interface ValuationOutput {
  evaluationScore?: number;
  remarks?: string;
}

export type IBaseCollection<T> = {
  __typename: string;
  _additional: {
    certainty: number;
  };
} & T;

export interface NativeCollectionMap {
  GoogleDoc: IBaseCollection<IGoogleDoc>;
  TextDocument: IBaseCollection<ITextDocument>;
  ImageBlock: IBaseCollection<IImageBlock>;
  WebPage: IBaseCollection<IWebPage>;
  TextBlock: IBaseCollection<ITextBlock>;
}

export type CollectionName = keyof NativeCollectionMap;


export interface PipelineContext<TCollectionMap extends Record<string, any> = NativeCollectionMap> {
  rawQuery: string;

  understanding: StageContext<UnderstandingOutput>;
  retrieval: StageContext<RetrievalOutput<TCollectionMap>>;
  generation: StageContext<GenerationOutput>;
  valuation?: StageContext<ValuationOutput>;

  conversationHistory?: IRagMessage[];  

  [key: string]: any;
}


export enum RagPipelineStageName {
  Understanding = 'understanding',
  Retrieval = 'retrieval',
  Generation = 'generation',
  Valuation = 'valuation',
}

export interface Agent<TOutput = any, TCollectionMap extends Record<string, any> = NativeCollectionMap> {
  name: string;
  stage: RagPipelineStageName;
  execute(
    context: PipelineContext<TCollectionMap>, 
    config: PipelineConfig<TCollectionMap>
  ): Promise<TOutput>;
}

export interface CollectionQueryConfig<
  TCollectionMap extends Record<string, any>,
  Key extends keyof TCollectionMap
> {
  fields: string[];
  limit: number;
  autocut: number;
  getDataForPrompt?: (record: TCollectionMap[Key]) => string;
  key: Key;
}

export type CollectionConfigs<TCollectionMap extends Record<string, any>> = {
  [Key in keyof TCollectionMap]?: CollectionQueryConfig<TCollectionMap, Key>;
};

export interface PipelineConfig<TCustom = {}> {
  collectionConfigs: CollectionConfigs<NativeCollectionMap & TCustom>;
  collections: Array<keyof (NativeCollectionMap & TCustom)>;
}

export interface BotIdentityConfig {
  role: string;
  personality: {
    tone: string;
    style: string;
    expertise: string;
  };
  behavior: {
    responseStyle: string;
    interactionStyle: string;
    limitations: string;
  };
  goals: string[];
}

export interface SystemPromptConfig {
  identity: BotIdentityConfig;
  basePrompt: string;
  specializedPrompts: Record<QueryIntent, string>;
  contextModifiers: Record<keyof QueryContext, string>;
  promptSelector: (context: PipelineContext) => QueryIntent;
  promptFormatter: (basePrompt: string, specializedPrompt: string, context: PipelineContext) => string;
}

export type PromptTemplate = {
  id: string;
  content: string;
  variables?: string[];
  priority?: number;
};

export type MessageRole = 'user' | 'assistant' | 'system';

export interface IRagMessage {
  role: MessageRole;
  content: string;
  timestamp?: number;
  metadata?: Record<string, any>;
  payload?: RetrievalOutput["results"]
  query?: UnderstandingOutput;
}

export type PromptContext = {
  conversationHistory?: IRagMessage[];
  retrievedDocuments?: Array<{
    content: string;
    metadata?: Record<string, any>;
  }>;
  query?: string;
  userContext?: Record<string, any>;
  maxHistoryLength?: number;
  historyFilter?: (message: IRagMessage) => boolean;
};

export interface PromptSystemConfig {
  // Core identity configuration
  identity?: Partial<BotIdentityConfig>;
  
  // Base templates configuration
  baseTemplates?: Array<{
    id: string;
    content: string;
    priority?: number;
  }>;
  
  // Dynamic templates configuration
  dynamicTemplates?: (context: PromptContext) => Array<{
    id: string;
    content: string;
    priority?: number;
  }>;
  
  // Template selection and composition
  templateSelector?: (context: PromptContext) => string[];
  templateMerger?: (templates: Array<{ id: string; content: string; priority?: number }>, context: PromptContext) => string;
  templateFormatter?: (template: string, context: PromptContext) => string;
  
  // Specialized prompts
  specializedPrompts?: Partial<Record<QueryIntent, string>>;
  
  // Context modifiers
  contextModifiers?: Partial<Record<keyof QueryContext, string>>;
  
  // Conversation handling
  conversationHistory?: {
    maxLength?: number;
    filter?: (message: IRagMessage) => boolean;
    includeSystemMessages?: boolean;
  };
}

// Helper type for creating partial configurations
export type PartialPromptSystemConfig = Partial<PromptSystemConfig>;

export interface PromptComposer {
  compose(context: PromptContext): string;
  baseTemplates: PromptTemplate[];
  dynamicTemplates: (context: PromptContext) => PromptTemplate[];
  templateSelector: (context: PromptContext) => string[];
  templateMerger: (templates: Array<{ id: string; content: string; priority?: number }>, context: PromptContext) => string;
  templateFormatter: (template: string, context: PromptContext) => string;
}

export interface AgenticRAGConfig<TCollectionMap extends Record<string, any> = NativeCollectionMap> {
  agents: Agent<any, TCollectionMap>[];
  collectionConfigs?: CollectionConfigs<TCollectionMap>;
  collections?: CollectionName[];
  systemPromptConfig?: SystemPromptConfig;
  promptComposer?: PromptComposer;
}
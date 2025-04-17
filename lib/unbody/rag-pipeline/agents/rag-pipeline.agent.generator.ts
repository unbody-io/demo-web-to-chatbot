// generativeAgent.ts

import { z } from 'zod';
import { 
  Agent, 
  GenerationOutput, 
  RagPipelineStageName, 
  PromptContext,
  NativeCollectionMap,
  IRagMessage,
  BotIdentityConfig,
  PromptSystemConfig,
  PromptTemplate
} from '../rag-pipeline.types';
import { unbody } from '../..';
import { IGenerateMessage } from 'unbody';
import { createPromptSystem } from '../rag-pipeline.configs';

export interface GenerationAgentOptions {
  promptSystem?: Partial<PromptSystemConfig>;
  model?: "gpt-4o" | "gpt-4o-mini";
  schema?: z.ZodObject<any>;
  maxPayloadResults?: number;
  format?: {
    type: 'markdown' | 'html' | 'plain' | 'custom';
    customFormat?: string;
  };
}

const processConversationHistory = (
  history: IRagMessage[] = [],
  options: PromptSystemConfig['conversationHistory'] = {}
): IRagMessage[] => {
  const {
    maxLength = 10,
    filter = () => true,
    includeSystemMessages = false
  } = options;

  return history
    .filter(msg => includeSystemMessages || msg.role !== 'system')
    .filter(filter)
    .slice(-maxLength);
};

export function generativeAgent(
  options?: GenerationAgentOptions
): Agent<GenerationOutput> {
  return {
    name: 'GenerativeAgent',
    stage: RagPipelineStageName.Generation,
    async execute(context, configs): Promise<GenerationOutput> {
      const maxPayloadResults = options?.maxPayloadResults || 3;
      
      const { 
        understanding: { output: { query, concepts, intent } },
        retrieval: { output: { results } }
      } = context;
      
      const rawHistory = context.conversationHistory || [];
  
      const promptSystem = createPromptSystem(options?.promptSystem || {});
      
      const processedHistory = processConversationHistory(
        rawHistory,
        promptSystem.conversationHistory
      );
      
      const promptContext: PromptContext = {
        query,
        conversationHistory: processedHistory,
        retrievedDocuments: results?.map(result => {
          const config = configs.collectionConfigs[result.__typename as keyof NativeCollectionMap];
          if (!config) {
            return null;
          }
          const content = config.getDataForPrompt?.(result as any) || JSON.stringify(result);
          return {
            content,
            metadata: {
              type: result.__typename,
              certainty: result._additional?.certainty
            }
          }
        }).filter((d): d is NonNullable<typeof d> => d !== null),
        userContext: {
          concepts,
          intent
        },
        maxHistoryLength: promptSystem.conversationHistory?.maxLength,
        historyFilter: promptSystem.conversationHistory?.filter
      };

      const baseTemplates = promptSystem.baseTemplates || [];
      const dynamicTemplates = (typeof promptSystem.dynamicTemplates === 'function') 
        ? promptSystem.dynamicTemplates(promptContext) 
        : [];
      
      const allTemplates = [...baseTemplates, ...dynamicTemplates];
      const selectedTemplateIds = (typeof promptSystem.templateSelector === 'function')
        ? promptSystem.templateSelector(promptContext)
        : allTemplates.map(t => t.id);
      
      const selectedTemplates = selectedTemplateIds
        .map(id => allTemplates.find(t => t.id === id))
        .filter((t): t is PromptTemplate => t !== undefined)
        .sort((a, b) => (a.priority || 0) - (b.priority || 0));
      
      const mergedPrompt = (typeof promptSystem.templateMerger === 'function')
        ? promptSystem.templateMerger(selectedTemplates, promptContext)
        : selectedTemplates.map(t => t.content).join('\n\n');
      
      const finalPrompt = (typeof promptSystem.templateFormatter === 'function')
        ? promptSystem.templateFormatter(mergedPrompt, promptContext)
        : mergedPrompt;
      
      const model = options?.model || 'gpt-4o';
      
      const defaultSchema = z.object({
        answer: z.string().describe(
          options?.format?.type === 'markdown' 
            ? "Provide a detailed answer in Markdown format with proper headings, lists, and code blocks where appropriate."
            : options?.format?.type === 'html'
            ? "Provide a detailed answer in HTML format with proper tags for structure and formatting."
            : options?.format?.type === 'custom'
            ? options.format.customFormat || "Provide a detailed answer."
            : "Provide a detailed answer in plain text format."
        ),
        followups: z.array(z.string()).describe("Follow-up suggestion queries that users can ask to get more information."),
      });

      const generationSchema = options?.schema || defaultSchema;
      
      const messages: IGenerateMessage[] = [
        {
          role: 'system',
          content: finalPrompt
        },
        ...processedHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user',
          content: query
        }
      ];
      
      const result = await unbody.generate.json(messages, {
        model,
        schema: generationSchema,
      }).catch((error) => {
        console.error("Error generating response", error.response);
        return { data: { payload: { content: { answer: "An error occurred", followups: [] } } } };
      });
      
      return result.data.payload.content as GenerationOutput;
    },
  };
}

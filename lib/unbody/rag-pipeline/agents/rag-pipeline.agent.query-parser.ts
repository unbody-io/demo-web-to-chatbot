// queryParseAgent.ts

import { z } from "zod";
import { unbody } from "../..";
import { Agent, RagPipelineStageName } from "../rag-pipeline.types";

export type ParsedQuery<T> = {
  query: string;
  searchQuery: string;
  concepts: string[];
  intent: "question" | "search";
  isNotRelevant: boolean;
} & T;

interface ParsedQueryArgs {
  query: string;
  schema: z.ZodObject<any>;
  history?: ParsedQuery<any>[];
  systemPrompt?: string;
  guide?: string;
  isNotRelevant?: boolean;
}

export const parseQuery = async <T>({
  query,
  schema,
  history,
  systemPrompt,
  guide,
  isNotRelevant,
}: ParsedQueryArgs): Promise<ParsedQuery<T>> => {

  const overrideSystemPrompt = `
    ${systemPrompt || "Analyze the user's query and history of queries to determine the user's intent and preferences."}
    ${guide ? `\n\nMake sure to follow these guidelines:\n${guide}` : ""}
  `;

  const { data: { payload } } = await unbody.generate.json(
    [
      {
        role: 'system',
        content: overrideSystemPrompt,
      },
      ...(history || []).flatMap((item) => [
        {
          role: 'user' as 'user',
          content: item.query,
        },
        {
          role: 'assistant' as 'assistant',
          content: JSON.stringify({ ...item, query: undefined }),
        },
      ]),
      {
        role: 'user',
        content: query,
      },
    ],
    {
      schema,
      model: "gpt-4o-mini"
    }
  );

  return {
    query,
    ...payload.content,
    searchQuery: payload.content.searchQuery || query,
  } as ParsedQuery<T>;
};

export interface PipelineContext {
  rawQuery: string;
  // Other stages (retrieval, augment, etc.) can be added here as needed.
  [key: string]: any;
}

export interface UnderstandingOutput extends ParsedQuery<any> {
}

export interface QueryParseAgentOptions {
  systemPrompt?: string;
  guide?: string;
  schema?: z.ZodObject<any>;
}

export function queryParseAgent(
  options?: QueryParseAgentOptions
): Agent<UnderstandingOutput> {
  return {
    name: "QueryParseAgent",
    stage: RagPipelineStageName.Understanding,
    async execute(context: PipelineContext): Promise<UnderstandingOutput> {
      console.log("inside queryparse:", context);

      const defaultSchema = z.object({
        searchQuery: z.string().describe("The search query to be used for the search.").default(context.rawQuery),
        concepts: z.array(z.string()).default([context.rawQuery]).describe('Search terms that the user is interested in.'),
        intent: z.enum(['search', 'question']).describe("The user's intent: 'search' if they want to search for something or 'question' if they have a question."),
        isNotRelevant: z.boolean().default(false).describe("Whether the query is not relevant to the website context."),
        context: z.object({
          isTechnical: z.boolean().default(false).describe("Whether the query is technical."),
          requiresDetail: z.boolean().default(false).describe("Whether the query requires detailed information."),
          needsExamples: z.boolean().default(false).describe("Whether the query needs examples."),
          isTimeSensitive: z.boolean().default(false).describe("Whether the query is time-sensitive."),
          requiresSources: z.boolean().default(false).describe("Whether the query requires sources."),
        })
      })

      const schema = defaultSchema.extend(options?.schema || {});
      const systemPrompt = options?.systemPrompt;
      const guide = options?.guide;

      try{
        return await parseQuery({
          query: context.rawQuery,
          schema,
          history: undefined, // or context.history if available
          systemPrompt,
          guide,
          isNotRelevant: false,
        });
      } catch (error) {
        console.error("Error parsing query:", error);
        return {
          query: context.rawQuery,
          searchQuery: context.rawQuery,
          concepts: [context.rawQuery],
          intent: "search",
          isNotRelevant: false,
          context: {
            isTechnical: false,
            requiresDetail: false,
            needsExamples: false,
            isTimeSensitive: false,
            requiresSources: false
          }
        }
      }
    }
  };
}

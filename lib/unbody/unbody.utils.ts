import { z } from "zod"
import { unbody } from "./index"

export type ParsedQuery<T> = {
    query: string
    concepts: string[]
    intent: "question" | "search"
    isNotRelevant: boolean
} & T;


interface ParsedQueryArgs{
    query: string,
    schema: z.ZodObject<any>,
    history?: ParsedQuery<any>[],
    systemPrompt?: string,
    guide?: string,
    isNotRelevant?: boolean,
}
export const parseQuery = async <T>({
    query,
    schema,
    history,
    systemPrompt,
    guide,
    isNotRelevant,
}: ParsedQueryArgs) => {

    const overrideSystemPrompt = `
    ${systemPrompt || "Analyze the user's query and history of queries to determine the user's intent and preferences."}
    ${guide ? `\n\nMake sure to follow these guidelines:\n${guide}` : ""}
    `
    const {data: { payload },} = await unbody.generate.json(
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
        schema: schema.extend({
            query: z.string(),
            concepts: z.array(z.string()).default([query]).describe('Search terms that the user is interested in.'),
            intent: z.enum(['search', 'question']).describe("The user's intent: 'search' if they want to search for something or 'question' if they have a question."),
            isNotRelevant: z.boolean().default(false).describe("Whether the query is not relevant to the website context."),
        }),
      }
    )

    return {
      query,
      ...payload.content,
    } as ParsedQuery<T>;
  }

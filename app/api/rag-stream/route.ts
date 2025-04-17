import { AgenticRag } from "@/lib/unbody/rag-pipeline/rag-pipeline"
import { IRagMessage, NativeCollectionMap } from "@/lib/unbody/rag-pipeline/rag-pipeline.types"
import * as unbodyAgents from "@/lib/unbody/rag-pipeline/agents"
import { IChatbotConfigs, IChatbotContext } from "@/types/data.types"


interface Payload {
  query: string
  history: IRagMessage[]
  configs: IChatbotConfigs
}

export async function POST(req: Request) {
  try {
    const { query, history = [], configs } = await req.json() as Payload;

    const qAgent = unbodyAgents.queryParseAgent();
    const rAgent = unbodyAgents.retrievalAgent();
    const gAgent = unbodyAgents.generativeAgent({
      promptSystem: {
        identity: {
          role: configs.basePromptRole,
          personality: configs.basePromptPersonality,
          behavior: configs.basePromptBehavior,
          goals: configs.goals
        },
      }
    });
    
    const rag = new AgenticRag<NativeCollectionMap>({
      agents: [
        qAgent,
        rAgent,
        gAgent,
      ],
      knowledgebase: {
        collections: ["WebPage"],
        collectionConfigs:{
          WebPage: {
            getDataForPrompt: (record) => {
              return `Title: ${record.title}\nContent: ${record.text}`
            },
            fields: ["title", "text", "autoSummary", "autoKeywords", "url"],
            limit: 10,
            autocut: 2,
            key: "WebPage",
          }
        }
      },
    });

    const stream = rag.stream(query, { conversationHistory: history });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

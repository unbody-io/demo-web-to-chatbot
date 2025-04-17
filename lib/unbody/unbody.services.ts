import { IChatbotConfigs, IPersonaPrompt, IChatbotContext } from "@/types/data.types";
import { unbody, unbodyPushApi } from "./unbody.clients";
import { z } from "zod";
import { IWebsite } from "unbody/content/core/documents";
import { IWebPage } from "unbody/content/core/documents";
import { CONFIGS_COLLECTION_ID } from "../configs.api";
import { DEFAULT_BOT_IDENTITY, renderBotIdentity } from "./rag-pipeline/rag-pipeline.configs";

export const getContext = async (): Promise<IChatbotContext> => {
  const { data: { payload: websites } } = await unbody.get
  .website
  .select("sourceId", "title", "url", "remoteId", "autoSummary")
  .exec();

// Since we only have one website, we can just use the first one
const website = websites[0];

if (!website) {
  throw new Error("Website not found")
}

const { data: { payload: pages } } = await unbody.get
  .webPage
  .select("title", "autoSummary", "autoEntities", "autoKeywords", "autoSummary")
  .exec();

  const existingConfigs = await getConfigs();

  return {
    website: website as IWebsite,
    pages: pages as IWebPage[],
    configs: existingConfigs || {
        initialQuestions: [],
        personaPrompt: "",
        basePromptRole: "",
        basePromptPersonality: {
            tone: "",
            style: "",
            expertise: ""
        },
        basePromptBehavior: {
            responseStyle: "",
            interactionStyle: "",
            limitations: ""
        },
        goals: []
    } as IChatbotConfigs
  }
}

export const createChatbotContext = async (): Promise<IChatbotContext> => {
  const context = await getContext()
  const configs = await generateConfigs(context)
  await updateConfigs(configs)
  return {
    ...context,
    configs
  }
}


export const generateConfigs = async (context: IChatbotContext): Promise<IChatbotConfigs> => {
  const { data: { payload: { content } } } = await unbody.generate.json(
    `Here are the summaries of the pages of a website. 
    Read through all the data and generate the following data:
    - top 3 potential questions a user might ask about the website
    - persona prompt for the chatbot which needs to include information about indenity, tone, style, expertise, responseStyle, interactionStyle, limitations and the goal of the chatbot.

    """
    Website data: ${JSON.stringify(context.website)}  
    """
    Pages data: ${JSON.stringify(context.pages)}
    """
    Example of a persona prompt:
    ${renderBotIdentity(DEFAULT_BOT_IDENTITY)}
    `,
    {
        schema: z.object({
          initialQuestions: z.array(z.string()).describe("top 3 potential questions a user might ask about the website").default(["What can I ask?"]),
          personaPrompt: z.string().describe("persona prompt for the chatbot"),
          basePromptRole: z.string().describe("role of the chatbot"),
          basePromptPersonality: z.object({
            tone: z.string().describe("tone of the chatbot"),
            style: z.string().describe("style of the chatbot"),
            expertise: z.string().describe("expertise of the chatbot")
          }),
          basePromptBehavior: z.object({
            responseStyle: z.string().describe("response style of the chatbot"),
            interactionStyle: z.string().describe("interaction style of the chatbot"),
            limitations: z.string().describe("limitations of the chatbot")
          }),
          goals: z.array(z.string()).describe("goals of the chatbot")
      }),
    }
  )
  return content
}



export const updateConfigs = async (configs: IChatbotConfigs): Promise<IChatbotConfigs> => {
  const push = unbodyPushApi(process.env.UNBODY_CUSTOM_DATA_SOURCE_ID as string)
  const records = await push.records.list({});

  if (records.data?.data.records.length === 0) {
    await push.records.create({
      id: CONFIGS_COLLECTION_ID,
      collection: "ConfigsCollection",
      payload: configs
    })
  } else {
    await push.records.update({
      id: CONFIGS_COLLECTION_ID,
      collection: "ConfigsCollection",
      payload: configs
    })
  }
  return configs
}

export const getConfigs = async (): Promise<IChatbotConfigs|null> => {
  const push = unbodyPushApi(process.env.UNBODY_CUSTOM_DATA_SOURCE_ID as string)

  const records = await push.records.get({
    id: CONFIGS_COLLECTION_ID,
  }).catch((error) => {
    console.log("error in fetching configs", error.message)
    return null
  })

  if (!records) {
    return null
  }

  if (records.data?.data.type === "file") {
    return null
  }

  return records.data?.data.data as IChatbotConfigs
}


export const generatePersona = async (context: IChatbotContext, history: string[]): Promise<IPersonaPrompt> => {
  const { data: { payload: { content } } } = await unbody.generate.json(
    `We're building an AI assistant for a website.
    Generate a pormpt which will be feed to LLM. This prompt will define the persona and the behavior of the AI assistant:
    - (all in one prompt) the personaPrompt is one unified prompt which includes all the information about indenity, tone, style, expertise, responseStyle, interactionStyle, limitations and the goal of the chatbot.
    - (separate specs) apart from the personaPrompt, you need to generate a basePromptRole, basePromptPersonality, basePromptBehavior and basePromptGoals.

    **make a balance between being concise and detailed**

    """
    Website data:
    ${JSON.stringify(context.website)}
    """
    Pages data:
    ${JSON.stringify(context.pages)}
    """
    Previous persona prompts:
    ${history.join("\n")}
    """

    """
    Here is an example of a persona prompt:
    ${renderBotIdentity(DEFAULT_BOT_IDENTITY)}
    """
    `,
    {
      schema: z.object({
        personaPrompt: z.string().describe(`persona prompt for the chatbot`),
        basePromptRole: z.string().describe("role of the chatbot"),
        basePromptPersonality: z.object({
          tone: z.string().describe("tone of the chatbot"),
          style: z.string().describe("style of the chatbot"),
          expertise: z.string().describe("expertise of the chatbot")
        }),
        basePromptBehavior: z.object({
          responseStyle: z.string().describe("response style of the chatbot"),
          interactionStyle: z.string().describe("interaction style of the chatbot"),
          limitations: z.string().describe("limitations of the chatbot")
        }),
        goals: z.array(z.string()).describe("goals of the chatbot")
      }),
    }
  )


  console.log("genearted new persona prompt", content)

  return content
}


export const extractPromptParamsFromRawPersona = async (personaPrompt: string): Promise<Partial<IPersonaPrompt> > => {
  const { data: { payload: { content } } } = await unbody.generate.json(
    `We have a long prompt that defines the persona and the behavior of the AI assistant.
    Extract and generate the following data from the prompt:
    - basePromptRole
    - basePromptPersonality
    - basePromptBehavior
    - goals

    """
    ${personaPrompt}
    """
    `,
    {
      schema: z.object({
        basePromptRole: z.string().describe("role of the chatbot"),
        basePromptPersonality: z.object({
          tone: z.string().describe("tone of the chatbot"),
          style: z.string().describe("style of the chatbot"),
          expertise: z.string().describe("expertise of the chatbot")
        }),
        basePromptBehavior: z.object({
          responseStyle: z.string().describe("response style of the chatbot"),
          interactionStyle: z.string().describe("interaction style of the chatbot"),
          limitations: z.string().describe("limitations of the chatbot")
        }), 
        goals: z.array(z.string()).describe("goals of the chatbot")
      }),
    }
  )
  return content
}

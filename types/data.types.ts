import {IWebPage, IWebsite} from "unbody";

export interface IExtendedWebsite extends IWebsite {
    xBasePrompt: string
    xInitialQuestions: string[]
}

export interface IChatbotContext {
    website: Partial<IExtendedWebsite>
    pages: Partial<IWebPage>[]
    configs: IChatbotConfigs
}

export interface IPersonaPrompt {
    personaPrompt: string
    basePromptRole: string
    basePromptPersonality: {
        tone: string
        style: string   
        expertise: string
    }
    basePromptBehavior: {
        responseStyle: string
        interactionStyle: string
        limitations: string
    }   
    goals: string[]
}

export interface IChatbotConfigs extends IPersonaPrompt {
    initialQuestions: string[]
    __typename?: 'ConfigsCollection';
} 
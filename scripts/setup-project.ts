import {
    ProjectSettings,
    TextVectorizer,
    UnbodyAdmin, Generative, Reranker, AutoSummary, AutoVision,
    CustomSchema,
    AutoKeywords,
    AutoEntities,
    AutoTopics,
} from 'unbody/admin'
import {SourceTypes} from "unbody/admin/entities";

if(!process.env.UNBODY_ADMIN_ID || !process.env.UNBODY_ADMIN_SECRET) {
    throw new Error("UNBODY_ADMIN_ID and UNBODY_ADMIN_SECRET must be set")
}

const admin = new UnbodyAdmin({
    auth: {
        username: process.env.UNBODY_ADMIN_ID,
        password: process.env.UNBODY_ADMIN_SECRET,
    },
});

const PROJECT_NAME = "website-to-chat"

const settings = new ProjectSettings()

settings
    // Text vectorizer
    .set(new TextVectorizer(TextVectorizer.OpenAI.TextEmbedding3Small))
    // Generative model
    .set(new Generative(Generative.OpenAI.GPT4oMini))
    // Reranking model
    .set(new Reranker(Reranker.Cohere.EnglishV3))
    // built-in enhancers
    .set(new AutoSummary(AutoSummary.OpenAI.GPT4oMini))
    .set(new AutoKeywords(AutoKeywords.OpenAI.GPT4oMini))
    .set(new AutoEntities(AutoEntities.OpenAI.GPT4oMini))
    .set(new AutoTopics(AutoTopics.OpenAI.GPT4oMini))
    .set(new AutoVision(AutoVision.OpenAI.GPT4oMini))



// creating a collection to store our chatbot configs
const configsCollection = new CustomSchema.Collection("ConfigsCollection")

configsCollection.add(
    new CustomSchema.Field.Text('personaPrompt', 'The core-identity prompt of the bot', false, "word", true),
    new CustomSchema.Field.Text('initialQuestions', "A list of suggestive questions to start the chat", true, "word", true),

    // base prompt
    new CustomSchema.Field.Text('basePromptRole', "The role of the bot", false, "word", true),

    new CustomSchema.Field.Object('basePromptPersonality', "The personality of the bot", false, [
        new CustomSchema.Field.Text('tone', "The tone of the bot", false, "word", true),
        new CustomSchema.Field.Text('style', "The style of the bot", false, "word", true),
        new CustomSchema.Field.Text('expertise', "The expertise of the bot", false, "word", true),
    ]),

    new CustomSchema.Field.Object('basePromptBehavior', "The behavior of the bot", false, [
        new CustomSchema.Field.Text('responseStyle', "The response style of the bot", false, "word", true),
        new CustomSchema.Field.Text('interactionStyle', "The interaction style of the bot", false, "word", true),
        new CustomSchema.Field.Text('limitations', "The limitations of the bot", false, "word", true),
    ]),

    new CustomSchema.Field.Object('basePromptGoals', "The goals of the bot", false, [
        new CustomSchema.Field.Text('goal', "The goal of the bot", false, "word", true),
    ]),
)

settings.set(
    new CustomSchema().add(
        configsCollection
    )
)


export const run = async () => {
    const requirements = [
        'UNBODY_ADMIN_ID',
        'UNBODY_ADMIN_SECRET'
    ];

    for (const requirement of requirements) {
        if (!process.env[requirement]) {
            throw new Error(`Missing environment variable: ${requirement}`);
        }
    }

    // To avoid creation random projects, we will make sure to always to stay with one project with
    // PROJECT_NAME
    try{
        const existing = await admin.projects.list({
            filter: {
                name: PROJECT_NAME
            }
        });
        console.log(`Project existed? ${existing&&existing.projects.length>0}`);
        if(existing && existing.projects.length > 0){
            for (const project of existing.projects){
                await admin.projects.delete({
                    id: project.id
                })
                console.log("project deleted", project.id)
            }
        }
    }catch(error: any){
        console.log(JSON.stringify(error.response?.data))
        throw new Error("Project setup failed.")
    }

    try{
        const project = await admin.projects
                                    .ref({name: PROJECT_NAME, settings})
                                    .save()
        console.log("Project created.")

        const customDataSource = await project.sources.ref({
            type: SourceTypes.PushApi,
            name: "custom-data-source"
        }).save();

        await customDataSource.initialize();

        const apiKey = await project
                                    .apiKeys
                                    .ref({name: "demo"})
                                    .save()
        console.log("API key created.")

        console.log(`Project ${project.name} created successfully`)
        console.log("https://app.unbody.io/projects/" + project.id);
        console.log("Make sure to set the following environment variables")
        console.log("")
        console.log(`UNBODY_PROJECT_ID=${project.id}`)
        console.log(`UNBODY_API_KEY=${apiKey.key}`)
        console.log(`UNBODY_CUSTOM_DATA_SOURCE_ID=${customDataSource.id}`)
        console.log("")
    } catch (error: any) {
        console.log(JSON.stringify(error.response?.data))
        throw new Error("Project setup failed.")
    }

}

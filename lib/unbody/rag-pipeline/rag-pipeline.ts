// agenticRAG.ts

import { EventEmitter } from 'events';
import {
    Agent,
    CollectionName,
    NativeCollectionMap,
    PipelineContext,
    RagPipelineStageName,
    UnderstandingOutput, 
    RetrievalOutput,     
    GenerationOutput,    
    ValuationOutput,
    PipelineConfig,
    CollectionConfigs,
    IRagMessage
} from './rag-pipeline.types';

import { DEFAULT_COLLECTION_CONFIG, REQUIRED_FIELDS } from './rag-pipeline.configs'; 


export interface AgenticRAGConfig<TCollectionMap extends Record<string, any> = NativeCollectionMap> {
    agents: Agent<any, TCollectionMap>[];
    knowledgebase?: {
        collectionConfigs?: CollectionConfigs<TCollectionMap>;
        collections?: CollectionName[];
    }
}

export class AgenticRag<TCollectionMap extends Record<string, any> = NativeCollectionMap> {
    private pipeline: { stage: RagPipelineStageName; agents: Agent<any, TCollectionMap>[] }[];
    private eventEmitter: EventEmitter;

    public context: PipelineContext<TCollectionMap> = {
        rawQuery: "",

        understanding: { 
            output: { 
                query: '', 
                searchQuery: '', 
                concepts: [], 
                intent: null, 
                isNotRelevant: false,
                context: {
                    isTechnical: false,
                    requiresDetail: false,
                    needsExamples: false,
                    isTimeSensitive: false,
                    requiresSources: false
                }
            }},
        retrieval: { output: { results: [] } },
        generation: { output: { answer: '', followUps: [] } },

        valuation: undefined,
    };

    public config: PipelineConfig<TCollectionMap> = {
        collectionConfigs: DEFAULT_COLLECTION_CONFIG as CollectionConfigs<NativeCollectionMap & TCollectionMap>,
        collections: Object.keys(DEFAULT_COLLECTION_CONFIG) as (keyof TCollectionMap)[],
    };

    constructor(options: AgenticRAGConfig<TCollectionMap>) {
        this.eventEmitter = new EventEmitter();
        const { collectionConfigs, collections } = options.knowledgebase || {};

        this.config.collectionConfigs = {
            ...this.config.collectionConfigs,
            ...(collectionConfigs || {}),
        };

        this.config.collections = collections || this.config.collections;

        // ensure all collections have the required fields
        this.config.collections.forEach(collection => {
            const config = this.config.collectionConfigs[collection];
            if (config) {
                config.fields = Array.from(new Set([...REQUIRED_FIELDS, ...(config.fields || [])]));
            }
        });

        const stageOrder: RagPipelineStageName[] = [
            RagPipelineStageName.Understanding,
            RagPipelineStageName.Retrieval,
            RagPipelineStageName.Generation,
            RagPipelineStageName.Valuation,
        ];

        this.pipeline = stageOrder.map((stageName) => ({
            stage: stageName,
            agents: options.agents.filter((agent) => agent.stage === stageName),
        })).filter(stage => stage.agents.length > 0);
    }

    public on(event: string, listener: (...args: any[]) => void): this {
        this.eventEmitter.on(event, listener);
        return this;
    }

    public off(event: string, listener: (...args: any[]) => void): this {
        this.eventEmitter.off(event, listener);
        return this;
    }

    public async execute(query: string, options?: { conversationHistory?: IRagMessage[] }): Promise<GenerationOutput> {
        this.context.rawQuery = query;
        const context = this.context;
        const configs = this.config;
        context.conversationHistory = options?.conversationHistory || [];

        for (const stage of this.pipeline) {
            if (stage.agents.length === 0) {
                continue;
            }

            this.eventEmitter.emit('status', { stage: stage.stage, message: `Starting ${stage.stage} stage.` });

            for (const agent of stage.agents) {
                this.eventEmitter.emit('agent-start', { stage: stage.stage, agent: agent.name });
                try {
                    const output = await agent.execute(context, configs);

                    switch (stage.stage) {
                        case RagPipelineStageName.Understanding:
                            context.understanding = { output: output as UnderstandingOutput };
                            this.eventEmitter.emit('understanding', { output: context.understanding.output });
                            break;
                        case RagPipelineStageName.Retrieval:
                            context.retrieval = { output: output as RetrievalOutput<TCollectionMap> };
                            this.eventEmitter.emit('retrieval', { output: context.retrieval.output });
                            break;
                        case RagPipelineStageName.Generation:
                            context.generation = { output: output as GenerationOutput };
                            this.eventEmitter.emit('generation', { output: context.generation.output });
                            break;
                        case RagPipelineStageName.Valuation:
                            context.valuation = { output: output as ValuationOutput };
                            this.eventEmitter.emit('valuation', { output: context.valuation.output });
                            break;
                        default:
                            console.warn(`Encountered unexpected stage: ${stage.stage}`);
                    }

                    this.eventEmitter.emit('agent-end', { stage: stage.stage, agent: agent.name, status: 'success' });
                } catch (error) {
                     this.eventEmitter.emit('agent-end', { stage: stage.stage, agent: agent.name, status: 'error', error: error instanceof Error ? error.message : String(error) });
                     this.eventEmitter.emit('error', { stage: stage.stage, agent: agent.name, error: error });
                     throw new Error(`Agent '${agent.name}' failed during stage '${stage.stage}': ${error instanceof Error ? error.message : String(error)}`);
                }
            }
            this.eventEmitter.emit('status', { stage: stage.stage, message: `${stage.stage} stage completed.` });
        }

        if (!context.generation?.output?.answer) {
            throw new Error('Pipeline completed, but the Generation stage did not produce a valid answer.');
        }

        return context.generation.output;
    }

    public stream(query: string, options?: { conversationHistory?: IRagMessage[] }): ReadableStream<Uint8Array> {
        const self = this;

        let statusListener: (...args: any[]) => void;
        let agentStartListener: (...args: any[]) => void;
        let agentEndListener: (...args: any[]) => void;
        let errorListener: (...args: any[]) => void;
        let understandingListener: (...args: any[]) => void;
        let retrievalListener: (...args: any[]) => void;
        let generationListener: (...args: any[]) => void;
        let valuationListener: (...args: any[]) => void;

        const removeListeners = () => {
            if (statusListener) self.off('status', statusListener);
            if (agentStartListener) self.off('agent-start', agentStartListener);
            if (agentEndListener) self.off('agent-end', agentEndListener);
            if (errorListener) self.off('error', errorListener);
            if (understandingListener) self.off('understanding', understandingListener);
            if (retrievalListener) self.off('retrieval', retrievalListener);
            if (generationListener) self.off('generation', generationListener);
            if (valuationListener) self.off('valuation', valuationListener);
        };

        return new ReadableStream({
            async start(controller) {
                const sseFormat = (eventName: string, data: any): string =>
                    `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;

                const enqueueSse = (eventName: string, data: any) => {
                    try {
                        controller.enqueue(new TextEncoder().encode(sseFormat(eventName, data)));
                    } catch (e) {
                        console.error("Failed to enqueue SSE message:", e);
                    }
                };

                statusListener = (status: any) => enqueueSse('status', status);
                agentStartListener = (data: any) => enqueueSse('agent-start', data);
                agentEndListener = (data: any) => enqueueSse('agent-end', data);
                errorListener = (errorData: any) => enqueueSse('error', errorData);
                understandingListener = (data: any) => enqueueSse('understanding', data);
                retrievalListener = (data: any) => enqueueSse('retrieval', data);
                generationListener = (data: any) => enqueueSse('generation', data);
                valuationListener = (data: any) => enqueueSse('valuation', data);

                self.on('status', statusListener);
                self.on('agent-start', agentStartListener);
                self.on('agent-end', agentEndListener);
                self.on('error', errorListener);
                self.on('understanding', understandingListener);
                self.on('retrieval', retrievalListener);
                self.on('generation', generationListener);
                self.on('valuation', valuationListener);

                try {
                    enqueueSse('status', { stage: 'start', message: 'Pipeline execution starting.' });
                    const output = await self.execute(query, options);
                    enqueueSse('final', output);
                } catch (error: any) {
                    enqueueSse('pipeline-error', {
                        message: error.message ?? 'An unknown error occurred during pipeline execution.',
                        stage: error.stage,
                        agent: error.agent
                    });
                } finally {
                    removeListeners();
                    try {
                        controller.close();
                    } catch(e) {
                    }
                }
            },
            cancel(reason) {
                console.log(`Stream cancelled externally: ${reason}`);
                removeListeners();
            }
        });
    }
}
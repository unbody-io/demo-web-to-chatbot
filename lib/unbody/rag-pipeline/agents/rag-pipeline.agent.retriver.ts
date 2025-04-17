import { Agent, CollectionConfigs, NativeCollectionMap, PipelineContext, RagPipelineStageName, RetrievalOutput, RetrieverInput } from "../rag-pipeline.types";
import { unbody } from "../.."; 

type TOptions = RetrieverInput<NativeCollectionMap>

export function retrievalAgent(): Agent<TOptions> {
  return {
    name: 'RetrievalAgent',
    stage: RagPipelineStageName.Retrieval,
    async execute(context, configs) {
      console.log("configs.collections", configs.collections);

      const {understanding: {output: {searchQuery, concepts, query}}} = context;

      const queries = configs.collections.map((collectionName) => {
        const config = configs.collectionConfigs[collectionName];

        if (!config) {
          console.error(`No query configuration provided for collection: ${collectionName}`);
          return null;
        }

        const query = unbody.get
          .collection(collectionName as string)
          .select(...config.fields)
          .search.about(
            searchQuery, 
            concepts && concepts.length > 0 ? {
              moveTo: {
                concepts: concepts,
                force: 0.5,
              }
            }: {}
          )
          .limit(config.limit)
          .autocut(config.autocut)

          console.log(query.getGraphQuery());
        
        return query;
      });

      const { data } = await unbody.exec(...queries.filter(n => n !== null) as any);
      
      return { 
        results: data
                .flatMap((result) => result.payload)
                .sort((a, b) => b._additional.certainty - a._additional.certainty),
      };
    },
  };
}
import { SimpleDirectoryReader, ChromaVectorStore, storageContextFromDefaults, VectorStoreIndex, SentenceSplitter, Settings, OpenAIEmbedding } from 'llamaindex';


Settings.embed_model = new OpenAIEmbedding('text-embedding-3-small')


// ========================================================================================================
// Embedd all the data and create the index
async function embeddData() {
    const collectionName = "dataEmbedded";
    const sourceFile = "./data";

    try {
        console.log(`Loading data from ${sourceFile}`);
        const reader = new SimpleDirectoryReader();
        const docs = await reader.loadData(sourceFile);
        const chunkSize = 1000;
        const chunkOverlap = 100;
        const textSplitter = new SentenceSplitter( chunkSize, chunkOverlap)

        console.log("Creating ChromaDB vector store");
        const chromaVS = new ChromaVectorStore({ collectionName });
        const ctx = await storageContextFromDefaults({ vectorStore: chromaVS });

        console.log("Embedding documents and adding to index");
        const index = await VectorStoreIndex.fromDocuments(docs, {text_splitter: textSplitter} ,{ storageContext: ctx });

        console.log("Index created, the serveur and chromaDb are running fine and ready to use !");
        return index;

    } catch (e) {
        console.error(e);
    }
};
 
// ========================================================================================================
// Search in the index for the input query
async function search(indexPromise, input) {
    const index = await indexPromise;

    if (index && index.asQueryEngine) {
        console.log('Searching inside private data')
        const queryEngine = index.asQueryEngine();
        const response = await queryEngine.query({ query: input });
        //console.log('PD Ansxer is :')
        //console.log(response)

        return response;
    } else {
        console.error('Index is not properly initialized or asQueryEngine method does not exist.');
    }
};


export { embeddData, search };




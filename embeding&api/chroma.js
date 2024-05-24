import { SimpleDirectoryReader, ChromaVectorStore, storageContextFromDefaults, VectorStoreIndex, SentenceSplitter, Settings } from 'llamaindex';

// ========================================================================================================
// Embedd all the data and create the index
async function embeddData() {
    const collectionName = "dataEmbedded";
    const sourceFile = "../backend/data";

    // try {
    //     console.log(`Loading data from ${sourceFile}`);
    //     const reader = new SimpleDirectoryReader();
    //     const docs = await reader.loadData(sourceFile);

    //     console.log("Creating ChromaDB vector store");
    //     const chromaVS = new ChromaVectorStore({ collectionName });
    //     const ctx = await storageContextFromDefaults({ vectorStore: chromaVS });

    //     console.log("Embedding documents and adding to index");
    //     const index = await VectorStoreIndex.fromDocuments(docs, transformation=[textSplitter] ,{ storageContext: ctx });

    //     console.log("Index created");
    //     return index;

    // } catch (e) {
    //     console.error(e);
    // }

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

        console.log("Index created, The serveur and chromaDb are running fine and ready to use !");
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
        console.log('PD Ansxer is :')
        console.log(response)

        return response;
    } else {
        console.error('Index is not properly initialized or asQueryEngine method does not exist.');
    }
};

// Utilize an async IIFE (Immediately Invoked Function Expression) to handle the search
// (async () => {
//    try {
//        const results = await search(embeddData(), "On average how mutch time per day does people from Philippines use internet? Is it a lot ?");
//        console.log(results.response);
//    } catch (e) {
//        console.error('Error executing search:', e);
//    }
// })();


export { embeddData, search };




import { SimpleDirectoryReader, ChromaVectorStore, storageContextFromDefaults, VectorStoreIndex, SentenceSplitter, Settings, OpenAIEmbedding } from 'llamaindex';
import { createReadStream } from 'fs';

Settings.embed_model = new OpenAIEmbedding('text-embedding-3-small');

// ========================================================================================================
// Embed all the data and create the index
async function embeddData() {
    const collectionName = "dataEmbedded";
    const sourceFile = "./data";
    const chunkSize = 1000;
    const chunkOverlap = 100;
    const batchSize = 100;  // Define a batch size to process documents in chunks

    try {
        console.log(`Loading data from ${sourceFile}`);
        const reader = new SimpleDirectoryReader();
        const docsStream = createReadStream(sourceFile);
        
        let docs = [];
        let batch = [];
        for await (const doc of reader.loadData(docsStream)) {
            batch.push(doc);
            if (batch.length >= batchSize) {
                docs.push(batch);
                batch = [];
            }
        }
        if (batch.length > 0) {
            docs.push(batch);
        }

        console.log("Creating ChromaDB vector store");
        const chromaVS = new ChromaVectorStore({ collectionName });
        const ctx = await storageContextFromDefaults({ vectorStore: chromaVS });

        const textSplitter = new SentenceSplitter(chunkSize, chunkOverlap);

        console.log("Embedding documents and adding to index");
        let index = null;
        for (const batch of docs) {
            index = await VectorStoreIndex.fromDocuments(batch, { text_splitter: textSplitter }, { storageContext: ctx });
        }

        console.log(":tada: Index created, the server and chromaDb are running fine and ready to use !");
        return index;

    } catch (e) {
        console.error(e);
        throw e;  // Rethrow the error after logging
    }
};

// ========================================================================================================
// Search in the index for the input query
async function search(indexPromise, input) {
    const index = await indexPromise;

    if (index && index.asQueryEngine) {
        console.log('Searching inside private data');
        const queryEngine = index.asQueryEngine();
        const response = await queryEngine.query({ query: 'Find relevant information that could help answer this input: ' + input });

        return response;
    } else {
        console.error('Index is not properly initialized or asQueryEngine method does not exist.');
        return null;
    }
};

export { embeddData, search };

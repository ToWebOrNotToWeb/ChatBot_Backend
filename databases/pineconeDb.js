import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI();

const pc = new Pinecone({

    apiKey: process.env.PINECONE_API_KEY,
    fetchApi: fetch

});

const libChap = [
    {
        name: "global-info",
        chapter: ["main"]
    },
    {
        name: "market-place",
        chapter: ["main"]
    },
    {
        name: "twontw",
        chapter: ["bookOne", "bookTwo", "bookThree", "bookFour", "bookFive", "bookSix", "bookSeven"] 
    },
]

const libCountry = [
    {
        name: "digital-report",
        chapter: ["belgium", "france", "hong-kong", "australias", "germany", "norway", "poland", "portugal", "sweden", "greece", "hungary", "india", "ireland", "spain", "usa", "czechia", "denmark", "finland", "italy", "japan", "south-korea", "switzerland", "united-kingdom", "croatia", "singapore", "turkey", "russia", "china", "luxembourg", "iceland", "algeria", "albania", "qatar", "cote-divoire", "monaco"]
    }
]

async function searchPrivateData(message, librairy, chapter) {

    const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: message,
        encoding_format: "float",
    });

    //console.log(embedding);

    const index = pc.index(librairy)

    const partialResponse = await index.namespace(chapter).query({
        vector: embedding.data[0].embedding,
        topK: 3,
        includeValues: false,
        includeMetadata: true
    });

    // console.log(partialResponse);
    // console.log(partialResponse.matches[0].metadata.text);
    // console.log(partialResponse.matches[1].metadata.text);
    // console.log(partialResponse.matches[2].metadata.text);

    const response = partialResponse.matches[0].metadata.text + partialResponse.matches[1].metadata.text + partialResponse.matches[2].metadata.text

    return response;

}


export { searchPrivateData, libChap, libCountry };
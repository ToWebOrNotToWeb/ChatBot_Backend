import fs from "node:fs/promises";
import { Document, VectorStoreIndex, SimpleDirectoryReader } from "llamaindex";


const dataCCIMF = "IMF_countryCode.json";
const essayCCIMF = await fs.readFile(dataCCIMF, "utf-8");
const documentCCIMF = new Document({ text: essayCCIMF});
const indexCCIMF = await VectorStoreIndex.fromDocuments([documentCCIMF]);

const dataDCIMF = "IMF_indicator.json";
const essayDCIMF = await fs.readFile(dataDCIMF, "utf-8");
const documentDCIMF = new Document({ text: essayDCIMF});
const indexDCIMF = await VectorStoreIndex.fromDocuments([documentDCIMF]);


let obj = {};
obj.self = obj;


function removeEmptyStrings(obj, seenObjects = new WeakSet()) {
    if (seenObjects.has(obj)) {
        // This object has already been seen, so avoid infinite recursion
        return;
    }
    seenObjects.add(obj);
    Object.keys(obj).forEach(key => {
        if (obj[key] === '' ) {
            // Delete the property if its value is an empty string
            delete obj[key];
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            // If the property is an object, recurse
            removeEmptyStrings(obj[key]);
        }
    });
    return obj;
}

async function getData(input) {
    let directoryPath = "./data";
    let simpleReader = new SimpleDirectoryReader();
    let documents = await simpleReader.loadData(directoryPath);
    
    console.log('Step one =====================');
    documents.forEach((doc) => {
        doc.text = doc.text.replace(/(\r\n|\n|\r)/gm, " ").replace('  ', ' ');
        console.log(`document (${doc.id_}):`, doc.getText());
    });
    documents = removeEmptyStrings(documents);
    console.log(documents.length);
    console.table(documents[0]);
    console.log(documents[0]);
    console.log(typeof documents);
    console.log(typeof documents[0]);

    // // Transform each document data into an instance of Document
    // let documents = documentsData.map(docData => new Document({
    //     id: docData.id_,
    //     text: docData.text,
    //     // Add other necessary properties from docData to this object
    // }));

    const index = await VectorStoreIndex.fromDocuments(documents);
    console.log('Step two =====================');
    console.log(typeof index);
    console.log('long index');
    console.log(index);
    //index = index.replace(/(\r\n|\n|\r)/gm, " ").replace('  ', ' ');
    //index = removeEmptyStrings(index); index is to complexe for the function
    // index = JSON.parse(index);
    // console.log('short index');
    // console.log(index);


    let inputs = "Find in the document relevant information to the user statement: ["+input+"]";
    inputs = inputs.replace(/(\r\n|\n|\r)/gm, " ").replace('  ', ' ');
    //inputs = JSON.stringify(inputs);
    console.log(inputs);
    console.log(typeof inputs);
    inputs = JSON.stringify(inputs);


    const queryEngine = index.asQueryEngine();
    console.log('Step two and a Half =====================');
    const response = await queryEngine.query(inputs);

    console.log('Step three =====================');
    console.log(response);
//I am a French producer of caviar and I want to sell my product to Germany. Please provide me the best marketplaces for E-Export to sell online to German B2B and B2C clients
    return response.response;
}


async function getDataV2(input) {
    let directoryPath = "./data";
    let simpleReader = new SimpleDirectoryReader();
    let documents = await simpleReader.loadData(directoryPath);
    
    console.log('Step one =====================');
    documents.forEach((doc) => {
        doc.text = doc.text.replace(/(\r\n|\n|\r)/gm, " ").replace('  ', ' ');
        console.log(`document (${doc.id_}):`, doc.getText());
    });
    
    const index = await VectorStoreIndex.fromDocuments(documents);
    let inputs = "Find in the document relevant information to the user statement: ["+input+"]";
    inputs = JSON.stringify(inputs);
}

async function findCountryCodeIMF (input) {

    const queryEngine = indexCCIMF.asQueryEngine(); 
    console.log('cl de la function =>' + input)
    const response = await queryEngine.query({
        query: "If the following string [ "+ input +" ] talk, state, utter, pronouce or mensions one or more country, find all the country code in the document. Else answer 'no'. Watch out Theire can be multiple country.",
    });

    return response.response

};

async function findDataCodeIMF (input) {
    console.log('Indicator search is triger')
    
    const queryEngine = indexDCIMF.asQueryEngine(); 

    const response = await queryEngine.query({
        query: "Analyse the following string [ "+ input +" ]. Find multiple economical indicator that are relevent to the string. If you don't find any, answer 'no'.",
    });
    console.log('===============!!IMPORTANT!!===================')
    console.log(response.response)
    response.response = response.response.toString();
    response.response = response.response.replace(/\./g, '');
    console.log('post modification')
    console.log(response.response)
    if (response.response != 'no'.trim() && response.response != 'No'.trim() ) {
        console.log('if is read')
        const response2 = await queryEngine.query({
            query: "Get the data codes for the following labels [ "+ response.response +" ].  Only the data code. Don't include the label.",
        });
        
        console.log('response 1 => ' + response.response)
        console.log('response 2 => ' + response2)
        console.log({response: response.response, response2: response2})
        return {response: response.response, response2: response2}
    } else {
        console.log('else is read')
        return response.response
    }

    
};

export { findCountryCodeIMF, findDataCodeIMF, getData } ;

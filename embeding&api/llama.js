import fs from "node:fs/promises";
import { Document, VectorStoreIndex, Settings, OpenAIEmbedding  } from "llamaindex";

Settings.embed_model = new OpenAIEmbedding('text-embedding-3-small')

// ========================================================================================================
// Embedd the  country code and economical indicator for the International Monetary Fund (IMF) and create the indexs
const dataCCIMF = "apiData/IMF_countryCode.json";
const essayCCIMF = await fs.readFile(dataCCIMF, "utf-8");
const documentCCIMF = new Document({ text: essayCCIMF});
const indexCCIMF = await VectorStoreIndex.fromDocuments([documentCCIMF]);

const dataDCIMF = "apiData/IMF_indicator.json";
const essayDCIMF = await fs.readFile(dataDCIMF, "utf-8");
const documentDCIMF = new Document({ text: essayDCIMF});
const indexDCIMF = await VectorStoreIndex.fromDocuments([documentDCIMF]);

// ========================================================================================================
// Embedd the  country code and economical indicator for The World Bank (TWB) and create the indexs
const dataCCTWB = "apiData/TWB_countryCode.json";
const essayCCTWB = await fs.readFile(dataCCTWB, "utf-8");
const documentCCTWB = new Document({ text: essayCCTWB});
const indexCCTWB = await VectorStoreIndex.fromDocuments([documentCCTWB]);

const dataDCTWB = "apiData/IndicatorTWB";
console.log('============================================')
console.log('dataDCTWB => ' + dataDCTWB)
const essayDCTWB = await fs.readdir(dataDCTWB, "utf-8");
console.log('============================================')
console.log('essayDCTWB => ' + essayDCTWB)
const documentDCTWB = new Document({ text: essayDCTWB});
console.log('============================================')
console.log('documentDCTWB => ')
console.log(documentDCTWB)
const indexDCTWB = await VectorStoreIndex.fromDocuments([documentDCTWB]);
console.log('============================================')
console.log('indexDCTWB => ')
console.log(indexDCTWB)
 
// ========================================================================================================
// ?????
let obj = {};
obj.self = obj;

// ========================================================================================================
// Remove empty strings from an object and its nested objects recursively (did this for a bug about an invalid input)
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


// ========================================================================================================
// Find the country code for the International Monetary Fund (IMF)
async function findCountryCodeIMF (input) {

    const queryEngine = indexCCIMF.asQueryEngine(); 
   // console.log('cl de la function =>' + input)
    const response = await queryEngine.query({
        query: "If the following string [ "+ input +" ] talk, state, utter, pronouce or mensions one or more country, find all the country code in the document. Else answer 'no'. Watch out Theire can be multiple country.",
    });

    return response.response

};

// ========================================================================================================
// Find the economical indicator for the International Monetary Fund (IMF)
async function findDataCodeIMF (input) {
    console.log('Indicator search is triger')
    
    const queryEngine = indexDCIMF.asQueryEngine(); 

    const response = await queryEngine.query({
        query: "Analyse the following string [ "+ input +" ]. Find multiple economical indicator that are relevent to the string. If you don't find any, answer 'no'.",
    });
    console.log('===============!!IMPORTANT!!===================')
   // console.log(response.response)
    response.response = response.response.toString();
    response.response = response.response.replace(/\./g, '');
    //console.log('post modification')
    //console.log(response.response)
    if (response.response != 'no'.trim() && response.response != 'No'.trim() ) {
        console.log('if is  line')
        const response2 = await queryEngine.query({
            query: "Get the data codes for the following labels [ "+ response.response +" ].  Only the data code. Don't include the label.",
        });
        
       // console.log('response 1 => ' + response.response)
        //console.log('response 2 => ' + response2)
       // console.log({response: response.response, response2: response2})
        return {response: response.response, response2: response2}
    } else {
        console.log('else is read')
        return response.response
    }

    
};

// ========================================================================================================
// Find the country code for The World Bank (TWB)
async function findCountryCodeTWB (input) {
    console.log('debug twb api')
    const queryEngine = indexCCTWB.asQueryEngine(); 
    //console.log('cl de la function =>' + input)
    const response = await queryEngine.query({
        query: "If the following string [ "+ input +" ] talk, state, utter, pronouce or mensions one or more country, find all the country code in the document. Else answer 'no'. Watch out Theire can be multiple country.",
    });
   console.log('debug resp' + response.response)
    return response.response

};

// ========================================================================================================
// Find the economical indicator for The World Bank (TWB)
async function findDataCodeTWB (input) {
    console.log('Indicator search is triger for TWB')
    
    const queryEngine = indexDCTWB.asQueryEngine(); 

    const response = await queryEngine.query({
        query: "Analyse the following string [ "+ input +" ]. Try to find multiple economical indicator that are relevent to the string. If you don't find any, answer 'no'.",
    });
    console.log('===============!!IMPORTANT!!===================')
   // console.log(response.response)
    response.response = response.response.toString();
    response.response = response.response.replace(/\./g, '');
   // console.log('post modification')
    console.log(response.response)
    if (response.response != 'no'.trim() && response.response != 'No'.trim() ) {
        console.log('if is read 135')
        const response2 = await queryEngine.query({
            query: "Get the data codes for the following labels [ "+ response.response +" ].  Only the data code. Don't include the label.",
        });
        
        // console.log('response 1 => ' + response.response)
        // console.log('response 2 => ' + response2)
        // console.log({response: response.response, response2: response2})
        return {response: response.response, response2: response2}
    } else {
        console.log('else is read 145')
        return response.response
    }

    
}

export { findCountryCodeIMF, findDataCodeIMF, findCountryCodeTWB, findDataCodeTWB } ;

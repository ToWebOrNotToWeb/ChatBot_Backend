import { findCountryCodeIMF, findDataCodeIMF } from '../embeding&api/llama.js';
import { convertToArray } from '../utils/toArray.js';

const baseUrl = 'https://www.imf.org/external/datamapper/api/v1';
// ========================================================================================================
// function to fetch data from the International Monetary Fund api
async function getIMFData(ContryCodes, IndicatorCodes) {
    console.log('IMF api request is triggered');
    try {
        let promises = [];

        // Use map instead of forEach to create an array of promises
        IndicatorCodes.map(indicator => {
            ContryCodes.map(country => {
                const url = `${baseUrl}/${indicator}/${country}`;
                // Push the fetch promise into the promises array
                promises.push(fetch(url).then(response => response.json()).then(data => data.values));
                //console.log('IMF api request is sent');
            });
        });

        // Wait for all promises to resolve and then flatten the results into the back array
        let back = await Promise.all(promises).then(results => {
            // Flatten the array of arrays to a single array
            return [].concat(...results);
        });
        //console.log('IMF api request is resolved');
        //console.table(back);
        return back;
            } catch (e) {
                console.error(e);
                return "no data in the imf api, don't take it into acount"
            }
        }

        async function checkIMFapi(message, status) {
            try {
                let imfNumber = [];
            let CC_IMF = await findCountryCodeIMF(message);
            CC_IMF = CC_IMF.replace(/\./g, '');

            if (CC_IMF.trim() != 'No' && CC_IMF.trim() != 'no') {
            console.log('step one')
            CC_IMF = convertToArray(CC_IMF);

            let EI_IMF = await findDataCodeIMF(message);

            let EI_IMFTest = EI_IMF.toString();
            EI_IMFTest = EI_IMFTest.replace(/\./g, '');
            console.log('EI_IMFTest:', EI_IMFTest);

            if (EI_IMFTest.trim() != 'No' && EI_IMFTest.trim() != 'no') {
                console.log('step two')
                console.log('IMF API is triggered');

                let valuesIMF = EI_IMF.response;
                valuesIMF = convertToArray(valuesIMF);

                let keysIMF = EI_IMF.response2.response;
                keysIMF = convertToArray(keysIMF);

                // We merge the key and the value to have a key value pair
                let mergedIMF = keysIMF.map((key, index) => {
                return { [key]: valuesIMF[index]};
                });

                // We get the data from the IMF api based on the country code and the economical indicator find earlier
                let dataIMF = await getIMFData(CC_IMF, keysIMF);
                dataIMF.forEach(key => {
                // use the merged array to change the key to the value in the data object
                
                for (let i = 0; i < mergedIMF.length; i++) {
                    let keyName = Object.keys(mergedIMF[i])[0];
                    let value = mergedIMF[i][keyName];
                    if (key[keyName] != undefined) {
                    key[value] = key[keyName];
                    delete key[keyName];
                    }
                }
                })
                // we format the data from the imf to be send to the openai api
                dataIMF.forEach(element => {
                imfNumber.push(element);
                })
                imfNumber = JSON.stringify(imfNumber);
                status.imf = true;
            }
            }
            return imfNumber;
    } catch (e) {
        console.error(e);
        return "no data in the imf api, don't take it into acount"
    }
}

export { checkIMFapi };
import { findCountryCodeTWB, findDataCodeTWB } from '../embeding&api/llama.js';
import { convertToArray } from '../utils/toArray.js';

const baseUrl = "https://api.worldbank.org/v2";

// ========================================================================================================
// function to fetch data from the World Bank api 
async function getTWBData(countryCode, indicator) {
    console.log('TWB api is trigered')

    try {
        let promises = [];

        // Use map instead of forEach to create an array of promises
        indicator.map(indicator => {
            countryCode.map(country => {
                const url = `${baseUrl}/${indicator}/${country}`;
                // Push the fetch promise into the promises array
                promises.push(fetch(url).then(response => response.json()).then(data => data.values));
                console.log('twb api request is sent');
            });
        });

        // Wait for all promises to resolve and then flatten the results into the back array
        let back = await Promise.all(promises).then(results => {
            // Flatten the array of arrays to a single array
            return [].concat(...results);
        });
        console.log('twb api request is resolved');
        //console.table(back);
        return back;
    } catch(e) {
        console.log(e)
        return "no data in the twb api, don't take it into acount"
    }
}

async function checkTWBapi(message, status) {

    try {
        let twbNumber = [];

        let CC_TWB = await findCountryCodeTWB(message);
        CC_TWB = CC_TWB.replace(/\./g, '');

        if (CC_TWB.trim() != 'No' && CC_TWB.trim() != 'no') {
        console.log('Btoh are true')
            CC_TWB = convertToArray(CC_TWB);

            let EI_TWB = await findDataCodeTWB(message);

            let EI_TWBTest = EI_TWB.toString();
            EI_TWBTest = EI_TWBTest.replace(/\./g, '');

            if (EI_TWBTest.trim() != 'No' && EI_TWBTest.trim() != 'no') {
            //console.log('step foour')
            console.log('TWB API is triggered');

            let valuesTWB = EI_TWB.response;
            valuesTWB = convertToArray(valuesTWB);

            let keysTWB = EI_TWB.response2.response;
            keysTWB = convertToArray(keysTWB);

            // We merge the key and the value to have a key value pair
            let mergedTWB = keysTWB.map((key, index) => {
                return { [key]: valuesTWB[index]};
            });

            // We get the data from the TWB api based on the country code and the economical indicator find earlier
            let dataTWB = await getTWBData(CC_TWB, keysTWB);
            console.log('dataTWB: ');
            console.table(dataTWB);
            dataTWB.forEach(key => {
                // use the merged array to change the key to the value in the data object
                
                for (let i = 0; i < mergedTWB.length; i++) {
                let keyName = Object.keys(mergedTWB[i])[0];
                let value = mergedTWB[i][keyName];
                if (key[keyName] != undefined) {
                    key[value] = key[keyName];
                    delete key[keyName];
                }
                }
            })
            // we format the data from the twb to be send to the openai api
            dataTWB.forEach(element => {
                twbNumber.push(element);
            })
            twbNumber = JSON.stringify(twbNumber);
            status.twb = true;
            }
        }
        return twbNumber;
    } catch (e) {
        console.error(e);
        return "no data in the imf api, don't take it into acount"
    }
}

export { checkTWBapi };
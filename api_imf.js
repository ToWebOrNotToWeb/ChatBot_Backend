const baseUrl = 'https://www.imf.org/external/datamapper/api/v1';

async function getIMFData(ContryCodes, IndicatorCodes) {
    console.log('IMF api request is triggered');
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
}


export { getIMFData };
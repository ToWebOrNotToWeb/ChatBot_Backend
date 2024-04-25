const baseUrl = "https://api.worldbank.org/v2";

async function getTWBData(countryCode, indicator) {
    console.log('TWB api is trigered')

    let promises = [];

    // Use map instead of forEach to create an array of promises
    indicator.map(indicator => {
        countryCode.map(country => {
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

export { getTWBData };
const baseUrl = 'https://api.tradingeconomics.com';


async function getTWBData(ContryCodes, IndicatorCodes) {
    console.log('TWB api request is triggered');
    let promises = [];

    // Use map instead of forEach to create an array of promises
    IndicatorCodes.map(indicator => {
        ContryCodes.map(country => {
            const url = `${baseUrl}/historical/country/${country}/${indicator}`;
            // Push the fetch promise into the promises array
            promises.push(fetch(url).then(response => response.json()).then(data => data));
        });
    });

    // Wait for all promises to resolve and then flatten the results into the back array
    let back = await Promise.all(promises).then(results => {
        // Flatten the array of arrays to a single array
        return [].concat(...results);
    });

    return back;
}


async function getTWBDataByDate(ContryCodes, IndicatorCodes, startDate, endDate) {

    let promises = [];

    // Use map instead of forEach to create an array of promises
    IndicatorCodes.map(indicator => {
        ContryCodes.map(country => {
            const url = `${baseUrl}/historical/country/${country}/${indicator}?d1=${startDate}&d2=${endDate}`;
            // Push the fetch promise into the promises array
            promises.push(fetch(url).then(response => response.json()).then(data => data));
        });
    });

    // Wait for all promises to resolve and then flatten the results into the back array
    let back = await Promise.all(promises).then(results => {
        // Flatten the array of arrays to a single array
        return [].concat(...results);
    });

    return back;
}
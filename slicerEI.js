import * as fs from 'fs';

let unOrganisedData = []; // i will place here my big json file

let listOfAllTopicsWithDuplicate = [];

unOrganisedData.forEach(e => {
    console.log(e.topics);
    if (!listOfAllTopicsWithDuplicate.includes(e.topics)) {
        listOfAllTopicsWithDuplicate.push(e.topics);
    }
});

// fs.writeFileSync('./backend/Alltopics.json', JSON.stringify(listOfAllTopicsWithDuplicate), 'utf-8');

// Function to create a unique identifier for each subarray based on its contents
function createKey(subarray) {
    return subarray.sort().join('|');
}

// Using a Set to track keys of already seen subarrays
const seen = new Set();
const listOfAllTopics = [];

// Iterate over each element in the array
listOfAllTopicsWithDuplicate.forEach(subarray => {
    const key = createKey(subarray);
    if (!seen.has(key)) { //key !== '' &&  i want to keep those with out topics
        seen.add(key);
        listOfAllTopics.push(subarray);
    }
});

// fs.writeFileSync('./backend/AlltopicsSorted.json', JSON.stringify(listOfAllTopics), 'utf-8');

// listOfAllTopics.forEach(e => {
//     console.log(e);
//     let temp = [];
//     unOrganisedData.forEach(f => {
//         if (f.topics === e) {
//             temp.push(f);
//         }
//     });
//     fs.writeFileSync(`./backend/indicatorTWB/${e}.json`, JSON.stringify(temp), 'utf-8');
// });

listOfAllTopics.forEach(e => {
    console.log(e);
    let temp = [];
    unOrganisedData.forEach(f => {
        if (Array.isArray(f.topics) && Array.isArray(e)) {
            if (f.topics.join('|') === e.join('|')) { // Ensuring both arrays are compared as strings
                temp.push(f);
            }
        } else if (f.topics === e) { // Handling if both are simple strings
            temp.push(f);
        }
    });
    fs.writeFileSync(`./backend/indicatorTWB/${Array.isArray(e) ? e.join('_') : e}.json`, JSON.stringify(temp), 'utf-8');
});


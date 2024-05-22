function convertToArray(inputString) {
    // Normalize the input by replacing " and " with a comma
    //
    const normalizedInput = inputString.replace(/\s+and\s+/g, ', ');
  
    // Split the normalized string by comma to convert into an array
    // The trim() function is used to remove any leading or trailing spaces from each element
    const resultArray = normalizedInput.split(',').map(element => element.trim());
  
    return resultArray;
}

export { convertToArray };
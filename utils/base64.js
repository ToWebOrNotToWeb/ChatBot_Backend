import fs from 'fs';

async function imageToBase64(imagePath) {
    try {
        // Read the file as binary data
        const file = fs.readFileSync(imagePath);
        // Convert the binary data to a base64 string
        const base64 = file.toString('base64');
        return base64;
    } catch (error) {
        console.error("Error converting image to base64:", error);
        return null;
    }
}

export { imageToBase64 };
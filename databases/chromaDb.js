import { exec } from 'child_process';

// ========================================================================================================
// This function is used to run the chromaDb server, which is needed to store the embeded data and perform search in it
if (process.platform === 'linux') {

    exec('sudo chroma run', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
        }
        console.log(`Stdout: ${stdout}`);
    });

} else if (process.platform === 'win32') {

    exec('powershell -Command "Start-Process cmd -Verb RunAs -ArgumentList \'/c chroma run\'"', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
        }
        console.log(`Stdout: ${stdout}`);
    });
    
} else {
    console.error('Unsupported platform');
}

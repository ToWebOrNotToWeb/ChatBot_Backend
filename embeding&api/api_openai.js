// ========================================================================================================
// Import the required modules
import * as dotenv from 'dotenv';
import { OpenAI } from 'openai';

// ========================================================================================================
// load the environment variables
dotenv.config();

const openai = new OpenAI(process.env.OPENAI_API_KEY);

// ========================================================================================================
// Define the functions to interact with the OpenAI Assitant

async function newMessage (input) {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: input }],
      model: "gpt-4o"
    });
    return completion
}

async function streamMessage(input, callback) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "gpt-4",
            messages: [{ role: "user", content: input }],
            stream: true
        })
    });

    if (!response.body) {
        throw new Error("No response body from OpenAI API");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let done = false;

    while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value, { stream: true });

        // Assuming `callback` is a function to handle each chunk
        if (callback && chunk) {
            callback(chunk);
        }
    }
}
 

export { newMessage, streamMessage };


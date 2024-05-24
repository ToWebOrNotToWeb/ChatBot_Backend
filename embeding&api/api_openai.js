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
      model: "gpt-3.5-turbo"
      //model: "gpt-4-turbo-preview"
    });
    return completion
}
 
export { newMessage };
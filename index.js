// ========================================================================================================
// Import the required modules
import * as dotenv from 'dotenv'; // load the environement variable
import express from 'express'; // express for the server
import cors from 'cors'; // CORS policy
import router from "./routes/start.js"; // the routes

import { run } from './databases/mongoDb.js'; // to get the collections from the database

import { verifyJwtToken } from './middelwares/middelwares.js'; // to verify the JWT token

import { OpenAI } from 'openai'; // ???

import { embeddData, search } from './embeding&api/chroma.js' // to embedd the data and search in the index

import { json } from 'stream/consumers'; // ???? 
//import { multer } from 'multer';
//import { GridFsStorage  } from 'multer-gridfs-storage';


// ========================================================================================================
// load the environment variables
dotenv.config();

const openai = new OpenAI(process.env.OPENAI_API_KEY);

run().catch(console.dir);

 

// ========================================================================================================
// Emmbed the data and define the index
//const indexData = embeddData();


// ========================================================================================================
// create the express app
const app = express();
const port = 8003;

app.use(cors());
app.use(express.json());

app.use('/user', verifyJwtToken);
app.use('/api', verifyJwtToken);

app.use("/", router);

app.listen(port, () => {
    console.log('Server app listening on port ' + port);
});




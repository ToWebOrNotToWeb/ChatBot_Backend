import { MongoClient, ServerApiVersion } from 'mongodb'; // the database
// import { ObjectId } from 'mongodb'; // used to convert the id to a mongo object id
import * as dotenv from 'dotenv'; // to access the .env file

// ========================================================================================================
// connecting to the MongoDB database and get the collections
dotenv.config();

const uri = process.env.MONGO_DB_URI; // the uri to connect to the database


const client = new MongoClient(uri, {

  serverApi: {

    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true

  }

});

const collectionUser = client.db("chatBotDB").collection("users");
const collectionChat = client.db("chatBotDB").collection("chats"); 
const collectionMessage = client.db("chatBotDB").collection("logs"); 
const collectionPicture = client.db("chatBotDB").collection("pictures");
  
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
    // we let the client open
  };
};
  
//run().catch(console.dir);


export { run, collectionUser, collectionChat, collectionMessage, collectionPicture };
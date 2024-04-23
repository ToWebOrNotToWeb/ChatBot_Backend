// ========================================================================================================
// Import the required modules
import * as dotenv from 'dotenv';
import { OpenAI } from 'openai';
import express from 'express';
import cors from 'cors';
import { MongoClient, ServerApiVersion } from 'mongodb';
import bcrypt from 'bcrypt';
import { newMessage } from './api_openai.js';
import { findCountryCodeIMF, findDataCodeIMF, getData } from './llama.js';
import { ObjectId } from 'mongodb';
import { getIMFData } from './api_imf.js';
import { embeddData, search } from './chroma.js'
import { generateJwtToken, verifyJwtToken } from './jwt.js';
import { json } from 'stream/consumers';


// ========================================================================================================
// load the environment variables
dotenv.config();

const openai = new OpenAI(process.env.OPENAI_API_KEY);
const uri = process.env.MONGO_DB_URI;


// ========================================================================================================
// connecting to the MongoDB database and get the collections
const client = new MongoClient(uri, {

  serverApi: {

    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true

  }

});


const collectionUser = client.db("chat_bot").collection("users");
const collectionChat = client.db("chat_bot").collection("chats"); 
const collectionMessage = client.db("chat_bot").collection("logs"); 

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

run().catch(console.dir);


// ========================================================================================================
// Emmbed the data and define the index
//const indexData = embeddData();


// ========================================================================================================
// create the express app
const app = express();
const port = process.env.PORT || 8003;

app.use(cors());


// ========================================================================================================
// Polyalent function may or may not be usefull
function generateToken() {
    return Math.random().toString(36).substring(2, 15);
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

function convertToArray(inputString) {
  // Normalize the input by replacing " and " with a comma
  //
  const normalizedInput = inputString.replace(/\s+and\s+/g, ', ');

  // Split the normalized string by comma to convert into an array
  // The trim() function is used to remove any leading or trailing spaces from each element
  const resultArray = normalizedInput.split(',').map(element => element.trim());

  return resultArray;
}


/*=========================================================================================*/
/*=========================================Route===========================================*/
/*=========================================================================================*/

app.get('/', (req, res) => {

    res.set('Content-Type', 'text/html');
    console.log('Someone is trying to access the server');
    res.send('Welcome !');

});

/*=========================================CRUD Users===========================================*/


app.post('/register', express.json(), async (req, res) => {
  console.log('Proceding to register :' + req.body.name)
  return res.json({'error' : 'We are not accepting new users at the moment. Please try again later.'})
    // let name = req.body.name;
    // let email = req.body.email;
    // let password = req.body.password;

    // const saltRounds = 10;
    // const hashedPassword = await bcrypt.hash(password, saltRounds);

    // let token = await generateJwtToken(email);

    // let query = { email: email };
    // let result = await collectionUser.findOne(query);

    // if (result != null) {

    //   res.status(409).json({ error: 'User already exists' });
    //   return;

    // } else {

    //   try {

    //     await collectionUser.insertOne({ name, email, hashedPassword, token });
    //     res.json({ 'token': token });

    //   } catch (error) {

    //     console.error('Error during user registration:', error);
    //     res.status(500).json({ status: 'error' });

    //   };
    // };
});

app.post('/login', express.json(), async (req, res) => {
    console.log('Proceding to login :' + req.body.email)

    let email = req.body.email;
    let password = req.body.password;

    let query = { email: email};
    let result = await collectionUser.findOne(query);

    if (result != null) {

        if (await bcrypt.compare(password, result.hashedPassword)) {

            //console.log('User logged in successfully');
            res.json({ 'token': result.token });

        } else {

            console.log('Invalid credentials');
            res.status(401).json({ error: 'Invalid credentials' });

        };

    } else {

        console.log('Invalid credentials');
        res.status(401).json({ error: 'Invalid credentials' });

    };
});

app.get('/profile', express.json(), async (req, res) => {
      //console.log('trying to retreave a profile')
      let token = req.headers.token;
      //console.log('location 1')
      //console.log(token)
  
      if (verifyJwtToken(token) === false) {
        res.json({ error: 'expired token'})
        return
      }
  
      await collectionUser.findOne({ token: token })
          .then((user) => {
  
              if (user === null) {
  
                  res.status(403).json({ error: 'Unauthorized' });
                  return;
  
              };
  
              res.json({ name: user.name, email: user.email });
              return;
  
          })
          .catch((error) => {
  
              res.status(500).json({ error: error.message });
              return;
  
          });
});

app.post('/updateProfile', express.json(), async (req, res) => {
    let token = req.headers.token;
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;

    if (verifyJwtToken(token) === false) {
      res.json({ error: 'expired token'})
      return
    }

    await collectionUser.findOne({ token: token })
        .then(async (user) => {

            if (user === null) {

                res.status(403).json({ error: 'Unauthorized' });
                return;

            };

            try {

              if (name != '') {
                await collectionUser.updateOne({ token: token }, { $set: { name: name } });
              }

              if (email != '') {
                await collectionUser.updateOne({ token: token }, { $set: { email: email } });
              }

              if (password != '') {
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                await collectionUser.updateOne({ token: token }, { $set: { hashedPassword: hashedPassword } });
              }

              res.json({ status: 'success' });
              return;

            } catch (error) {

              console.error('Error during user update:', error);
              res.status(500).json({ error: error.message });
              return;

            };
        });
});

app.post('/deleteProfile', express.json(), async (req, res) => {
    let token = req.headers.token;
    let confirm = req.body.confirm;

    if (verifyJwtToken(token) === false) {
      res.json({ error: 'expired token'})
      return
    }

    await collectionUser.findOne({ token: token })
        .then(async (user) => {

            if (user === null) {

                res.status(403).json({ error: 'Unauthorized' });
                return;

            };

            try {

              if (confirm === 'SUPPRIMER') {

                await collectionUser.deleteOne({ token: token });
                res.json({ status: 'success' });
                return;

              } else {

                res.json({ status: 'error' });
                return;

              };

            } catch (error) {

              console.error('Error during user deletion:', error);
              res.status(500).json({ error: error.message });
              return;

            };
        });
});


/*=========================================CRUD Discutions===========================================*/


app.post('/newThread', express.json(), async (req, res) => {

    let token = req.headers.token;
    let chatName = req.body.chatName;
    console.log('location 1')
    let isExpired = await verifyJwtToken(token).then((result) => {
      console.log('result')
      console.log(result)
      return result
    })
    .catch((error) => {
      console.error('Error verifying JWT token:', error);
      return false;
    });
    console.log(isExpired)
    if ( isExpired == false) {
      console.log('location 2')
      console.log('expired token')
      res.json({ error: 'expired token'})
      return
    }
    console.log('location 3')
    collectionUser.findOne({ token: token })
        .then(async (user) => {

            if (user === null) {

                res.status(403).json({ error: 'Unauthorized' });
                return;

            }

            let userId = user._id;
            try {

              await collectionChat.insertOne({ userId, chatName });
              let chat = await collectionChat.findOne({ userId, chatName });
              let message = {
                role: 'system',
                content: 'please provide help to the user'
              };

              collectionMessage.insertOne({ chatsId: chat._id, content: message })

              res.json({ chatName: chatName });
              return;

            } catch (error) {

              console.error('Error during thread creation:', error);
              res.status(500).json({ error: error.message });
              return;
            };
            
        })
        .catch((error) => {

            res.status(500).json({ error: error.message });
            return;
        });
});

app.get('/getThreads', express.json(), async (req, res) => {

  let token = req.headers.token;
  console.log('location 1')
  console.log(verifyJwtToken(token))
    if (verifyJwtToken(token) === false) {
      console.log('location 2')
      console.log('expired token')
      res.json({ error: 'expired token'})
      return
    }
    console.log('location 3')

  await collectionUser.findOne({ token: token })
      .then(async (user) => {

          if (user === null) {

              res.status(403).json({ error: 'Unauthorized' });
              return;
          };

          try {

            let userId = user._id;
            let chats = await collectionChat.find({ userId }).toArray();
            res.json({ chats });
            return;


          } catch (error) {
            console.error('Error during thread creation:', error);
            res.status(500).json({ error: error.message });
            return;
          };
      });
  
});

app.post('/deleteThread', express.json(), async (req, res) => {

    let token = req.headers.token;
    let _id = req.body.chatId;

    if (verifyJwtToken(token) === false) {
      res.json({ error: 'expired token'})
      return
    }

    await collectionUser.findOne({ token: token })
        .then(async (user) => {

            if (user === null) {

                res.status(403).json({ error: 'Unauthorized' });
                return;

            };

            try {

              await collectionChat.deleteOne({ "_id": new ObjectId(_id) });
              await collectionMessage.deleteOne({ chatsId: new ObjectId(_id) });

              res.json({ status: 'success' });
              return;

            } catch (error) {
              console.error('Error during chats deletion:', error);
              res.status(500).json({ error: error.message });
              return;
            };
        });
});

/*=========================================CRUD Messages===========================================*/

app.post('/getMessages', express.json(), async (req, res) => {
  
      let token = req.headers.token;
      let chatId = req.body.chatId;

      if (verifyJwtToken(token) === false) {
        res.json({ error: 'expired token'})
        return
      }

      await collectionUser.findOne({ token: token })
          .then(async (user) => {
  
              if (user === null) {
  
                  res.status(403).json({ error: 'Unauthorized' });
                  return;
  
              };
              try {
                let messages = await collectionMessage.findOne({chatsId: new ObjectId(chatId)})

                res.json({ messages });
                return;
              } catch (error) {
                console.error('Error during message recuperation:', error);
                res.status(500).json({ error: error.message });
                return;
              };
          });
});

app.post('/newMessage', express.json(), async (req, res) => {
  
      let token = req.headers.token;
      let message = req.body.message;
      let chatId = req.body.chatId;

      if (verifyJwtToken(token) === false) {
        res.json({ error: 'expired token'})
        return
      }
      
      await collectionUser.findOne({ token: token })
          .then(async (user) => {
  
              if (user === null) {
  
                  res.status(403).json({ error: 'Unauthorized' });
                  return;
  
              };
  
              try {
                // console.log('cahtId')
                // console.log(chatId)
                let formated = await collectionMessage.findOne({ chatsId: new ObjectId(chatId) });
                console.log('+++++++++++++++++FORMATED MESSAGE+++++++++++++++++')
                console.log(formated)
                formated = JSON.stringify(formated.content);
                let messageFormated = '';

                let CC_IMF = await findCountryCodeIMF(message);
                CC_IMF = CC_IMF.replace(/\./g, '');
                // console.log(CC_IMF);

                if (CC_IMF.trim() != 'No' && CC_IMF.trim() != 'no') {
                  CC_IMF = convertToArray(CC_IMF);
                  // console.log(CC_IMF);

                  let EI_IMF = await findDataCodeIMF(message);
                  // console.log('!!! IMPORTANT !!!');
                  // console.log(EI_IMF);

                  let EI_IMFTest = EI_IMF.toString();
                  EI_IMFTest = EI_IMFTest.replace(/\./g, '');

                  if (EI_IMFTest.trim() != 'No' && EI_IMFTest.trim() != 'no') {
//I want to expand my online e-business to germany. I'm in france
                    console.log('Hello theire')
                    console.log('General Kenobi')
                    // console.log('Current bug is here =================')
                    // console.log(EI_IMF);
                    // console.log(EI_IMF.response);
                    let values = EI_IMF.response;
                    values = convertToArray(values);
                    // console.log('!!! VALEUR !!!');
                    // console.log(values);

                    let keys = EI_IMF.response2.response;
                    keys = convertToArray(keys);
                    // console.log('!!! KEY !!!');
                    // console.log(keys);

                    let merged = keys.map((key, index) => {
                      return { [key]: values[index]};
                    });
                    // console.log('!!! MERGED !!!');
                    // console.log(merged);
                    
                    let data = await getIMFData(CC_IMF, keys);
                    console.log('Phase 4')
                    //console.log(data);
                    data.forEach(key => {
                      //console.log(key);
                      // use the merged array to change the key to the value in the data object
                      
                      for (let i = 0; i < merged.length; i++) {
                        let keyName = Object.keys(merged[i])[0];
                        let value = merged[i][keyName];
                        if (key[keyName] != undefined) {
                          key[value] = key[keyName];
                          delete key[keyName];
                        }
                      }
                    })
                    console.log('Phase 5')
                    //console.log(data);
                    let imfNumber = [];
                    data.forEach(element => {
                      imfNumber.push(element);
                    })
                    imfNumber = JSON.stringify(imfNumber);

                    //messageFormated = "Include some number in your answer. The following paragraphe containt data that you can use to provide a better answer:" + imfNumber + "The data stop here, included relevent number in your answer. The following paragraphe is here for contexte, please take it into account when answering the user input: " + formated + "The context stop here. The user input start here: " + message;
                    messageFormated = "Please analyze the following data to provide a numeric-based response: " + imfNumber + ". End of data section. Use relevant numbers to enhance your answer. Now, consider the historical context of this discussion for a better understanding: " + formated + ". End of context section. Based on the above information, respond to the following user query: " + message + ". Ensure your response integrates specific figures from the provided data where applicable.";
                    console.log('+++++++++++++++++FORMATED MESSAGE+++++++++++++++++')
                    console.log(messageFormated)
                    let response = await newMessage(messageFormated);
                    let messageUser = { role: 'user', content: message};
                    let messageBot = response.choices[0].message;
                    
                    let discution = await collectionMessage.findOne({ chatsId: new ObjectId(chatId) });

                    if (discution === null) {
                      console.log('No message found');
                      await collectionMessage.insertOne({ chatsId: chatId, content: response.choices[0].message });
                      res.json({ status: 'success' });
                      return;
                    } else {
                      
                      if (!Array.isArray(discution.content)) {
                        discution.content = [discution.content]; 
                      }
                      discution.content.push(messageUser);
                      discution.content.push(messageBot);
                      await collectionMessage.updateOne({ chatsId: new ObjectId(chatId) }, { $set: { content: discution.content } });
                      res.json({ id: chatId });
                      return;
                    } 

                  } else {
                    messageFormated = "The following paragraphe is here for contexte, please take it into account when answering the user input" + formated + "The context stop here. The user input start here: " + message;
                    let response = await newMessage(messageFormated);
                    let messageUser = { role: 'user', content: message};
                    let messageBot = response.choices[0].message;
                    
                    let discution = await collectionMessage.findOne({ chatsId: new ObjectId(chatId) });

                    if (discution === null) {
                      console.log('No message found');
                      await collectionMessage.insertOne({ chatsId: chatId, content: response.choices[0].message });
                      res.json({ status: 'success' });
                      return;
                    } else {
                      
                      if (!Array.isArray(discution.content)) {
                        discution.content = [discution.content]; 
                      }
                      discution.content.push(messageUser);
                      discution.content.push(messageBot);
                      await collectionMessage.updateOne({ chatsId: new ObjectId(chatId) }, { $set: { content: discution.content } });
                      res.json({ id: chatId });
                      return;
                    } 
                  }

                } else {
                  messageFormated = "The following paragraphe is here for contexte, please take it into account when answering the user input" + formated + "The context stop here. The user input start here: " + message;
                  let response = await newMessage(messageFormated);
                  let messageUser = { role: 'user', content: message};
                  let messageBot = response.choices[0].message;
                  
                  let discution = await collectionMessage.findOne({ chatsId: new ObjectId(chatId) });

                  if (discution === null) {
                    console.log('No message found');
                    await collectionMessage.insertOne({ chatsId: chatId, content: response.choices[0].message });
                    res.json({ status: 'success' });
                    return;
                  } else {
                    
                    if (!Array.isArray(discution.content)) {
                      discution.content = [discution.content]; 
                    }
                    discution.content.push(messageUser);
                    discution.content.push(messageBot);
                    await collectionMessage.updateOne({ chatsId: new ObjectId(chatId) }, { $set: { content: discution.content } });
                    res.json({ id: chatId });
                    return;
                  } 

                }
                
                 
              } catch (error) {
                console.error('Error during message creation:', error);
                res.status(500).json({ error: error.message });
                return;
              };
          });
});


// ========================================================================================================
// start the server

app.listen(port, () => {
    console.log('Server app listening on port ' + port);
});




// ========================================================================================================
// Import the required modules
import * as dotenv from 'dotenv'; // load the environement variable
import express from 'express'; // express for the server
import cors from 'cors'; // CORS policy
import router from "./routes/start.js"; // the routes

import { connectToMongoDb } from './databases/mongoDb.js'; // to get the collections from the database

import { verifyJwtToken } from './middelwares/middelwares.js'; // to verify the JWT token

import { generateJwtToken } from './utils/jwt.js'; // to generate a JWT token and check the validity
import { hashPassword, comparePassword } from './utils/bcrypt.js'; // to hash the password and compare it

import { OpenAI } from 'openai'; // ???
import { newMessage } from './embeding&api/api_openai.js'; // used to send message to the api

import { findCountryCodeIMF, findDataCodeIMF, findCountryCodeTWB, findDataCodeTWB } from './embeding&api/llama.js'; // to get the CC and EI for the IMF api & ? get data ?

import { getIMFData } from './embeding&api/api_imf.js'; // to get the data from the IMF api

import { getTWBData } from './embeding&api/api_twb.js'; // to get the data from the IMF api

import { embeddData, search } from './embeding&api/chroma.js' // to embedd the data and search in the index

import { json } from 'stream/consumers'; // ???? 
//import { multer } from 'multer';
//import { GridFsStorage  } from 'multer-gridfs-storage';


// ========================================================================================================
// load the environment variables
dotenv.config();

const openai = new OpenAI(process.env.OPENAI_API_KEY);

connectToMongoDb()

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


// ========================================================================================================
// Polyalent function may or may not be usefull
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

// app.get('/', (req, res) => {

//     res.set('Content-Type', 'text/html');
//     console.log('The serveur is running');
//     res.status(200);
//     res.send('Welcome !');

// });


/*=========================================CRUD Users===========================================*/


// app.post('/auth/register', async (req, res) => {
//   //console.log('Proceding to register :' + req.body.name)
//   return res.json({'error' : 'We are not accepting new users at the moment. Please try again later.'})
//     let name = req.body.name;
//     let email = req.body.email;
//     let password = req.body.password;

//     // hash the password
//     const hashedPassword = await hashPassword(password);

//     // generate a JWT token valid for one hour
//     let token = await generateJwtToken(email);

//     // make sure the user does not already exist
//     let query = { email: email };
//     let result = await collectionUser.findOne(query);

//     if (result != null) {

//       res.status(409).json({ error: 'User already exists' });
//       return;

//     } else {

//       try {

//         await collectionUser.insertOne({ name, email, hashedPassword, token });
//         res.json({ 'token': token });

//       } catch (error) {

//         console.error('Error during user registration:', error);
//         res.status(500).json({ status: 'error' });

//       };
//     };
// });

// app.post('/auth/login', async (req, res) => {
//     //console.log('Proceding to login :' + req.body.email)

//     let email = req.body.email;
//     let password = req.body.password;

//     // make sure the user exists
//     let query = { email: email};
//     let result = await collectionUser.findOne(query);

//     if (result != null) {

//         // check the password
//         if (await comparePassword(password, result.hashedPassword)) {

//             //generate a new token valid for one hours
//             let newToken = await generateJwtToken(email);
//             await collectionUser.updateOne({ email: email }, { $set: { token: newToken } });

//             //console.log('User logged in successfully');
//             res.json({ 'token': newToken });

//         } else {

//             console.log('Invalid credentials');
//             res.status(401).json({ error: 'Invalid credentials' });

//         };

//     } else {

//         console.log('Invalid credentials');
//         res.status(401).json({ error: 'Invalid credentials' });

//     };
// });

// app.get('/user/profile', async (req, res) => {
//       //console.log('trying to retreave a profile')
//       let token = req.headers.token;
//       //console.log('location 1')
//       //console.log(token)
  
//       await collectionUser.findOne({ token: token })
//           .then((user) => {
  
//               if (user === null) {
  
//                   res.status(403).json({ error: 'Unauthorized' });
//                   return;
  
//               };
  
//               res.json({ name: user.name, email: user.email });
//               return;
  
//           })
//           .catch((error) => {
  
//               res.status(500).json({ error: error.message });
//               return;
  
//           });
// });

// app.post('/user/updateProfile', async (req, res) => {
//     let token = req.headers.token;
//     let name = req.body.name;
//     let email = req.body.email;
//     let password = req.body.password;

//     await collectionUser.findOne({ token: token })
//         .then(async (user) => {

//             if (user === null) {

//                 res.status(403).json({ error: 'Unauthorized' });
//                 return;

//             };

//             try {
//               // update the user's profile information if provided
//               if (name != '') {
//                 await collectionUser.updateOne({ token: token }, { $set: { name: name } });
//               }

//               if (email != '') {
//                 await collectionUser.updateOne({ token: token }, { $set: { email: email } });
//               }

//               if (password != '') {
//                 const hashedPassword = await hashPassword(password);
//                 await collectionUser.updateOne({ token: token }, { $set: { hashedPassword: hashedPassword } });
//               }

//               res.json({ status: 'success' });
//               return;

//             } catch (error) {

//               console.error('Error during user update:', error);
//               res.status(500).json({ error: error.message });
//               return;

//             };
//         });
// });

// app.post('/user/updatePicture', async (req, res) => {
//   //console.log('Proceding to update picture ');

//   let token = req.headers.token;
//   let imgBase64 = req.body.picture;
//   let extention = req.body.extention;

//   await collectionUser.findOne({ token: token })
//       .then(async (user) => {

//           if (user === null) {

//               res.status(403).json({ error: 'Unauthorized' });
//               return;

//           };

//           try {

//             // check if the user already has a picture
//             let pp = await collectionPicture.findOne({ userId : new ObjectId(user._id) });

//             if (pp === null) {
//               // he don't have one so we create one
//               await collectionPicture.insertOne({ userId : new ObjectId(user._id), imgBase64 : imgBase64, extention : extention});
//               res.json({ status: 'success' });
//               return;
//             } else {
//               // he already have one so we update it
//               await collectionPicture.updateOne({ userId : new ObjectId(user._id) }, { $set: { imgBase64 : imgBase64, extention : extention } });
//               res.json({ status: 'success' });
//               return;
//             }
            

//           } catch (error) {

//             console.error('Error during user update:', error);
//             res.status(500).json({ error: error.message });
//             return;

//           };
//       });

// });

// app.get('/user/getPicture', async (req, res) => {
//   //console.log('Proceding to get picture ');

//   let token = req.headers.token;


//   await collectionUser.findOne({ token: token })
//       .then(async (user) => {

//           if (user === null) {

//               res.status(403).json({ error: 'Unauthorized' });
//               return;

//           };

//           try {

//             //console.log('User found :', user);
//             let pp = await collectionPicture.findOne({ userId : new ObjectId(user._id) });
//             if (pp === null) {
//               //console.log('No picture found');
//               // if the user don't have any profile picture we return the name of the user, in the front we will display the first letter in capital  
//               res.json({ result: user.name });
//               return;
//             }
//             //console.log('Picture found');
//             // we return the picture and the extention
//             res.json({result: pp.imgBase64, extention: pp.extention});
//             return;

//           } catch (error) {

//             console.error('Error during picture retreaval :', error);
//             res.status(500).json({ error: error.message });
//             return;

//           };
//       });
// });

// app.post('/user/deleteProfile', async (req, res) => {
//     let token = req.headers.token;
//     let confirm = req.body.confirm;

//     await collectionUser.findOne({ token: token })
//         .then(async (user) => {

//             if (user === null) {

//                 res.status(403).json({ error: 'Unauthorized' });
//                 return;

//             };

//             try {
//               // check that the user confirmed
//               if (confirm === 'DELETE') {

//                 await collectionUser.deleteOne({ token: token });
//                 res.json({ status: 'success' });
//                 return;

//               } else {

//                 res.json({ status: 'error' });
//                 return;

//               };

//             } catch (error) {

//               console.error('Error during user deletion:', error);
//               res.status(500).json({ error: error.message });
//               return;

//             };
//         });
// });


/*=========================================CRUD Discutions===========================================*/


// app.post('/api/discution/new', async (req, res) => {

//     let token = req.headers.token;
//     let chatName = req.body.chatName;
//     //console.log('location 1')
    
//     //console.log('location 3')
//     collectionUser.findOne({ token: token })
//         .then(async (user) => {

//             if (user === null) {

//                 res.status(403).json({ error: 'Unauthorized' });
//                 return;

//             }

//             let userId = user._id;
//             try {
//               // create a new thread in the chat collection
//               await collectionChat.insertOne({ userId, chatName });
//               let chat = await collectionChat.findOne({ userId, chatName });
//               let message = {
//                 role: 'system',
//                 content: 'please provide help to the user'
//               };
//               // create a new message in the message collection
//               collectionMessage.insertOne({ chatsId: chat._id, content: message })

//               res.json({ chatName: chatName });
//               return;

//             } catch (error) {

//               console.error('Error during thread creation:', error);
//               res.status(500).json({ error: error.message });
//               return;
//             };
            
//         })
//         .catch((error) => {

//             res.status(500).json({ error: error.message });
//             return;
//         });
// });

// app.get('/api/discution/get', async (req, res) => {

//   let token = req.headers.token;

//   await collectionUser.findOne({ token: token })
//       .then(async (user) => {

//           if (user === null) {

//               res.status(403).json({ error: 'Unauthorized' });
//               return;
//           };

//           try {

//             let userId = user._id;
//             let chats = await collectionChat.find({ userId }).toArray();
//             res.json({ chats });
//             return;


//           } catch (error) {
//             console.error('Error during thread creation:', error);
//             res.status(500).json({ error: error.message });
//             return;
//           };
//       });
  
// });

// app.post('/api/discution/delete', async (req, res) => {

//     let token = req.headers.token;
//     let _id = req.body.chatId;

//     await collectionUser.findOne({ token: token })
//         .then(async (user) => {

//             if (user === null) {

//                 res.status(403).json({ error: 'Unauthorized' });
//                 return;

//             };

//             try {

//               await collectionChat.deleteOne({ "_id": new ObjectId(_id) });
//               await collectionMessage.deleteOne({ chatsId: new ObjectId(_id) });

//               res.json({ status: 'success' });
//               return;

//             } catch (error) {
//               console.error('Error during chats deletion:', error);
//               res.status(500).json({ error: error.message });
//               return;
//             };
//         });
// });

/*=========================================CRUD Messages===========================================*/

// app.post('/api/message/get', async (req, res) => {
  
//       let token = req.headers.token;
//       let chatId = req.body.chatId;

//       await collectionUser.findOne({ token: token })
//           .then(async (user) => {
  
//               if (user === null) {
  
//                   res.status(403).json({ error: 'Unauthorized' });
//                   return;
  
//               };
//               try {
//                 let messages = await collectionMessage.findOne({chatsId: new ObjectId(chatId)})

//                 res.json({ messages });
//                 return;
//               } catch (error) {
//                 console.error('Error during message recuperation:', error);
//                 res.status(500).json({ error: error.message });
//                 return;
//               };
//           });
// });

// app.post('/api/message/new', async (req, res) => {
  
//       let token = req.headers.token;
//       let message = req.body.message;
//       let chatId = req.body.chatId;
//       let status = {
//         "twb": false,
//         "imf": false
//       };
      
//       await collectionUser.findOne({ token: token })
//           .then(async (user) => {
  
//               if (user === null) {
  
//                   res.status(403).json({ error: 'Unauthorized' });
//                   return;
  
//               };
  
//               try {

//                 // We get all the previous message in the chat
//                 let previousMessage = await collectionMessage.findOne({ chatsId: new ObjectId(chatId) });
//                 //console.log('Previous message:', previousMessage);
//                 previousMessage = JSON.stringify(previousMessage.content);
//                 let imfNumber = [];
//                 let twbNumber = [];
//                 let messageFormated = '';

//                 // get intel from private data
//                 // let privateData = await search(indexData, message);

//                 // Check for the IMF api
//                 let CC_IMF = await findCountryCodeIMF(message);
//                 CC_IMF = CC_IMF.replace(/\./g, '');

//                 if (CC_IMF.trim() != 'No' && CC_IMF.trim() != 'no') {
//                   console.log('step one')
//                   CC_IMF = convertToArray(CC_IMF);

//                   let EI_IMF = await findDataCodeIMF(message);

//                   let EI_IMFTest = EI_IMF.toString();
//                   EI_IMFTest = EI_IMFTest.replace(/\./g, '');
//                   console.log('EI_IMFTest:', EI_IMFTest);

//                   if (EI_IMFTest.trim() != 'No' && EI_IMFTest.trim() != 'no') {
//                     console.log('step two')
//                     console.log('IMF API is triggered');

//                     let valuesIMF = EI_IMF.response;
//                     valuesIMF = convertToArray(valuesIMF);

//                     let keysIMF = EI_IMF.response2.response;
//                     keysIMF = convertToArray(keysIMF);

//                     // We merge the key and the value to have a key value pair
//                     let mergedIMF = keysIMF.map((key, index) => {
//                       return { [key]: valuesIMF[index]};
//                     });

//                     // We get the data from the IMF api based on the country code and the economical indicator find earlier
//                     let dataIMF = await getIMFData(CC_IMF, keysIMF);
//                     dataIMF.forEach(key => {
//                       // use the merged array to change the key to the value in the data object
                      
//                       for (let i = 0; i < mergedIMF.length; i++) {
//                         let keyName = Object.keys(mergedIMF[i])[0];
//                         let value = mergedIMF[i][keyName];
//                         if (key[keyName] != undefined) {
//                           key[value] = key[keyName];
//                           delete key[keyName];
//                         }
//                       }
//                     })
//                     // we format the data from the imf to be send to the openai api
//                     dataIMF.forEach(element => {
//                       imfNumber.push(element);
//                     })
//                     imfNumber = JSON.stringify(imfNumber);
//                     status.imf = true;
//                   }
//                 }

//                 // Check for the TWB api
//                 let CC_TWB = await findCountryCodeTWB(message);
//                 CC_TWB = CC_TWB.replace(/\./g, '');

//                 if (CC_TWB.trim() != 'No' && CC_TWB.trim() != 'no') {
//                   console.log('step three')
//                     CC_TWB = convertToArray(CC_TWB);
  
//                     let EI_TWB = await findDataCodeTWB(message);
  
//                     let EI_TWBTest = EI_TWB.toString();
//                     EI_TWBTest = EI_TWBTest.replace(/\./g, '');
  
//                     if (EI_TWBTest.trim() != 'No' && EI_TWBTest.trim() != 'no') {
//                       console.log('step foour')
//                       console.log('TWB API is triggered');

//                       let valuesTWB = EI_TWB.response;
//                       valuesTWB = convertToArray(valuesTWB);
  
//                       let keysTWB = EI_TWB.response2.response;
//                       keysTWB = convertToArray(keysTWB);
  
//                       // We merge the key and the value to have a key value pair
//                       let mergedTWB = keysTWB.map((key, index) => {
//                         return { [key]: valuesTWB[index]};
//                       });
  
//                       // We get the data from the TWB api based on the country code and the economical indicator find earlier
//                       let dataTWB = await getTWBData(CC_TWB, keysTWB);
//                       dataTWB.forEach(key => {
//                         // use the merged array to change the key to the value in the data object
                        
//                         for (let i = 0; i < mergedTWB.length; i++) {
//                           let keyName = Object.keys(mergedTWB[i])[0];
//                           let value = mergedTWB[i][keyName];
//                           if (key[keyName] != undefined) {
//                             key[value] = key[keyName];
//                             delete key[keyName];
//                           }
//                         }
//                       })
//                       // we format the data from the twb to be send to the openai api
//                       dataTWB.forEach(element => {
//                         twbNumber.push(element);
//                       })
//                       twbNumber = JSON.stringify(twbNumber);
//                       status.twb = true;
//                     }
//                   }
                
//                 console.log('Status:', status);
//                 console.log(imfNumber)
//                 /* messageFormated = "Please analyze the following data to provide a numeric-based response: " + twbNumber + imfNumber + ". End of data section. Use relevant numbers to enhance your answer. Now, consider the historical context of this discussion for a better understanding: " + previousMessage + ". End of context section. Finally include the following contexte to improve even more your answer Based on the above information, respond to the following user query: " + message + ". Ensure your response integrates specific figures from the provided data where applicable."; */
//                 switch (true) { 

//                   case status.imf === true && status.twb === true:
//                     console.log('IMF and TWB APIs are triggered');
//                     messageFormated = "You are a world wide expert in e-export and e-commerce. Please answer the following input : " + message + ". In your answer you NEED to take into consideation all the following data&number and you MUST include number in your answer. They are relevent and usefull. Data&number : " + twbNumber + imfNumber + ". Also here is the historic of the previous message between you and the user :" + previousMessage + ".";
//                     break;
                    
//                   case status.twb === true && status.imf === false:
//                     console.log('TWB API is triggered');
//                     messageFormated = "You are a world wide expert in e-export and e-commerce. Please answer the following input : " + message + ". In your answer you NEED to take into consideation all the following data&number and you MUST include number in your answer. They are relevent and usefull. Data&number : " + twbNumber + ". Also here is the historic of the previous message between you and the user :" + previousMessage + ".";
//                     break;
                  
//                   case status.imf === true && status.twb === false:
//                     console.log('IMF API is triggered');
//                     messageFormated = "You are a world wide expert in e-export and e-commerce. Please answer the following input : " + message + ". In your answer you NEED to take into consideation all the following data&number and you MUST include number in your answer. They are relevent and usefull. Data&number : " + imfNumber + ". Also here is the historic of the previous message between you and the user :" + previousMessage + ".";
//                     break;

//                   case status.imf === false && status.twb === false:
//                     console.log('No API is triggered');
//                     messageFormated = "You are a world wide expert in e-export and e-commerce. Please answer the following input : " + message + ". Also here is the historic of the previous message between you and the user :" + previousMessage + ".";
//                     break;
//                 }

//                 // we send it to the openai api
//                 let response = await newMessage(messageFormated);
//                 let messageUser = { role: 'user', content: message};
//                 let messageBot = response.choices[0].message;
                
//                 let discution = await collectionMessage.findOne({ chatsId: new ObjectId(chatId) });

//                 // if the chat is new we create it (shouldn't happen anymore since we make sure theire is a chat before sending a message but just in case we keep it)
//                 if (discution === null) {
//                   console.log('No message found');
//                   await collectionMessage.insertOne({ chatsId: chatId, content: response.choices[0].message });
//                   res.json({ status: 'success' });
//                   return;
//                 } else {
//                   // Insert the user input and the bot response in the chat
//                   if (!Array.isArray(discution.content)) {
//                     discution.content = [discution.content]; 
//                   }
//                   discution.content.push(messageUser);
//                   discution.content.push(messageBot);
//                   await collectionMessage.updateOne({ chatsId: new ObjectId(chatId) }, { $set: { content: discution.content } });
//                   res.json({ id: chatId });
//                   return;
//                 } 
                 
//               } catch (error) {
//                 console.error('Error during message creation:', error);
//                 res.status(500).json({ error: error.message });
//                 return;
//               };
//           });
// });


// ========================================================================================================
// start the server
app.listen(port, () => {
    console.log('Server app listening on port ' + port);
});




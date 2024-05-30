import { ObjectId } from 'mongodb';
import { collectionMessage, collectionUser } from '../databases/mongoDb.js';
import { checkIMFapi } from '../embeding&api/api_imf.js';
import { checkTWBapi } from '../embeding&api/api_twb.js';
import { newMessage, streamMessage } from '../embeding&api/api_openai.js';
import indexPrivateData from '../utils/dataIndex.js'
import { search } from '../embeding&api/chroma.js';


const IPD = indexPrivateData;
class MessageController {

    async get (req, res) {
  
        let token = req.headers.authorization.split(' ')[1];
        let chatId = req.body.chatId;
    
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
    }

    async new (req, res) {
        
        let token = req.headers.authorization.split(' ')[1];
        let message = req.body.message;
        let chatId = req.body.chatId;
        let status = {
          "twb": false,
          "imf": false
        };
        
        await collectionUser.findOne({ token: token })
            .then(async (user) => {
    
                if (user === null) {
    
                    res.status(403).json({ error: 'Unauthorized' });
                    return;
    
                };
    
                try {
    
                  // We get all the previous message in the chat
                  let previousMessage = await collectionMessage.findOne({ chatsId: new ObjectId(chatId) });
                  //console.log('Previous message:', previousMessage);
                  previousMessage = JSON.stringify(previousMessage.content);
                  let messageFormated = '';
    
  
                  let imfData = await checkIMFapi(message, status);
                  let twbData = await checkTWBapi(message, status);
                  let privateData = await search(IPD, message)

                  Promise.all([
                    imfData,
                    twbData,
                    privateData
                  ]).then((values) => {
                    imfData = values[0];
                    twbData = values[1];
                    privateData = values[2];
                  });

                  console.log('Status:', status);
                  //console.log(privateData)
                  switch (true) { 
    
                    case status.imf === true && status.twb === true:
                      console.log('IMF and TWB APIs are triggered');
                      messageFormated = "You are a world wide expert in e-export and e-commerce working for to web or not to web. Please answer the following user input : " + message + ". Also here is the historic of the previous message between you and the user :" + previousMessage + ". To answer the input you can use the following resource :" + privateData + ". Here is the data from the IMF API :" + imfData + ". Here is the data from the TWB API :" + twbData;
                      break;
                      
                    case status.twb === true && status.imf === false:
                      console.log('TWB API is triggered');
                      messageFormated = "You are a world wide expert in e-export and e-commerce working for to web or not to web. Please answer the following user input : " + message + ". Also here is the historic of the previous message between you and the user :" + previousMessage + ". To answer the input you can use the following resource :" + privateData + ". Here is the data from the TWB API :" + twbData;
                      break;
                    
                    case status.imf === true && status.twb === false:
                      console.log('IMF API is triggered');
                      messageFormated = "You are a world wide expert in e-export and e-commerce working for to web or not to web. Please answer the following user input : " + message + ". Also here is the historic of the previous message between you and the user :" + previousMessage + ". To answer the input you can use the following resource :" + privateData + ". Here is the data from the IMF API :" + imfData;
                      break;
    
                    case status.imf === false && status.twb === false:
                      console.log('No API is triggered');
                      messageFormated = "You are a world wide expert in e-export and e-commerce working for to web or not to web. Please answer the following user input : " + message + ". Also here is the historic of the previous message between you and the user :" + previousMessage + ". To answer the input you can use the following resource :" + privateData;
                      break;
                  }
    
                  // we send it to the openai api
                  let response = await newMessage(messageFormated);
                  console.log('Response:', response);
                  let messageUser = { role: 'user', content: message};
                  let messageBot = response.choices[0].message;
                  
                  let discution = await collectionMessage.findOne({ chatsId: new ObjectId(chatId) });
    
                  // if the chat is new we create it (shouldn't happen anymore since we make sure theire is a chat before sending a message but just in case we keep it)
                  if (discution === null) {
                    console.log('No message found');
                    await collectionMessage.insertOne({ chatsId: chatId, content: response.choices[0].message });
                    res.json({ status: 'success' });
                    return;
                  } else {
                    // Insert the user input and the bot response in the chat
                    if (!Array.isArray(discution.content)) {
                      discution.content = [discution.content]; 
                    }
                    discution.content.push(messageUser);
                    discution.content.push(messageBot);
                    await collectionMessage.updateOne({ chatsId: new ObjectId(chatId) }, { $set: { content: discution.content } });
                    res.status(200).json({ id: chatId });
                    return;
                  } 
                   
                } catch (error) {
                  console.error('Error during message creation:', error);
                  res.status(500).json({ error: error.message });
                  return;
                };
            });
    }

    async pipeline(req, res) {
      let token = req.headers.authorization.split(' ')[1];
      let message = req.body.message;
      let chatId = req.body.chatId;
      let status = {
          "twb": false,
          "imf": false
      };

      try {
          let user = await collectionUser.findOne({ token: token });

          if (!user) {
              res.status(403).json({ error: 'Unauthorized' });
              return;
          }

          let previousMessage = await collectionMessage.findOne({ chatsId: new ObjectId(chatId) });
          previousMessage = previousMessage ? JSON.stringify(previousMessage.content) : "No previous messages.";
          let messageFormatted = '';

          let [imfData, twbData, privateData] = await Promise.all([
              checkIMFapi(message, status),
              checkTWBapi(message, status),
              search(IPD, message)
          ]);

          switch (true) {
              case status.imf && status.twb:
                  messageFormatted = `You are a worldwide expert in e-export and e-commerce working for to web or not to web. Please answer the following user input: ${message}. Also here is the history of the previous messages between you and the user: ${previousMessage}. To answer the input, you can use the following resources: ${privateData}. Here is the data from the IMF API: ${imfData}. Here is the data from the TWB API: ${twbData}`;
                  break;

              case status.twb:
                  messageFormatted = `You are a worldwide expert in e-export and e-commerce working for to web or not to web. Please answer the following user input: ${message}. Also here is the history of the previous messages between you and the user: ${previousMessage}. To answer the input, you can use the following resources: ${privateData}. Here is the data from the TWB API: ${twbData}`;
                  break;

              case status.imf:
                  messageFormatted = `You are a worldwide expert in e-export and e-commerce working for to web or not to web. Please answer the following user input: ${message}. Also here is the history of the previous messages between you and the user: ${previousMessage}. To answer the input, you can use the following resources: ${privateData}. Here is the data from the IMF API: ${imfData}`;
                  break;

              default:
                  messageFormatted = `You are a worldwide expert in e-export and e-commerce working for to web or not to web. Please answer the following user input: ${message}. Also here is the history of the previous messages between you and the user: ${previousMessage}. To answer the input, you can use the following resources: ${privateData}`;
                  break;
          }

          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Connection', 'keep-alive');

          await streamMessage(messageFormatted, chunk => {
            console.log(typeof chunk)
            console.log(chunk)
              res.write(chunk);
          });

          res.end();

      } catch (error) {
          console.error('Error during message creation:', error);
          res.status(500).json({ error: error.message });
      }
  }
    

}



// io.on('connectMessage', (socket) => {
              //   console.log('a user connected');
              //   console.log(chunk);
              //   socket.emit('streamMessage', chunk);
              // });

export default new MessageController();
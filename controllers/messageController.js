import { ObjectId } from 'mongodb';
import { collectionMessage, collectionUser } from '../databases/mongoDb.js';
import { newMessage, streamMessage } from '../embeding&api/api_openai.js';
import { searchPrivateData, libChap, libCountry } from '../databases/pineconeDb.js';
import { DiscussionController } from './discussionController.js';


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
    
                  //TODO new logic to format the message 
                 
    
                  // we send it to the openai api
                  let response = await newMessage(messageFormated);
                  //console.log('Response:', response);
                  let messageUser = { role: 'user', content: message};
                  let messageBot = response.choices[0].message;
                  
                  let discution = await collectionMessage.findOne({ chatsId: new ObjectId(chatId) });
    
                  // if the chat is new we create it (shouldn't happen anymore since we make sure theire is a chat before sending a message but just in case we keep it)
                  if (discution === null) {
                    //console.log('No message found');
                    await collectionMessage.insertOne({ chatsId: chatId, content: response.choices[0].message });
                    res.status(200).json({ status: 'success' });
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
     

      try {
          let user = await collectionUser.findOne({ token: token });

          if (!user) {
              res.status(403).json({ error: 'Unauthorized' });
              return;
          }
 
          if (chatId === null) {

          }

          let previousMessage = await collectionMessage.findOne({ chatsId: new ObjectId(chatId) });
          previousMessage = previousMessage ? previousMessage.content : "No previous messages.";
          console.log('Previous message:');
          console.log(previousMessage);
          let messageFormatted = '';
          let context = "";
          if (previousMessage.length >= 2) {
              context = previousMessage[previousMessage.length - 2].content + ' ' + previousMessage[previousMessage.length - 1].content;
          } else if (previousMessage.length === 1) {
              context = previousMessage[0].content;
          };
          console.log('Context:', context);

          const privateData = [];
          libChap.forEach(async (lib) => {
            lib.chapter.forEach(async (chap) => {
                let response = await searchPrivateData(message, lib.name, chap);
                privateData.push(response);
                // console.log('Private data of chap :' + chap + 'is :' , privateData);
            });
          });

          //console.log('Private data:', privateData);
          messageFormatted = `As a global expert in e-commerce and e-export at 'To Web or Not To Web,' respond to the user's inquiry: ${message}. You will answer in the language used by the user. Review the previous conversation history with the user for additional context: ${context}. Becarefull theire might not always be historic to review but it's okay. Utilize the available resources for your response: ${privateData}. You need to give a human like answer. The user needs to have the feeling he is talking to another human, be professional and polite.`;

          res.status(200).setHeader('Content-Type', 'text/event-stream');
          res.status(200).setHeader('Cache-Control', 'no-cache');
          res.status(200).setHeader('Connection', 'keep-alive');
          //console.log('Message formatted:', messageFormatted);
          await streamMessage(messageFormatted, chunk => {
            res.status(200).write(chunk);
          });

          res.status(200).end();

      } catch (error) {
          console.error('Error during message creation:', error);
          res.status(500).json({ error: error.message });
      }
  }
    
  async saveMessage(req, res) {
    //console.log('Save message');
    //console.log(req.body);
    let token = req.headers.authorization.split(' ')[1];
    let message = req.body.message;
    let chatId = req.body.chatId;
    //console.log('Message to save:');
    //console.log(message);

    await collectionUser.findOne({ token: token })
    .then(async (user) => {

        if (user === null) {

            res.status(403).json({ error: 'Unauthorized' });
            return;

        };

        try {
          let messageUser = { role: 'user', content: message[0]};
          let messageBot = { role: 'bot', content: message[1]};
          console.log('Chat ID:');
          console.log(chatId);
          let discution = await collectionMessage.findOne({ chatsId: new ObjectId(chatId) });
          console.log('Discussion: ');
          console.log(discution);
          if (!Array.isArray(discution.content)) {
            discution.content = [discution.content]; 
          }
          discution.content.push(messageUser);
          discution.content.push(messageBot);
          await collectionMessage.updateOne({ chatsId: new ObjectId(chatId) }, { $set: { content: discution.content } });
          res.status(200).json({ id: chatId });
          return;

        } catch (error) {
            console.error('Error during message save:', error);
            res.status(500).json({ error: error.message });
            return;
        };
      });

  }

}


export default new MessageController();
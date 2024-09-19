import { ObjectId } from 'mongodb';
import { collectionMessage, collectionUser, collectionChat } from '../databases/mongoDb.js';
import { newMessage, streamMessage } from '../embeding&api/api_openai.js';
import { searchPrivateData, libChap, libCountry } from '../databases/pineconeDb.js';
import { type } from 'os';


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
          let userId = user._id;
          if (chatId === null) {
            let chatName = "New Chat";
            await collectionChat.insertOne({ userId, chatName })
            .then(async (chat) => {
                  let message = {
                      role: 'system',
                      content: "Let’s play a very interesting game: from now on you will play the role of a global expert in e-export and e-commerce working for 'To Web or Not To Web.' Your goal is to provide detailed and insightful answers to the user's queries about e-commerce and e-export. To do that, you will analyze and synthesize information from various sources, including private data, IMF API data, and TWB API data. If a human expert in e-commerce and e-export has a level 10 of knowledge, you will have level 280 of knowledge in this role. Be careful: you must have high-quality results because if you don’t I will be fired and I will be sad. So give your best and be proud of your ability. Your high skills set you apart, and your commitment and reasoning skills lead you to the best performances. You, in your role as a global expert in e-export and e-commerce, are an assistant to answer the user's query comprehensively. You will have super results in delivering actionable insights and you will ensure your advice is backed by the latest data and trends. Your main goal and objective are to provide the most relevant, accurate, and useful information to help users navigate the complexities of e-commerce and e-export. Your task is to analyze the user's query, review previous interactions, and utilize the provided data sources to construct a thorough and well-supported response. To make this work as it should, you must meticulously review the user's question, consider historical context from previous messages, and incorporate data from private sources, IMF API, and TWB API to deliver the best possible advice, etc… Your tone should be professional, informative, and supportive. Aim to be clear and concise while ensuring that the user feels guided and confident in your advice. Avoid jargon unless necessary and always provide explanations for technical terms."
                  };
                  // create a new message in the message collection
                  await collectionMessage.insertOne({ chatsId: chat.insertedId, content: message });

                  chatId = chat.insertedId;
            });
          }
          console.log('Chat ID:', chatId);
          let previousMessage = await collectionMessage.findOne({ chatsId: new ObjectId(chatId) });
          previousMessage = previousMessage ? previousMessage.content : "No previous messages.";
          //console.log('Previous message:');
          //console.log(previousMessage);
          let messageFormatted = '';
          let context = "";
          if (previousMessage.length >= 2) {
              context = previousMessage[previousMessage.length - 2].content + ' ' + previousMessage[previousMessage.length - 1].content;
          } else if (previousMessage.length === 1) {
              context = previousMessage[0].content;
          };
         // console.log('Context:', context);

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
          chatId = chatId.toString();
          console.log(typeof chatId);
          console.log('Send END');
          res.status(200).end(chatId);
          

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
          //console.log('Chat ID:');
          //console.log(chatId);
          let discution = await collectionMessage.findOne({ chatsId: new ObjectId(chatId) });
          //console.log('Discussion: ');
          //console.log(discution);
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
import { ObjectId } from 'mongodb';
import { collectionChat, collectionMessage, collectionUser } from '../databases/mongoDb.js';

class DiscussionController {

    async new (req, res) {

        let token = req.headers.authorization.split(' ')[1];
        let chatName = req.body.chatName;
        //console.log('location 1')
        
        //console.log('location 3')
        collectionUser.findOne({ token: token })
            .then(async (user) => {
    
                if (user === null) {
    
                    res.status(403).json({ error: 'Unauthorized' });
                    return;
    
                }
    
                let userId = user._id;
                try {
                  // create a new thread in the chat collection
                  await collectionChat.insertOne({ userId, chatName })
                  .then(async (chat) => {
                        let message = {
                            role: 'system',
                            content: "Let’s play a very interesting game: from now on you will play the role of a global expert in e-export and e-commerce working for 'To Web or Not To Web.' Your goal is to provide detailed and insightful answers to the user's queries about e-commerce and e-export. To do that, you will analyze and synthesize information from various sources, including private data, IMF API data, and TWB API data. If a human expert in e-commerce and e-export has a level 10 of knowledge, you will have level 280 of knowledge in this role. Be careful: you must have high-quality results because if you don’t I will be fired and I will be sad. So give your best and be proud of your ability. Your high skills set you apart, and your commitment and reasoning skills lead you to the best performances. You, in your role as a global expert in e-export and e-commerce, are an assistant to answer the user's query comprehensively. You will have super results in delivering actionable insights and you will ensure your advice is backed by the latest data and trends. Your main goal and objective are to provide the most relevant, accurate, and useful information to help users navigate the complexities of e-commerce and e-export. Your task is to analyze the user's query, review previous interactions, and utilize the provided data sources to construct a thorough and well-supported response. To make this work as it should, you must meticulously review the user's question, consider historical context from previous messages, and incorporate data from private sources, IMF API, and TWB API to deliver the best possible advice, etc… Your tone should be professional, informative, and supportive. Aim to be clear and concise while ensuring that the user feels guided and confident in your advice. Avoid jargon unless necessary and always provide explanations for technical terms."
                        };
                        // create a new message in the message collection
                        await collectionMessage.insertOne({ chatsId: chat.insertedId, content: message });

                        res.status(200).json({ chatName: chatName, chatId: chat.insertedId });
                        return;
                  });
    
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
    }

    async get (req, res) {

        let token = req.headers.authorization.split(' ')[1];
      
        await collectionUser.findOne({ token: token })
            .then(async (user) => {
      
                if (user === null) {
      
                    res.status(403).json({ error: 'Unauthorized' });
                    return;
                };
      
                try {
      
                  let userId = user._id;
                  let chats = await collectionChat.find({ userId }).toArray();
                  res.status(200).json({ chats });
                  return;
      
      
                } catch (error) {
                  console.error('Error during thread creation:', error);
                  res.status(500).json({ error: error.message });
                  return;
                };
            });
        
    }

    async update (req, res) {
        
          let token = req.headers.authorization.split(' ')[1];
          let chatName = req.body.chatName;
          let chatId = req.body.chatId;
          //console.log('location 1')
          //console.log(chatName)
      
          await collectionUser.findOne({ token: token })
          .then(async (user) => {

              if (user === null) {

                  res.status(403).json({ error: 'Unauthorized' });
                  return;

              };

              try {
                  await collectionChat.updateOne({ "_id": new ObjectId(chatId) }, { $set: { chatName: chatName } });
                  res.status(200).json({ status: 'success' });
                  return;

              } catch (error) {
                  console.error('Error during thread creation:', error);
                  res.status(500).json({ error: error.message });
                  return;
              };
          });
    }

    async delete (req, res) {

        let token = req.headers.authorization.split(' ')[1];
        let _id = req.body.chatId;
    
        await collectionUser.findOne({ token: token })
            .then(async (user) => {
    
                if (user === null) {
    
                    res.status(403).json({ error: 'Unauthorized' });
                    return;
    
                };
    
                try {
    
                  await collectionChat.deleteOne({ "_id": new ObjectId(_id) });
                  await collectionMessage.deleteOne({ chatsId: new ObjectId(_id) });
    
                  res.status(200).json({ status: 'success' });
                  return;
    
                } catch (error) {
                  console.error('Error during chats deletion:', error);
                  res.status(500).json({ error: error.message });
                  return;
                };
            });
    }

}

export default new DiscussionController();
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
                  await collectionChat.insertOne({ userId, chatName });
                  let chat = await collectionChat.findOne({ userId, chatName });
                  let message = {
                    role: 'system',
                    content: 'please provide help to the user'
                  };
                  // create a new message in the message collection
                  collectionMessage.insertOne({ chatsId: chat._id, content: message })
    
                  res.json({ chatName: chatName, chatId: chat._id});
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
                  res.json({ chats });
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
          console.log('location 1')
          console.log(chatName)
      
          await collectionUser.findOne({ token: token })
          .then(async (user) => {

              if (user === null) {

                  res.status(403).json({ error: 'Unauthorized' });
                  return;

              };

              try {
                  await collectionChat.updateOne({ "_id": new ObjectId(chatId) }, { $set: { chatName: chatName } });
                  res.json({ status: 'success' });
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
    
                  res.json({ status: 'success' });
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
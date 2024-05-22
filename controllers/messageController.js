import { ObjectId } from 'mongodb';
import { collectionMessage, collectionUser } from '../databases/mongoDb.js';
import { findCountryCodeIMF, findDataCodeIMF, findCountryCodeTWB, findDataCodeTWB } from '../embeding&api/llama.js';
import { getIMFData } from '../embeding&api/api_imf.js';
import { getTWBData } from '../embeding&api/api_twb.js';
import { newMessage } from '../embeding&api/api_openai.js';
import { convertToArray } from '../utils/toArray.js';
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
                  let imfNumber = [];
                  let twbNumber = [];
                  let messageFormated = '';
    
                  // get intel from private data
                  // let privateData = await search(indexData, message);
    
                  // Check for the IMF api
                  let CC_IMF = await findCountryCodeIMF(message);
                  CC_IMF = CC_IMF.replace(/\./g, '');
    
                  if (CC_IMF.trim() != 'No' && CC_IMF.trim() != 'no') {
                    console.log('step one')
                    CC_IMF = convertToArray(CC_IMF);
    
                    let EI_IMF = await findDataCodeIMF(message);
    
                    let EI_IMFTest = EI_IMF.toString();
                    EI_IMFTest = EI_IMFTest.replace(/\./g, '');
                    console.log('EI_IMFTest:', EI_IMFTest);
    
                    if (EI_IMFTest.trim() != 'No' && EI_IMFTest.trim() != 'no') {
                      console.log('step two')
                      console.log('IMF API is triggered');
    
                      let valuesIMF = EI_IMF.response;
                      valuesIMF = convertToArray(valuesIMF);
    
                      let keysIMF = EI_IMF.response2.response;
                      keysIMF = convertToArray(keysIMF);
    
                      // We merge the key and the value to have a key value pair
                      let mergedIMF = keysIMF.map((key, index) => {
                        return { [key]: valuesIMF[index]};
                      });
    
                      // We get the data from the IMF api based on the country code and the economical indicator find earlier
                      let dataIMF = await getIMFData(CC_IMF, keysIMF);
                      dataIMF.forEach(key => {
                        // use the merged array to change the key to the value in the data object
                        
                        for (let i = 0; i < mergedIMF.length; i++) {
                          let keyName = Object.keys(mergedIMF[i])[0];
                          let value = mergedIMF[i][keyName];
                          if (key[keyName] != undefined) {
                            key[value] = key[keyName];
                            delete key[keyName];
                          }
                        }
                      })
                      // we format the data from the imf to be send to the openai api
                      dataIMF.forEach(element => {
                        imfNumber.push(element);
                      })
                      imfNumber = JSON.stringify(imfNumber);
                      status.imf = true;
                    }
                  }
    
                  // Check for the TWB api
                  let CC_TWB = await findCountryCodeTWB(message);
                  CC_TWB = CC_TWB.replace(/\./g, '');
    
                  if (CC_TWB.trim() != 'No' && CC_TWB.trim() != 'no') {
                    console.log('step three')
                      CC_TWB = convertToArray(CC_TWB);
    
                      let EI_TWB = await findDataCodeTWB(message);
    
                      let EI_TWBTest = EI_TWB.toString();
                      EI_TWBTest = EI_TWBTest.replace(/\./g, '');
    
                      if (EI_TWBTest.trim() != 'No' && EI_TWBTest.trim() != 'no') {
                        console.log('step foour')
                        console.log('TWB API is triggered');
    
                        let valuesTWB = EI_TWB.response;
                        valuesTWB = convertToArray(valuesTWB);
    
                        let keysTWB = EI_TWB.response2.response;
                        keysTWB = convertToArray(keysTWB);
    
                        // We merge the key and the value to have a key value pair
                        let mergedTWB = keysTWB.map((key, index) => {
                          return { [key]: valuesTWB[index]};
                        });
    
                        // We get the data from the TWB api based on the country code and the economical indicator find earlier
                        let dataTWB = await getTWBData(CC_TWB, keysTWB);
                        dataTWB.forEach(key => {
                          // use the merged array to change the key to the value in the data object
                          
                          for (let i = 0; i < mergedTWB.length; i++) {
                            let keyName = Object.keys(mergedTWB[i])[0];
                            let value = mergedTWB[i][keyName];
                            if (key[keyName] != undefined) {
                              key[value] = key[keyName];
                              delete key[keyName];
                            }
                          }
                        })
                        // we format the data from the twb to be send to the openai api
                        dataTWB.forEach(element => {
                          twbNumber.push(element);
                        })
                        twbNumber = JSON.stringify(twbNumber);
                        status.twb = true;
                      }
                    }
                  
                  console.log('Status:', status);
                  console.log(imfNumber)
                  /* messageFormated = "Please analyze the following data to provide a numeric-based response: " + twbNumber + imfNumber + ". End of data section. Use relevant numbers to enhance your answer. Now, consider the historical context of this discussion for a better understanding: " + previousMessage + ". End of context section. Finally include the following contexte to improve even more your answer Based on the above information, respond to the following user query: " + message + ". Ensure your response integrates specific figures from the provided data where applicable."; */
                  switch (true) { 
    
                    case status.imf === true && status.twb === true:
                      console.log('IMF and TWB APIs are triggered');
                      messageFormated = "You are a world wide expert in e-export and e-commerce. Please answer the following input : " + message + ". In your answer you NEED to take into consideation all the following data&number and you MUST include number in your answer. They are relevent and usefull. Data&number : " + twbNumber + imfNumber + ". Also here is the historic of the previous message between you and the user :" + previousMessage + ".";
                      break;
                      
                    case status.twb === true && status.imf === false:
                      console.log('TWB API is triggered');
                      messageFormated = "You are a world wide expert in e-export and e-commerce. Please answer the following input : " + message + ". In your answer you NEED to take into consideation all the following data&number and you MUST include number in your answer. They are relevent and usefull. Data&number : " + twbNumber + ". Also here is the historic of the previous message between you and the user :" + previousMessage + ".";
                      break;
                    
                    case status.imf === true && status.twb === false:
                      console.log('IMF API is triggered');
                      messageFormated = "You are a world wide expert in e-export and e-commerce. Please answer the following input : " + message + ". In your answer you NEED to take into consideation all the following data&number and you MUST include number in your answer. They are relevent and usefull. Data&number : " + imfNumber + ". Also here is the historic of the previous message between you and the user :" + previousMessage + ".";
                      break;
    
                    case status.imf === false && status.twb === false:
                      console.log('No API is triggered');
                      messageFormated = "You are a world wide expert in e-export and e-commerce. Please answer the following input : " + message + ". Also here is the historic of the previous message between you and the user :" + previousMessage + ".";
                      break;
                  }
    
                  // we send it to the openai api
                  let response = await newMessage(messageFormated);
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
                    res.json({ id: chatId });
                    return;
                  } 
                   
                } catch (error) {
                  console.error('Error during message creation:', error);
                  res.status(500).json({ error: error.message });
                  return;
                };
            });
    }

}

export default new MessageController();
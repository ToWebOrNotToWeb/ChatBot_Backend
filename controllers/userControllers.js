import { collectionUser, collectionPicture } from '../databases/mongoDb.js';
import { hashPassword } from '../utils/bcrypt.js';
import { ObjectId } from 'mongodb';
class UserController {

    async showProfile (req, res) {

        let token = req.headers.authorization.split(' ')[1];

    
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
    }

    async showPicture (req, res) {
        
        let token = req.headers.authorization.split(' ')[1];
        
        
        await collectionUser.findOne({ token: token })
            .then(async (user) => {
        
                if (user === null) {
        
                    res.status(403).json({ error: 'Unauthorized' });
                    return;
        
                };
        
                try {
        
                  //console.log('User found :', user);
                  let pp = await collectionPicture.findOne({ userId : new ObjectId(user._id) });
                  if (pp === null) {
                    //console.log('No picture found');
                    // if the user don't have any profile picture we return the name of the user, in the front we will display the first letter in capital  
                    res.json({ result: user.name });
                    return;
                  }
                  //console.log('Picture found');
                  // we return the picture and the extention
                  res.json({result: pp.imgBase64, extention: pp.extention});
                  return;
        
                } catch (error) {
        
                  console.error('Error during picture retreaval :', error);
                  res.status(500).json({ error: error.message });
                  return;
        
                };
            });
    }

    async updateProfile (req, res) {

        let token = req.headers.authorization.split(' ')[1];
        let name = req.body.name;
        let email = req.body.email;
        let password = req.body.password;
      
        await collectionUser.findOne({ token: token })
            .then(async (user) => {
      
                if (user === null) {
      
                    res.status(403).json({ error: 'Unauthorized' });
                    return;
      
                };
      
                try {
                  // update the user's profile information if provided
                  if (name != '') {
                    await collectionUser.updateOne({ token: token }, { $set: { name: name } });
                  }
      
                  if (email != '') {
                    await collectionUser.updateOne({ token: token }, { $set: { email: email } });
                  }
      
                  if (password != '') {
                    const hashedPassword = await hashPassword(password);
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
    }

    async updatePicture (req, res) {
    //console.log('Proceding to update picture ');
    
    let token = req.headers.authorization.split(' ')[1];
    let imgBase64 = req.body.picture;
    let extention = req.body.extention;
    
    await collectionUser.findOne({ token: token })
        .then(async (user) => {
    
            if (user === null) {
    
                res.status(403).json({ error: 'Unauthorized' });
                return;
    
            };
    
            try {
    
                // check if the user already has a picture
                let pp = await collectionPicture.findOne({ userId : new ObjectId(user._id) });
    
                if (pp === null) {
                // he don't have one so we create one
                await collectionPicture.insertOne({ userId : new ObjectId(user._id), imgBase64 : imgBase64, extention : extention});
                res.json({ status: 'success' });
                return;
                } else {
                // he already have one so we update it
                await collectionPicture.updateOne({ userId : new ObjectId(user._id) }, { $set: { imgBase64 : imgBase64, extention : extention } });
                res.json({ status: 'success' });
                return;
                }
                
    
            } catch (error) {
    
                console.error('Error during user update:', error);
                res.status(500).json({ error: error.message });
                return;
    
            };
        });
    
    }

    async deleteProfile (req, res) {
        let token = req.headers.authorization.split(' ')[1];
        let confirm = req.body.confirm;
        
        await collectionUser.findOne({ token: token })
            .then(async (user) => {
        
                if (user === null) {
        
                    res.status(403).json({ error: 'Unauthorized' });
                    return;
        
                };
        
                try {
                    // check that the user confirmed
                    if (confirm === 'DELETE') {
        
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
    }

}

export default new UserController();
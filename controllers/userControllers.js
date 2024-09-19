import { collectionUser, collectionPicture } from '../databases/mongoDb.js';
import { hashPassword } from '../utils/bcrypt.js';
import { ObjectId } from 'mongodb';
import { generateJwtToken } from '../utils/jwt.js';
import { imageToBase64 } from '../utils/base64.js';
class UserController {

    async showProfile (req, res) {

        let token = req.headers.authorization.split(' ')[1];

    
        await collectionUser.findOne({ token: token })
            .then((user) => {
    
                if (user === null) {
    
                    res.status(403).json({ error: 'Unauthorized' });
                    return;
    
                };
    
                res.status(200).json({ name: user.name, email: user.email });
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
                  
                  //console.log('Picture found');
                  // we return the picture and the extention
                  res.status(200).json({result: pp.imgBase64, extention: pp.extention});
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
        let newToken = null;
      
        await collectionUser.findOne({ token: token })
            .then(async (user) => {
      
                if (user === null) {
      
                    res.status(403).json({ error: 'Unauthorized' });
                    return;
      
                };
      
                try {
                  // update the user's profile information if provided
                  if (name != '') {
                    if (name.length < 3) {
                      res.status(406).json({ error: 'Name must be at least 3 characters long' });
                      return;
                    }
                    await collectionUser.updateOne({ token: token }, { $set: { name: name } });
                  }
      
                  if (email != '') {
                    await collectionUser.findOne({ email: email })
                        .then(async (user) => {
                            if (user != null) {
                                res.status(409).json({ error: 'Email already in use' });
                                return;
                            }
                            
                            if (email.length < 3 && email.indexOf('@') === -1 && email.indexOf('.') === -1) {
                                res.status(406).json({ error: 'Email must be valid and contain an @ and a .' });
                                return;
                            }

                            await collectionUser.updateOne({ token: token }, { $set: { email: email } })
                            .then(async () => {
                                newToken = await generateJwtToken(email);
                                await collectionUser.updateOne({ token: token }, { $set: { token: newToken } });
                            });

                        });

                  }
      
                  if (password != '') {
                    if (password.length < 8 || password.search(/[a-z]/) === -1 || password.search(/[A-Z]/) === -1 || password.search(/[0-9]/) === -1 || password.search(/[^a-zA-Z0-9]/) === -1) {
                        res.status(406).json({ error: 'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character' });
                        return;
                    }
                    const hashedPassword = await hashPassword(password);
                    await collectionUser.updateOne({ token: token }, { $set: { hashedPassword: hashedPassword } });
                  }
                  if (newToken != null) {
                    res.status(200).json({ token: newToken });
                    return;
                  }
                  res.status(200).json({ status: 'success' });
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
    let imgBase64 = req.body.imgBase64;
    let extention = req.body.extention;

    // console.log('imgBase64 :', imgBase64);
    // console.log('extention :', extention);
    
    await collectionUser.findOne({ token: token })
        .then(async (user) => {
    
            if (user === null) {
    
                res.status(403).json({ error: 'Unauthorized' });
                return;
    
            };
    
            try {
    
                //we update it
                await collectionPicture.updateOne({ userId : new ObjectId(user._id) }, { $set: { imgBase64 : imgBase64, extention : extention } });
                res.status(200).json({ status: 'success' });
                return;
    
            } catch (error) {
    
                console.error('Error during user update:', error);
                res.status(500).json({ error: error.message });
                return;
    
            };
        });
    
    }

    async deleteProfile (req, res) {
        let token = req.headers.authorization.split(' ')[1];
        
        await collectionUser.findOne({ token: token })
            .then(async (user) => {
        
                if (user === null) {
        
                    res.status(403).json({ error: 'Unauthorized' });
                    return;
        
                };
        
                try {
                    
                    await collectionUser.deleteOne({ token: token });
                    res.status(200).json({ status: 'success' });
                    return;
        
                } catch (error) {
        
                    console.error('Error during user deletion:', error);
                    res.status(500).json({ error: error.message });
                    return;
        
                };
            });
    }

    async deletePicture (req, res) {
        let token = req.headers.authorization.split(' ')[1];
        
        await collectionUser.findOne({ token: token })
            .then(async (user) => {
        
                if (user === null) {
        
                    res.status(403).json({ error: 'Unauthorized' });
                    return;
        
                };
        
                try {
                    //console.log('Proceding to delete picture ');
                    let profilePictureUrl = './img/defaultProfilePicture.png';
                    let extention = 'png';
                    let imgBase64 = await imageToBase64(profilePictureUrl);

                    await collectionPicture.updateOne({ userId : new ObjectId(user._id) }, { $set: { imgBase64 : imgBase64, extention : extention } });
                    res.status(200).json({ status: 'success' });
                    return;
        
                } catch (error) {
        
                    console.error('Error during user deletion:', error);
                    res.status(500).json({ error: error.message });
                    return;
        
                };
            });
    } 

}

export default new UserController();
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import { generateJwtToken } from '../utils/jwt.js';
import { collectionUser } from '../databases/mongoDb.js';

class AuthController {

    async register (req, res) {
        //console.log('Proceding to register :' + req.body.name)
        res.json({'error' : 'We are not accepting new users at the moment. Please try again later.'});
        return;
          let name = req.body.name;
          let email = req.body.email;
          let password = req.body.password;

          if (name.length < 3) {
            res.status(406).json({ error: 'Name must be at least 3 characters long' });
            return;
          };

          if (email.length < 3) {
            res.status(406).json({ error: 'Email must be at least 3 characters long' });
            return;
          };

          if (email.indexOf('@') === -1) {
            res.status(406).json({ error: 'Email must contain an @' });
            return;
          };

          if (email.indexOf('.') === -1) {
            res.status(406).json({ error: 'Email must contain a .' });
            return;
          };

          if (password.length < 8 || password.search(/[a-z]/) === -1 || password.search(/[A-Z]/) === -1 || password.search(/[0-9]/) === -1 || password.search(/[^a-zA-Z0-9]/) === -1) {
            res.status(406).json({ error: 'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character' });
            return;
          };

          // hash the password
          const hashedPassword = await hashPassword(password);
      
          // generate a JWT token valid for one hour
          let token = await generateJwtToken(email);
      
          // make sure the user does not already exist
          let query = { email: email };
          let result = await collectionUser.findOne(query);
      
          if (result != null) {
      
            res.status(409).json({ error: 'User already exists' });
            return;
      
          } else {
      
            try {
      
              await collectionUser.insertOne({ name, email, hashedPassword, token, admin: false });
              res.status(200).json({ 'token': token });
      
            } catch (error) {
      
              console.error('Error during user registration:', error);
              res.status(500).json({ status: 'error' });
      
            };
          };
    }

    async login (req, res) {
        try {
            //console.log('Proceding to login :' + req.body.email)
    
            let email = req.body.email;
            let password = req.body.password;
            // make sure the user exists
            let query = { email: email};

            let result = await collectionUser.findOne(query);
            //console.log('User found:', result);
            if (result != null) {
                // check the password
                let match =  await comparePassword(password, result.hashedPassword)
                //console.log('Password match:', match);
                if (match) {
        
                    //generate a new token valid for one hours
                    let newToken = await generateJwtToken(email);
                    await collectionUser.updateOne({ email: email }, { $set: { token: newToken } });
        
                    //console.log('User logged in successfully');
                    res.status(200).json({ 'token': newToken });
                    return;
        
                } else {
        
                    //console.log('Invalid credentials');
                    res.status(401).json({ error: 'Invalid credentials' });
                    return;
                }
        
            } else {
        
                //console.log('Invalid credentials');
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            };
        } catch (error) {
            //console.error('Error during user login:', error);
            res.status(500).json({ status: 'error' });
            return;
        }
    }
    
}

export default new AuthController();
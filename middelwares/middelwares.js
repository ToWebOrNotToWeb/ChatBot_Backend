import jsonwebtoken from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();
// ========================================================================================================
// verify if the token is expired or not ( 3 hours )
function verifyJwtToken(req, res, next) {
    try {
        const token = req.headers.authorization.split(' ')[1];

        const secret = process.env.JWT_SECRET;

        const payload = jsonwebtoken.verify(token, secret);

        const currentTime = Math.floor(Date.now() / 1000);

        const issuedAtTime = payload.iat;
        
        const isValid = (currentTime - issuedAtTime) < 86400; //86400=1j 3600=1h
        //sconsole.log('isValid :', isValid);
        if (isValid) {
            //console.log('Token is valid');
            next();
        } else {
            //console.log('Token is expired');
            return res.status(401).json({ message: 'Token is expired' });
        }
        
    } catch (error) {
        //console.error('Error verifying JWT token:', error);
        return res.status(401).json({ message: 'Token malformed' });
    }
};

export { verifyJwtToken };
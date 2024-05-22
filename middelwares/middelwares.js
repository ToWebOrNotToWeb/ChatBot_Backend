import jsonwebtoken from 'jsonwebtoken';
import * as dotenv from 'dotenv';

// ========================================================================================================
// verify if the token is expired or not ( 3 hours )
function verifyJwtToken(req, res, next) {
    try {
        const token = req.headers.authorization.split(' ')[1];

        const secret = process.env.JWT_SECRET;

        const payload = jsonwebtoken.verify(token, secret);

        const currentTime = Math.floor(Date.now() / 1000);

        const issuedAtTime = payload.iat;
        
        const isValid = (currentTime - issuedAtTime) < 10800; //86400=1j 3600=1h

        if (isValid) {
            next();
        } else {
            return res.status(401).json({ message: 'Token is expired' });
        }
        
    } catch (error) {
        console.error('Error verifying JWT token:', error);
        return false;
    }
};

export { verifyJwtToken };
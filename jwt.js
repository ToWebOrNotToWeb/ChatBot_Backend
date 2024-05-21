import jsonwebtoken from 'jsonwebtoken';
import * as dotenv from 'dotenv';

async function generateJwtToken(payload) {

    const secret = process.env.JWT_SECRET;
    const token = jsonwebtoken.sign({email: payload}, secret);

    return token;
};

function verifyJwtToken(token) {
    try {

        const secret = process.env.JWT_SECRET;

        const payload = jsonwebtoken.verify(token, secret);

        const currentTime = Math.floor(Date.now() / 1000);

        const issuedAtTime = payload.iat;
        
        const isValid = (currentTime - issuedAtTime) < 3600; //86400=1j 3600=1h

        return isValid; 
        
    } catch (error) {
        console.error('Error verifying JWT token:', error);
        return false;
    }
};

export { generateJwtToken, verifyJwtToken };
import jsonwebtoken from 'jsonwebtoken';
import * as dotenv from 'dotenv';

async function generateJwtToken(payload) {

    const secret = process.env.JWT_SECRET;
    const token = jsonwebtoken.sign({email: payload}, secret);

    return token;
};

async function verifyJwtToken(token) {
    //console.log('start verify jwt')
    try {
        //console.log('inside Try')
        const secret = process.env.JWT_SECRET;
        // console.log('secret')
        // console.log(secret)
        const payload = jsonwebtoken.verify(token, secret);
        // console.log('payload')
        // console.log(payload)
        
        const currentTime = Math.floor(Date.now() / 1000);
        // console.log('current Time')
        // console.log(currentTime)
        const issuedAtTime = payload.iat;
        // console.log('issued at Time')
        // console.log(issuedAtTime)
        
        const isLessThan24Hours = (currentTime - issuedAtTime) < 86400; //86400
        //console.log('isLessThan24Hours')
        //console.log(isLessThan24Hours)
        return isLessThan24Hours; 
    } catch (error) {
        console.error('Error verifying JWT token:', error);
        return false;
    }
};

export { generateJwtToken, verifyJwtToken };
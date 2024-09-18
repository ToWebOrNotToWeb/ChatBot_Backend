import { hashPassword } from '../utils/bcrypt.js';
import { generateJwtToken } from '../utils/jwt.js';
import { collectionUser, collectionMessage, collectionPicture } from '../databases/mongoDb.js';
import { imageToBase64 } from '../utils/base64.js';
import * as dotenv from 'dotenv';

dotenv.config();

async function deleteUserFixture() {
    try {
        for (let i = 0; i < 5; i++) {
            let user = await collectionUser.findOne({ email: `user${i}gmail.com` });
            await collectionPicture.deleteMany({ userId : user._id });
            let chats = await collectionChat.find({ userId: user._id }).toArray();
            await collectionChat.deleteMany({ userId : user._id });
            chats.forEach(async chat => {
                await collectionMessage.deleteMany({ chatId: chat._id });
            });
            await collectionUser.deleteMany({ email: `user${i}gmail.com` })
        }
    } catch (error) {
        console.error('Error during user deletion:', error);
    }
}

async function generateUserFixture() {
    try {

        let profilePictureUrl = './img/defaultProfilePicture.png';
        let extention = 'png';
        let imgBase64 = await imageToBase64(profilePictureUrl);

        let all = []
        for (let i = 0; i < 5; i++) {
            let name = `user${i}`;
            let email = `user${i}@gmail.com`;
            let password = process.env.FIXTURES_PW+`${i}`;        
            const hashedPassword = await hashPassword(password);
            all.push({'@': email, 'PW': password, 'HASH': hashedPassword})
            let token = await generateJwtToken(email);
            await collectionUser.insertOne({ name, email, hashedPassword, token, admin: false})
            .then(async (user) => {
                await collectionPicture.insertOne({ userId: user.insertedId, imgBase64, extention });
            });
        }
        console.table(all);


    } catch (error) {
        console.error('Error during user creation:', error);
    }
}

export { deleteUserFixture, generateUserFixture };
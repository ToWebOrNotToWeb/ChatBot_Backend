import { hashPassword } from '../utils/bcrypt.js';
import { generateJwtToken } from '../utils/jwt.js';
import { collectionUser } from '../databases/mongoDb.js';
import * as dotenv from 'dotenv';

dotenv.config();

async function deleteUserFixture() {
    for (let i = 0; i < 5; i++) {
        await collectionUser.deleteMany({name: `user${i}`})
    }
}

async function generateUserFixture() {
    let all = []
    for (let i = 0; i < 5; i++) {
        let name = `user${i}`;
        let email = `user${i}@gmail.com`;
        let password = process.env.FIXTURES_PW+`${i}`;        
        const hashedPassword = await hashPassword(password);
        all.push({'@': email, 'PW': password, 'HASH': hashedPassword})
        let token = await generateJwtToken(email);
        await collectionUser.insertOne({ name, email, hashedPassword, token, admin: false});
    }
    console.table(all)
}

export { deleteUserFixture, generateUserFixture };
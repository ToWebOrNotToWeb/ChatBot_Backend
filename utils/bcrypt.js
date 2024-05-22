import bcrypt from 'bcrypt'; 
import * as dotenv from 'dotenv';

dotenv.config();
const saltRounds = process.env.SALT_ROUNDS;

// ========================================================================================================
// generate a hash for the user's password

async function hashPassword (password) {
    return await bcrypt.hash(password, saltRounds);
}

// ========================================================================================================
// compare the user's password with the hashed password

async function comparePassword (password, hash) {
    return await bcrypt.compare(password, hash);
}

export { hashPassword, comparePassword };
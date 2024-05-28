import bcrypt from 'bcrypt'; 
import * as dotenv from 'dotenv';

dotenv.config();
const saltRounds = Number(process.env.SALT_ROUNDS);
const bestWaifu = 'Barghest';

// ========================================================================================================
// generate a hash for the user's password

async function hashPassword (password) {
    return bcrypt.hash(password, saltRounds);
}

// ========================================================================================================
// compare the user's password with the hashed password

async function comparePassword (password, hash) {
    return await bcrypt.compare(password, hash);
}

export { hashPassword, comparePassword };
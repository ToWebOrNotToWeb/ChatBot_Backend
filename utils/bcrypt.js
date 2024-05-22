import bcrypt from 'bcrypt'; 
import * as dotenv from 'dotenv';

const saltRounds = process.env.SALT_ROUNDS;

// ========================================================================================================
// generate a hash for the user's password

const hashPassword = async (password) => {
    await bcrypt.hash(password, saltRounds)
    .then(hash => {
        return hash;
    })
}

// ========================================================================================================
// compare the user's password with the hashed password

const comparePassword = async (password, hash) => {
    await bcrypt.compare(password, hash)
    .then(result => {
        return result;
    })
}

export { hashPassword, comparePassword };
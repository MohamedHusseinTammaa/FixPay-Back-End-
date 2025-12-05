// Utils/Encrypt/hashing.js
import { compareSync, hashSync, genSaltSync } from "bcrypt"; // Add genSaltSync

export const generateHash = (plainText, saltRound = parseInt(process.env.SALT_ROUNDS)) => {
    return hashSync(plainText, saltRound);
};

export const CompareHash = (plainText, cipherText) => {
    return compareSync(plainText, cipherText);
};

export const hashPII = (data) => {
    if (!data) return null;
    const salt = genSaltSync(10);
    // Add pepper for extra security
    const pepper = process.env.PEPPER_SECRET || 'default-pepper-change-in-production';
    const pepperedData = data + pepper;
    return hashSync(pepperedData, salt);
};

export const comparePII = (plainData, hashedData) => {
    if (!plainData || !hashedData) return false;
    const pepper = process.env.PEPPER_SECRET || 'default-pepper-change-in-production';
    const pepperedData = plainData + pepper;
    return compareSync(pepperedData, hashedData);
};
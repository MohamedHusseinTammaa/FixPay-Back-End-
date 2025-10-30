import  { compareSync, hashSync } from "bcrypt"
export const generateHash=(plainText,saltRound =parseInt(process.env.SALT_ROUNDS ))=>{
    return hashSync(plainText,saltRound)
}
export const CompareHash=(plainText,cipherText)=>{
 return compareSync(plainText,cipherText)
}

import { hashSync, compareSync, genSaltSync } from "bcrypt";

export function hash(word){
    return hashSync(word, genSaltSync(10))
}

export function compareHash(inputWord, dbWord){
    return compareSync(inputWord, dbWord)
}
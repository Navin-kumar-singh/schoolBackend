import express from "express";
import mongoose from "mongoose";

import "dotenv/config";
const DB= process.env.DB || "mongodb://localhost:27017/Hello"
    


const db= async ()=>{
    try {
        const connect= await mongoose.connect(DB)
        if(!connect){
            console.log("db is not connected")
        }else{
            console.log("Db is connected")
        }
    } catch (error) {
        console.log("something is getting error ", error)
    }
}

export default db;
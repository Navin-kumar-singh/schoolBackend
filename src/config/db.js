// import express from "express";
// import mongoose from "mongoose";

// import "dotenv/config";
// const DB= process.env.MONGO_URL 
    
// console.log("URL =>", process.env.MONGO_URL);


// const db= async ()=>{
//     try {
//         const connect= await mongoose.connect(DB)
//         if(!connect){
//             console.log("db is not connected")
//         }else{
//             console.log("Db is connected")
//         }
//     } catch (error) {
//         console.log("something is getting error ", error)
//     }
// }

// export default db;

import mongoose from "mongoose";

const db = async () => {
  try {
    const url = process.env.MONGO_URL;  // ✅ ONLY VALUE
    console.log("URL =>", url);

    await mongoose.connect(url);

    console.log("Db is connected");
  } catch (error) {
    console.log("something is getting error ", error.message);
  }
};

export default db;

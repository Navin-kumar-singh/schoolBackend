import mongoose from "mongoose";

const userSchema= new mongoose.Schema({
    name:{
        type:String,
    },
    email:{
        type:String
    },
    mobile:{
        type:Number
    }
},{timestamps:true})

const user= mongoose.model("user", userSchema)
export default  user
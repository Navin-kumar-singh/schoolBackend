import user from "../model/user.model.js";

export const createUser= async(req , res)=>{
 try {
       const {name , email, password}= req.body

    if(!name || !email ||!  password){
     return res.status(400).json({message:"All field are required "})    
    }

    const checkmail= await user.findOne({email})
    if(!checkmail){
        return res.status(400).json({message:"email already exists"})
    }

    const newUser=await user.create({
        name, email, password
    })
    res.status(201).json({message:"user  register suggfully"})
    

 } catch (error) {
   return res.status(500).json({message:"user not created " , error})  
 }

}
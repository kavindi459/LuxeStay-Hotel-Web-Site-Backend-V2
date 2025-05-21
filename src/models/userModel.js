import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    firstName:{
        type:String,
        required:true

    },
    lastName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    profilePic:{
        type:String,
        default:"https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740"
    },
    phone:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
  
    
},{ timestamps: true })

export const User = mongoose.model("Users",userSchema);
export default User;
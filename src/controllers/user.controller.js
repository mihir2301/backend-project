 import {asynchandler} from "../utils/asynchandler.js"
import { ApiError } from "../utils/errorhandling.js";
import {user} from "../models/users.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Apiresponse.js";

 const registerUser= asynchandler(async(req,res)=>{
   const {fullname,email,username,password} =req.body
   console.log("email:",email);

  /* if(fullname===""){
    throw new ApiError(400,"Fullname is required")
   }*/
    

   if(
    [fullname,email,usrname,password].some((field)=>field?.trim()==="")

   ){
    throw new ApiError(400,"all fields are required");
   }
 

const existeduser=User.findOne({
    $or:[{ username },{email}]
})

if(existeduser){
    throw new ApiError(409,"Email or Username already in use")
}
const avatarLocalPath=req.files?.avatar[0]?.path;
const coverLocalPath = req.files?.coverImage[0]?.path;

if(!avatarLocalPath){
    throw new ApiError(400,"Avatar is required");
}
const avatar=await uploadOnCloudinary(avatarLocalPath)
const coverImage =await uploadOnCloudinary(coverImageLocalPath)
 if (!avatar){
    throw new ApiError(400,"Avatar is required");
}

 const user= await User.create({
    fullname,
    avatar: avatar.url ,
    coverImage: coverImage?.url ||"",
    email,
    password,
    usrname:username.toLowerCase()
})
const createduser=await User.findById(user._id).select("-password -refreshToken")

if (!createdUser){
    throw new ApiError(500,"Something went wrong");
}

return res.status(201).json(
    new ApiResponse(200,createdUser,"User registerd Sucessfully")
)
 })


 export {registerUser}; 
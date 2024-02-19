import { asynchandler } from "../utils/asynchandler";
import { ApiError } from "../utils/errorhandling";
import jwt from  "jsonwebtoken"
import {User} from "../models/user.model.js"

export const verifyJWT=asynchandler(async(req,_,next)=>{
   try {
    const token= req.cookies?.acesstoken||req.header("Authorization")?.replace("Bearer ",  "")
 
     if(!token){
         throw new ApiError(401,"Unauthorized request")
     }
 
     const decodedToken=jwt.verify(token,process.env.ACESS_TOKEN_SECRET)
 
     const user=await User.findById(decodedtoken?._id).select("-password -refreshToken")
 
     if(!user){
         throw new ApiError(401,"Invalid Acess token")
     }
 
     req.user=user;
     next()
   } catch (error) {
    throw new ApiError(401,error?.message||"invalid Acess token")
    
   }
})
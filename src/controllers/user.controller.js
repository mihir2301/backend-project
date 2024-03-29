 import {asynchandler} from "../utils/asynchandler.js"
import { ApiError } from "../utils/errorhandling.js";
import {user} from "../models/users.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import jwt from  'jsonwebtoken';



const generateAcessAndRefreshTokens= async(userId)=>{
    try{
        const user=   await User.findById(userId)
        const acesstoken=user.generateAcessToken()
        const refreshtoken=user.generateRefreshToken()
        user.refreshToken=refreshtoken;
        await user.save({validateBeforeSave: false})

        return {acesstoken,refreshtoken}
    }
    catch (error){
        throw new ApiError(500,"something went wrong")
    }
    
}




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
 

const existeduser= await User.findOne({
    $or:[{ username },{email}]
})

if(existeduser){
    throw new ApiError(409,"Email or Username already in use")
}
const avatarLocalPath=req.files?.avatar[0]?.path;
//const coverLocalPath = req.files?.coverImage[0]?.path;
 let coverImageLocalPath;
 if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
    coverImageLocalPath = req.files.coverImage[0].path
 }
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

const loginUser = asynchandler(async(req,res)=>
{
    const{email,usename,password} = req.body

    if(!(username || email)){
        throw new ApiError(400, "Username or Email are missing")
    }

   const user= await User.findOne({
        $or:[{usrname},{email}]
    })
    if(!user){
        throw new ApiError(404,"User does not exist");
    }
    const isPassowrdValid =await user.isPasswordCorrect(password)
    if(!isPassowordValid){  
        throw new ApiError(401,'Incorrect Password')}
    
const {acesstoken,refreshtoken}=await generateAcessAndRefreshTokens(user._id);

const loggedInUser =await User.findById(user._id).select("-password -refreshToken")

const options ={
    httpOnly:true,
    secure:true
}
return res
.status(200)
.cookie("acessToken",acesstoken,options)
.cookie("refreshToken",refreshtoken,options)
.json(
    new ApiResponse(200,
        {
            user:loggedInUser,acesstoken,refreshtoken,
        },
        "user logged in sucessfully")
)
})

const logoutUser = asynchandler(async(req,res)=>{
   await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
         } },
            {
                new:true
            }
        
    )
    const options ={
        httpOnly:true,
        secure:true}

        return res.status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(new ApiResponse(200,{},"User logged out"))

})

const refreshAccessToken= asynchandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshtoken|| req.body.refreshtoken
    if(!incomingRefreshToken)
    throw new ApiError(401,"unauthorized request")
    const decodedToken=jwt.verify(incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET)
    
    const user=await User.findById(decodedToken?._id)
    if(!user){
        throw new ApiError(401,"invalid refresh token")
    }
    if (incomingRefreshToken !==user?.refreshToken){
        throw new ApiError(401,"Invalid refresh token")
    }
    const options ={
        httpOnly:true,
        secure:true
    }

   const {accesstoken,newrefreshtoken} =await generateAcessAndRefreshTokens(user._id)
    return res
    .status(200)
    .cookie("accessToken ",accesstoken,options)
    .cookie("refreshToken ",newrefreshtoken,options)
    .json(
        new ApiResponse(
            200,
            {accesstoken,newrefreshtoken},
            "Access token refreshed"
        )
    )

})
    const changeCurrentPassword = asynchandler(async(req,res)=>{
        const{oldpassword,newpassword}=req.body

        const user= await User.findById(req.user?._id)
        const isPasswordCorrect = await user.isPasswordCorrect(oldpassword)

        if (!isPasswordCorrect){
            throw new ApiError(400,"Invalid old password")
        }
        user.password=newpassword
        await user.save({validateBeforeSave: false})

        return res
        .status(200)
        .json(new ApiResponse(200,{},"Password changed"))
    })
 
    const getCurrentuser= asynchandler(async(req,res)=>{
        return res
        .status(200)
        .json(200,req.user,"current user fetched sucessfully")
    })

    const  updateAccountDetails =asynchandler(async(req,res)=>{
        const{fullname,email}=req.body
        if (!(fullname || email)){
            throw new ApiError(400, "All fields are required")
        }

        const user= await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set:{
                    fullname,
                    email:email
                }
            },
            {new:true}             //update hone ke baad jo information hai wo milta hai..      
            ).select("-password")

            return res
            .status(200)
            .json(new ApiResponse(200,user,"Account details updated suceesfully"))

    })
    
    const updateuseravatar = asynchandler(async(req,res)=>{
      const avatarLocalPath  =req.file?.path
      if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing")
      }

      const avatar = await uploadOnCloudinary(avatarLocalPath)

      if (!avatar.url){
        throw new ApiError(400,"Error while uploading on avatar")
      }

      await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new : true}
      ).select("-password")
      return res
      .status(200)
      .json(
          new ApiResponse(200,user,"avatar updated sucessfully")
      )
    })

    const updateusercover = asynchandler(async(req,res)=>{
        const coverLocalPath  =req.file?.path
        if(!coverLocalPath){
          throw new ApiError(400,"Cover image file is missing")
        }
  
        const coverImage = await uploadOnCloudinary(coverLocalPath)
  
        if (!coverImage.url){
          throw new ApiError(400,"Error while uploading on avatar")
        }
  
       const user= await User.findByIdAndUpdate(
          req.user?._id,
          {
              $set:{
                  coverImage:avatar.url
              }
          },
          {new : true}
        ).select("-password")

        return res
        .status(200)
        .json(
            new ApiResponse(200,user,"image updated sucessfully")
        )
      })

       const getUserChannelProfile = asynchandler(async(req,res)=>{
        const {username}=req.params;

        if(!username?.trim())
        {
            throw new ApiError(400,"Username is missing")
        }

        const channel=await User.aggregate([
            {
                $match:{
                    username:username?.toLowerCase()
                }
            }
            ,{
                $lookup:{
                    from:"subscriptions",
                    localField:"_id",
                    foreignField:"channel",
                    as:"subscribers"
                }
            },{
                $lookup:{
                    from:"subscriptions",
                    localField:"_id",
                    foreignField:"suscriber",
                    as:"subscribedto"
                }},
                {
                    $addfields:{
                        suscribersCount:{
                            $size:"$suscribers"
                        },
                        channelsubscribedtocount:{
                            $size:"$subscribedto"
                        },
                        issubscribed:{
                            $cond:{
                                if:{
                                    $in:[req.user?._id,"subscribers.subscribe"]},
                                    then:true,
                                    else:false
                                }
                            }
                        }
                        

                    },
                    {
                        $project:{
                            fullname:1,
                            username:1,
                            suscribersCount:1,
                            channelsubscribedtocount:1
                        }
                    }
                
        ])
       })
       if(!channel?.length){
        throw new ApiError(404,"channel does not exists")
       }

       return res
       .status(200)
       .json(
        new ApiResponse(200,channel[0],"User channel fetched successfully")
       )
  


 export {registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentuser,updateAccountDetails,updateuseravatar,updateusercover}; 
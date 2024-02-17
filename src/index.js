import dotenv from "dotenv"
import express from  'express'
import {app} from "./app.js"
import connectDB from './db/index.js';

dotenv.config({
    path:'./.env'
})


 connectDB()
 .then(()=>
 {app.listen(process.env.PORT||3000,()=>{
    console.log(`Server is running on port :${process.env.PORT}`);
 })

 }).catch((err)=>
 {
    console.log("MOngo db connection failed",err);

 })


 
















/*( async ()=> {
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("ERROR:",error);
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log('App is listening');
        })
    }catch(error){
        console.error("ERROR:",error)
        throw error
    }
})*/
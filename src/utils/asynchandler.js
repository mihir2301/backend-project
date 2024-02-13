/*const asynchandler=(fn)=>async(req,res,next)=>{
    try {
        await fn(req, res, next)  // call the function with req and res parameters. If it returns
        
    } catch (error) {
        res.status(err.code || 500).json({
            sucess:false,
            message:err.message
        })
        
    }
}*/
const asynchandler = (requesthandler)=>{
    (req,res,next)=> {
        Promise.resolve(requesthandler(req,res,next)).catch((err)=> next(err))
    }
}

export {asynchandler};
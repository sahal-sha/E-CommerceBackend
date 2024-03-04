const tryCatchMiddleware=(trycatchHandler)=>{

    return async(req,res,next)=>{
        try{
            await trycatchHandler(req,res,next)
        }
        catch(error){
            const error_message = error.message || "Internal Server Error";
            res.status(500).json({status:"failure",message:"error",error_message:error.message})
        }
    }
}

module.exports = tryCatchMiddleware
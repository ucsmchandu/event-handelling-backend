const jwt=require('jsonwebtoken')
const generateToken=async(userId,res)=>{
    try{
        const token=jwt.sign({userId},process.env.JWT_SECRET,{
            expiresIn:"7d",
        });
        res.cookie("jwt",token,{
            maxAge:7*24*60*60*1000,
            httpOnly:true,
            secure: process.env.APPLICATION==="production" ? true:false,
        });
        // return token;
    }catch(err){
        console.log(err);
    }
}

module.exports=generateToken
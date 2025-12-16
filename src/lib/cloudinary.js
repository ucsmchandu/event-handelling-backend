const {v2:cloudinary} = require("cloudinary")

try{
    cloudinary.config({
        cloudinary_url:process.env.CLOUDINARY_URL,
        secure:process.env.APPLICATION==="production" ? true : false
    })
}catch(err){
    console.log(err);
    console.log(err.message);
}

console.log("cloudinary connected");

module.exports=cloudinary;
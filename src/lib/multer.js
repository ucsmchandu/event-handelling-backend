const multer=require('multer')
const {CloudinaryStorage}=require('multer-storage-cloudinary')
const cloudconnect=require('./cloudinary')

const storage=new CloudinaryStorage({
    cloudinary:cloudconnect,
    params:{
        folder:"events",
        resource_type:"auto",
    }
});

const upload=multer({storage})
module.exports=upload
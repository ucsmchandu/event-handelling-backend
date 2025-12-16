const express=require('express')
const authRouter=express.Router();
const {userLogin,userRegister,userLogout}=require('../controllers/auth.controller')

authRouter.post('/register',userRegister);
authRouter.post('/login',userLogin);
authRouter.post('/logout',userLogout);

module.exports=authRouter;
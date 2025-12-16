const express=require('express')
const router=express.Router();
const authRouter=require('./auth.routes');
const eventRouter=require('./event.routes')
// authentication routes
router.use('/auth',authRouter);

// event routes
router.use('/events',eventRouter);





module.exports=router;

const express=require('express')
const eventRouter=express.Router();
const auth=require('../middlewares/auth.middleware');
const { createEvent, getAllEvents, getEvent, updateEvent, deleteEvent,joinEvent,leaveEvent }=require('../controllers/event.controller')
const upload=require('../lib/multer') //multer to upload the image to cloudinary

eventRouter.post('/create/event',auth,upload.single("imageUrl"),createEvent)
eventRouter.get('/get/events',getAllEvents)
eventRouter.patch('/update/event/:id',auth,updateEvent)
eventRouter.delete('/delete/event/:id',auth,deleteEvent)
eventRouter.get('/get/event/:id',auth,getEvent);
// rsvp routes to join and leave the event
eventRouter.post('/join/event/:id',auth,joinEvent);
eventRouter.post('/leave/event/:id',auth,leaveEvent);

module.exports=eventRouter;
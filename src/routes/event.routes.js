const express=require('express')
const eventRouter=express.Router();
const { createEvent, getAllEvents, updateEvent, deleteEvent }=require('../controllers/event.controller')

eventRouter.post('/create/event',createEvent)
eventRouter.get('/get/events',getAllEvents)
eventRouter.patch('/update/event/:id',updateEvent)
eventRouter.delete('/delete/event/:id',deleteEvent)


module.exports=eventRouter;
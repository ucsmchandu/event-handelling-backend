const Event = require('../models/Event')
const createEvent = async (req, res) => {
    const {
        title,
        description,
        dateTime,
        location,
        capacity,
        imageUrl
    } = req.body;
    if (!title || !description || !dateTime || !location || !imageUrl || !capacity)
        return res.status(400).json({ message: "All fields are required" });
    try {
        const newEvent = new Event({
            title,
            description,
            dateTime,
            location,
            capacity,
            imageUrl,
            createdBy: req.user.userId,
            currentCount: 0
        });
        await newEvent.save()

        return res.status(201).json({
            message: "Event is created",
            eventId: newEvent._id,
            eventDetails: newEvent
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal error" });
    }

}

const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ dateTime: 1 }).populate("createdBy","email userName")
        if (events)
            return res.status(200).json({ events });
        return res.status(404).json({ message: "No events found for you" });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Error"
        })
    }
}

const updateEvent = async (req, res) => {
    try {
        const id = req.params.id;
        const event = await Event.findById(id);
        if (!event)
            return res.status(404).json({ message: "Event not found" });
        if (event.createdBy.toString() !== req.user.userId)
            return res.status(403).json({ message: "Not authorized" });
        const updatedEvent = await Event.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );
         res.status(200).json({
            message: "Event updated succesfully",
            updatedEvent:updatedEvent
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Error" });
    }
}

const deleteEvent = async (req, res) => {
    
    try{
        const id=req.params.id;
        const event=await Event.findById(id);
        if(!event)
            return res.status(404).json({message:"Event not found"});
        if(event.createdBy.toString()!==req.user.userId)
            return res.status(403).json({message:"Not authorized"});
        const deletedEvent=await Event.findByIdAndDelete(id);
        res.status(200).json({
            message:"Event deleted",
            deletedEvent:deletedEvent
        });
    }catch(err){
        console.log(err);
        res.status(500).json({message:"Internal Error"});
    }
}

const joinEvent=async(req,res)=>{
    const id=req.params.id;
    const getEvent=await Event.findById(id);
    try{
        const event = await Event.findOneAndUpdate(
            {
                _id:id,
                currentCount:{$lt:getEvent.capacity},
                attendees:{$ne:req.user.userId}
            },
            {
                $inc:{currentCount:1},
                $addToSet:{attendees:req.user.userId}
            },
            {new:true}
        );
        if(!event)
            return res.status(400).json({message:"Event is full or already joined"});
        res.status(200).json({
            message:"Event joined successfull",
            event:event
        });
    }catch(err){
        console.log(err);
        res.status.json({
            message:"Internal Error"
        })
    }
}

const leaveEvent=async(req,res)=>{
    const id=req.params.id;
    try{
        const event=await Event.findOneAndUpdate(
            {
                _id:id,
                attendees:req.user.userId
            },
            {
                $pull:{attendees:req.user.userId},
                $inc:{currentCount:-1}
            },
            {new:true}
        );
        if(!event)
            return res.status(400).json({message:"You are not of this event"});
        res.status(200).json({
            message:"You are leaved this event successfully",
            leavedEvent:event
        });
    }catch(err){
        console.log(err);
        res.status(500).json({message:"Internal error"});
    }
}

module.exports = { createEvent, getAllEvents, updateEvent, deleteEvent,joinEvent,leaveEvent };
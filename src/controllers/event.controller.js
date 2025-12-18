const Event = require('../models/Event')

const createEvent = async (req, res) => {
    console.log(req.body)
    console.log(req.file);
    const {
        title,
        description,
        dateTime,
        location,
        capacity,
        // imageUrl
    } = req.body;
    // checking the fields
    if (!title || !description || !dateTime || !location || !capacity)
        return res.status(400).json({ message: "All fields are required" });
    try {
        const newEvent = new Event({
            title,
            description,
            dateTime,
            location,
            capacity,
            imageUrl: req.file?.path || null,
            createdBy: req.user.userId, //from the middle ware
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
        // this finds the event and sort in acsending order by dateTime and gets the user details who created the event through populate
        const events = await Event.find().sort({ dateTime: 1 }).populate("createdBy", "email userName")
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

const getEvent = async (req, res) => {
    const id=req.params.id;
    // console.log(id);
    try {
        const event=await Event.findById(id);
        if(event)
            return res.status(200).json({event:event});
        return res.status(404).json({message:"Event not found"});
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Error"
        })
    }
}

const updateEvent = async (req, res) => {
    try {
        const id = req.params.id; //from the path params
        const event = await Event.findById(id);
        if (!event)
            return res.status(404).json({ message: "Event not found" });
        if (event.createdBy.toString() !== req.user.userId) //userId from the middleware and only the organizer can only updates the event
            return res.status(403).json({ message: "Not authorized" });
        const updatedEvent = await Event.findByIdAndUpdate(
            id,
            req.body,
            { new: true } //return the new updated event data
        );
        res.status(200).json({
            message: "Event updated succesfully",
            updatedEvent: updatedEvent
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Error" });
    }
}

const deleteEvent = async (req, res) => {

    try {
        const id = req.params.id;
        const event = await Event.findById(id);
        if (!event)
            return res.status(404).json({ message: "Event not found" });
        if (event.createdBy.toString() !== req.user.userId) //only organizer can only deletes the event
            return res.status(403).json({ message: "Not authorized" });
        const deletedEvent = await Event.findByIdAndDelete(id);
        res.status(200).json({
            message: "Event deleted",
            deletedEvent: deletedEvent
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Error" });
    }
}

const joinEvent = async (req, res) => {
    const id = req.params.id;
    const getEvent = await Event.findById(id);
    try {
        const event = await Event.findOneAndUpdate(
            {
                // atomic 
                _id: id,
                currentCount: { $lt: getEvent.capacity }, //get the capacity which is given by the organizer
                // checks if currentcount<given capacity
                attendees: { $ne: req.user.userId } // checks if the user is already in this event(attendees not equal to current user)
            }, //if these conditions are satisfied then only operation are executed
            {
                $inc: { currentCount: 1 }, //increments the count of the participents by one
                $addToSet: { attendees: req.user.userId } //this add the current user to the event list
            },
            { new: true }
        );
        if (!event)
            return res.status(400).json({ message: "Event is full or already joined" });
        return res.status(200).json({
            message: "Event joined successfull",
            event: event
        });
    } catch (err) {
        console.log(err);
        res.status.json({
            message: "Internal Error"
        })
    }
}

const leaveEvent = async (req, res) => {
    const id = req.params.id;
    try {
        const event = await Event.findOneAndUpdate(
            {
                _id: id,
                attendees: req.user.userId //checks if the user is present in attendees array
            },
            {
                $pull: { attendees: req.user.userId }, //remove the current user
                $inc: { currentCount: -1 } // decrease the count of the participants
            },
            { new: true }
        );
        if (!event)
            return res.status(400).json({ message: "You are not of this event" });
        res.status(200).json({
            message: "You are leaved this event successfully",
            leavedEvent: event
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal error" });
    }
}

module.exports = { createEvent, getAllEvents, getEvent, updateEvent, deleteEvent, joinEvent, leaveEvent };
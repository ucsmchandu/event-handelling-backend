const mongoose=require('mongoose')

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    dateTime: { type: String, required: true },
    location: { type: String, required: true },
    capacity: { type: Number, required: true },
    currentCount: { type: Number, default: 0 }, 
    imageUrl: { type: String, required: true },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], //registered users
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" } //host of the event
  },
  { timestamps: true }
);

const Event=mongoose.model("Event",eventSchema);
module.exports=Event;
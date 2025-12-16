

const createEvent = async (req, res) => {
    console.log("created event");
}

const getAllEvents = async (req, res) => {
    console.log("gett all events");
}

const updateEvent = async (req, res) => {
    console.log("update event");
}

const deleteEvent = async (req, res) => {
    console.log("delete event");
}

module.exports = { createEvent, getAllEvents, updateEvent, deleteEvent };
const Event = require("../../models/Event");
const { ObjectId } = require("mongodb");

class EventSide {

    static addEvent = async (req, res) => {
        const { eventname, eventtype, eventdescription, eventlocation, location, date, enddate, time, price } = req.body;
        var image = []
        var video = []
        if (req?.data[0]) {
            if (Array.isArray(req?.data[0]?.images)) {
                req?.data[0]?.images?.forEach(img => {
                    image.push(img.location);
                });
            }
            if (Array.isArray(req?.data[0]?.video)) {
                req?.data[0]?.video?.forEach(vid => {
                    video.push(vid.location);
                });
            }
            try {
                const event = await Event.findOne({ eventname: eventname });
                if (event) {
                    return res.send({ "status": "False", "message": "Eventname is Already Exits!" });
                } else {
                    if (eventname !== "" && eventtype !== "" && eventdescription !== "" && eventlocation !== "" && location !== "" && date !== "" && enddate !== "" && time !== "" && price !== "" && image !== "" && video !== "") {
                        const doc = new Event({
                            eventname: eventname, eventtype: eventtype, eventdescription: eventdescription, eventlocation: eventlocation,
                            location: {
                                type: "Point",
                                GeolocationCoordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
                            }, date: date, enddate: enddate, time: time, price: price, image: image, video: video,
                        })
                        const saved_event = await doc.save();
                        return res.status(201).send({ data: saved_event, "status": "True", "message": "Event Add Event successfully!" });
                    } else {
                        return res.status(400).send({ "status": "False", "message": "This Field does not Exists!" });
                    }
                }
            } catch {
                return res.status(401).send({ status: false, "message": "Unable To Register!" });
            }
        } else {
            return res.status(400).send({ "status": "False", "message": "Image is naseccery!" });
        }
    }

    static deleteEvent = async (req, res) => {
        try {
            const deleteEvent = await Event.findByIdAndDelete(req.params.id);
            if (!deleteEvent) {
                return res.status(401).json({ status: false, message: "Event Not Found!", data: deleteEvent });
            } else {
                return res.status(200).json({ status: true, message: "Event Deleted Successfully!!", data: deleteEvent });
            }
        } catch (e) {
            res.status(500).send(e);
        }
    }

    static updateEvent = async (req, res) => {
        try {
            const { eventname, eventtype, eventdescription, eventlocation, location, date, enddate, time, price } = req.body;
            const user_id = req.params.id;
            var image = [];
            var video = [];
            var updateEvent = [];
            if (req.files !== undefined && req.files !== null && req.files !== "" && req.files.length !== 0) {
                if (req?.data[0]) {
                    if (Array.isArray(req?.data[0]?.images)) {
                        req?.data[0]?.images?.forEach(img => {
                            image.push(img.location);
                        });
                    } else {
                        return res.status(400).send({ status: false, message: "Internal Server!" });
                    }
                    if (Array.isArray(req?.data[0]?.video)) {
                        req?.data[0]?.video?.forEach(vid => {
                            video.push(vid.location);
                        });
                    } else {
                        return res.status(400).send({ status: false, message: "Internal Server!" });
                    }
                } else {
                    return res.status(201).send({ data: editEvent, "status": "false", "message": "Your Image is Null!" });
                }
                if (image.length > 0 && video.length > 0) {
                    updateEvent = await Event.findOneAndUpdate({ _id: new ObjectId(user_id) }, {
                        eventname: eventname, eventtype: eventtype, eventdescription: eventdescription, eventlocation: eventlocation,
                        location: {
                            type: "Point",
                            GeolocationCoordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
                        }, date: date, enddate: enddate, time: time, price: price, image: image, video: video,
                    }, { new: true });
                   
                } else if (image.length > 0) {
                    updateEvent = await Event.findOneAndUpdate({ _id: new ObjectId(user_id) }, {
                        eventname: eventname, eventtype: eventtype, eventdescription: eventdescription, eventlocation: eventlocation,
                        location: {
                            type: "Point",
                            GeolocationCoordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
                        }, date: date, enddate: enddate, time: time, price: price, image: image
                    }, { new: true });
                } else if (video.length > 0) {
                    updateEvent = await Event.findOneAndUpdate({ _id: new ObjectId(user_id) }, {
                        eventname: eventname, eventtype: eventtype, eventdescription: eventdescription, eventlocation: eventlocation,
                        location: {
                            type: "Point",
                            GeolocationCoordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
                        }, date: date, enddate: enddate, time: time, price: price, video: video,

                    }, { new: true });
                }
                if (updateEvent)
                    return res.status(201).send({ data: updateEvent, "status": true, "message": "Your Data Successfully Updated!" });
                else
                    return res.status(201).send({ data: [], "status": false, "message": "Record not found!" });
            } else {
                const editEvent = await Event.findOneAndUpdate({ _id: new ObjectId(user_id) }, {
                    eventname: eventname, eventtype: eventtype, eventdescription: eventdescription, eventlocation: eventlocation,
                    location: {
                        type: "Point",
                        GeolocationCoordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
                    }, date: date, enddate: enddate, time: time, price: price
                }, { new: true });
                return res.status(201).send({ data: editEvent, "status": "True", "message": "Your Data Successfully Updated!" });
            }
        } catch (e) {
            console.log(e);
            return res.status(404).send({ data: {}, "status": "False", "Message": "Your Data Are Not Updated!" });
        }
    }

    static SearchEvent = async (req, res) => {
        const eventname = req.query.eventname;
        const eventtype = req.query.eventtype;
        const eventlocation = req.query.eventlocation;
        const start = req.query.start || 1;
        const limit = parseInt(req.query.limit);
        const skip = (start - 1) * limit;
        let filter = {};
        try {
            if (eventname !== undefined && eventtype !== undefined && eventlocation !== undefined) {
                filter = {
                    $and: [
                        { eventname: { $regex: ".*" + eventname + ".*", $options: "i" } },
                        { eventtype: { $regex: ".*" + eventtype + ".*", $options: "i" } },
                        { eventlocation: { $regex: ".*" + eventlocation + ".*", $options: "i" } },
                    ],
                }
            } else {
                filter = {};
            }
            const events = await Event.find(filter).skip(skip).limit(limit);
            const count = await Event.find(filter).count();
            if (events != 0)
                return res.status(201).json({
                    status: true,
                    message: `Events data retrive successfully.`,
                    data: [
                        {
                            events: events,
                            totalPages: Math.ceil(count / limit),
                            currentPage: req.query.start,
                            Totalevent: count,
                        },
                    ],
                })
            else
                return res.status(200).json({
                    status: false,
                    message: `Events not found.`,
                    data: [
                        {
                            events: [],
                            totalPages: Math.ceil(0 / limit),
                            currentPage: req.query.start,
                            Totalevent: 0,
                        },
                    ],
                });
        } catch (error) {
            res.status(400).json({ status: false, message: "Something Went Wrong!............" });
        }
    }

    static searchEvent = async (req, res) => {
        const search = req.query.search;
        const start = req.query.start || 1;
        const limit = parseInt(req.query.limit);
        const skip = (start - 1) * limit;
        var filter = {};
        if (search) {
            filter = { eventlocation: { $regex: ".*" + search + ".*", $options: "i" } };
            try {
                const events = await Event.find(filter).skip(skip).limit(limit);
                const count = await Event.find(filter).count();
                if (events.length !== 0) {
                    return res.status(200).json({
                        status: true, message: `Event data retrive successfully.`,
                        data: [
                            {
                                events: events,
                                totalPages: Math.ceil(count / limit),
                                currentPage: req.query.start,
                                Totalevent: count,
                            },
                        ],
                    });
                } else {
                    return res.status(200).json({
                        status: false, message: `Event not found.`,
                        data: [
                            {
                                events: [],
                                totalPages: Math.ceil(0 / limit),
                                currentPage: req.query.start,
                                Totalevent: 0,
                            },
                        ],
                    });
                }
            } catch (error) {
                res.status(400).json(error);
            }
        } else {
            const events = await Event.find(filter).skip(skip).limit(limit);
            const count = await Event.find(filter).count();
            if (events.length !== 0) {
                return res.status(200).json({
                    status: true, message: `Events data retrive successfully.`,
                    data: [
                        {
                            events: events,
                            totalPages: Math.ceil(count / limit),
                            currentPage: req.query.start,
                            Totalevent: count,
                        },
                    ],
                });
            } else {
                return res.status(200).json({
                    status: false, message: `Event not found.`,
                    data: [
                        {
                            events: [],
                            totalPages: Math.ceil(0 / limit),
                            currentPage: req.query.start,
                            Totalevent: 0,
                        },
                    ],
                });
            }
        }

    }

}


module.exports = EventSide;


















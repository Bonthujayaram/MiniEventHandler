const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');

// Get all events (Public)
router.get('/', async (req, res) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 });
        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create event (Private)
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, date, time, location, address, capacity, imageUrl } = req.body;

        const newEvent = new Event({
            title,
            description,
            date,
            time,
            location,
            address,
            capacity,
            imageUrl,
            creatorId: req.user.id, // Securely set from token
            creatorName: req.body.creatorName || 'Organizer', // Optionally fetch user name from DB
            attendees: []
        });

        const event = await newEvent.save();
        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update event (Private, Owner only)
router.put('/:id', auth, async (req, res) => {
    try {
        let event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ msg: 'Event not found' });

        // Enforce ownership
        if (event.creatorId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        event = await Event.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete event (Private, Owner only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ msg: 'Event not found' });

        // Enforce ownership
        if (event.creatorId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await Event.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Event removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// RSVP (Private, Atomic)
router.post('/:id/rsvp', auth, async (req, res) => {
    try {
        // Atomic update to handle race conditions and duplicate checks
        // 1. Check if user already attending (idempotent $addToSet would handle strictly, but we want to know logic)
        // 2. Check capacity ( using query filter)

        // First check if already attending to give specific error message
        const checkEvent = await Event.findById(req.params.id);
        if (!checkEvent) return res.status(404).json({ success: false, error: 'Event not found' });

        if (checkEvent.attendees.includes(req.user.id)) {
            return res.status(400).json({ success: false, error: 'Already attending' });
        }

        // Try atomic update with capacity verification
        const event = await Event.findOneAndUpdate(
            {
                _id: req.params.id,
                $expr: { $lt: [{ $size: "$attendees" }, "$capacity"] }
            },
            { $addToSet: { attendees: req.user.id } },
            { new: true }
        );

        if (!event) {
            // If failed, it means capacity reached (since we checked existence and duplicates above)
            return res.status(400).json({ success: false, error: 'Event full' });
        }

        res.json({ success: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// Cancel RSVP (Private)
router.post('/:id/cancel-rsvp', auth, async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(
            req.params.id,
            { $pull: { attendees: req.user.id } },
            { new: true }
        );

        if (!event) return res.status(404).json({ success: false, error: 'Event not found' });

        res.json({ success: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;

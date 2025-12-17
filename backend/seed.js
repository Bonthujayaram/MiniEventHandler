const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Event = require('./models/Event');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding');

        // clear existing data (optional, but good for clean seed)
        // await User.deleteMany({});
        // await Event.deleteMany({});

        // Create a demo user for the events
        let user = await User.findOne({ email: 'demo@example.com' });
        if (!user) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);
            user = new User({
                name: 'Demo Organizer',
                email: 'demo@example.com',
                password: hashedPassword
            });
            await user.save();
            console.log('Created demo user');
        } else {
            console.log('Using existing demo user');
        }

        const userId = user._id;

        const events = [
            {
                title: "Tech Innovation Summit 2024",
                description: "Join us for an extraordinary day of innovation and discovery at the Tech Innovation Summit 2024. This premier event brings together industry leaders, visionary entrepreneurs, and tech enthusiasts from around the globe.",
                date: "2024-01-15",
                time: "09:00",
                location: "San Francisco Convention Center",
                address: "747 Howard Street, San Francisco, CA 94103",
                capacity: 500,
                imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60",
                creatorId: userId,
                creatorName: user.name,
                attendees: []
            },
            {
                title: "Creative Design Workshop",
                description: "Hands-on workshop exploring modern design principles and tools with expert mentors. Learn UI/UX design, branding, and visual communication strategies.",
                date: "2024-01-20",
                time: "14:00",
                location: "Design Hub NYC",
                address: "123 Creative Street, New York, NY 10001",
                capacity: 50,
                imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=60",
                creatorId: userId,
                creatorName: user.name,
                attendees: []
            },
            {
                title: "Startup Networking Night",
                description: "Connect with fellow entrepreneurs, investors, and innovators in a relaxed atmosphere. Great opportunity to pitch your ideas and find potential partners.",
                date: "2024-01-25",
                time: "18:00",
                location: "The Innovation Loft, Austin",
                address: "456 Startup Lane, Austin, TX 78701",
                capacity: 150,
                imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=60",
                creatorId: userId,
                creatorName: user.name,
                attendees: []
            },
            {
                title: "Photography Masterclass",
                description: "Learn advanced photography techniques from award-winning photographers in this intensive workshop. Bring your camera and get hands-on experience.",
                date: "2024-02-01",
                time: "10:00",
                location: "Art Center Los Angeles",
                address: "789 Art Blvd, Los Angeles, CA 90001",
                capacity: 30,
                imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60",
                creatorId: userId,
                creatorName: user.name,
                attendees: []
            },
            {
                title: "Music Festival Preview",
                description: "Get an exclusive preview of this year's biggest music festival with live performances from headlining artists.",
                date: "2024-02-10",
                time: "19:00",
                location: "Downtown Miami Arena",
                address: "321 Music Way, Miami, FL 33101",
                capacity: 1000,
                imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&auto=format&fit=crop&q=60",
                creatorId: userId,
                creatorName: user.name,
                attendees: []
            }
        ];

        await Event.insertMany(events);
        console.log('Seeded 5 events successfully');

        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedData();

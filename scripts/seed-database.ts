import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Database models
const EventSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  time: { type: String, required: true },
  presenter: String,
  presenterUrl: String,
  topic: { type: String, required: true },
  location: { type: String, required: true },
  locationUrl: String,
  order: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true },
}, { timestamps: true });

const TechItemSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  order: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true },
}, { timestamps: true });

const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  description: String,
  order: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true },
}, { timestamps: true });

const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);
const TechItem = mongoose.models.TechItem || mongoose.model('TechItem', TechItemSchema);
const Resource = mongoose.models.Resource || mongoose.model('Resource', ResourceSchema);

async function seedDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/etc_caucus';

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Event.deleteMany({});
    await TechItem.deleteMany({});
    await Resource.deleteMany({});
    console.log('Cleared existing data');

    // Seed Tech Items from tech_list.txt
    const techListPath = path.join(process.cwd(), 'data', 'tech_list.txt');
    const techListContent = fs.readFileSync(techListPath, 'utf-8');
    const techItems = techListContent
      .split('\n')
      .filter(line => line.trim())
      .map((line, index) => {
        const [name, url] = line.split('|').map(s => s.trim());
        return { name, url, order: index };
      });

    await TechItem.insertMany(techItems);
    console.log(`Seeded ${techItems.length} tech items`);

    // Seed Events (from original HTML)
    const events = [
      {
        date: new Date('2025-10-06'),
        time: '10:00 AM ET',
        presenter: 'Epibone',
        presenterUrl: 'https://www.epibone.com/',
        topic: 'Generation of human bone and cartilage tissue for transplantation using advanced tissue engineering.',
        location: 'Online/Teams',
        order: 1,
      },
      {
        date: new Date('2025-06-20'),
        time: '10:45 AM ET',
        presenter: 'Tecogen',
        presenterUrl: 'https://www.tecogen.com/',
        topic: 'Efficient electricity and hot water from natural gas.',
        location: '76 Treble Cove Road, Building 1, North Billerica, MA 01862',
        order: 2,
      },
      {
        date: new Date('2025-05-02'),
        time: '10:00 AM ET',
        presenter: 'Samuel Eckert',
        presenterUrl: 'https://www.linkedin.com/in/se-riveon/',
        topic: 'Smart grid technology and how it facilitates clean energy',
        location: 'Online/Teams',
        order: 3,
      },
      {
        date: new Date('2025-04-18'),
        time: '10:00 AM ET',
        presenter: 'Jon DiPietro',
        presenterUrl: 'https://www.linkedin.com/in/jondipietro/',
        topic: 'Practical AI for legislators',
        location: 'Online/Teams',
        order: 4,
      },
      {
        date: new Date('2025-04-04'),
        time: '10:00 AM ET',
        presenter: 'DEKA/ARMI Campus Tour',
        presenterUrl: 'https://armiusa.org/',
        topic: 'Advanced tissue manufacturing and the future of biotechnology',
        location: '340 Commercial Street, Manchester, NH 03101',
        order: 5,
      },
      {
        date: new Date('2025-03-21'),
        time: '10:00 AM ET',
        presenter: 'Marcus Nichol',
        presenterUrl: 'https://www.linkedin.com/in/marcusnichol/',
        topic: 'Nuclear Energy Institute - Presentation on the state of advanced nuclear technology',
        location: 'Online/Teams',
        order: 6,
      },
      {
        date: new Date('2025-03-07'),
        time: '10:00 AM ET',
        topic: "Eversource's Energy Park - energy grid management and the increasing role of AI",
        location: '780 N. Commercial Street in Manchester, NH',
        locationUrl: 'https://www.google.com/maps/uv?pb=!1s0x89e24f3048483f15%3A0x7b2a50387b74c02b',
        order: 7,
      },
      {
        date: new Date('2025-02-21'),
        time: '11:00 AM ET',
        presenter: 'Charles Sauer',
        presenterUrl: 'https://x.com/InnovateCharlie',
        topic: 'Blockchain technology from a non-technical perspective',
        location: 'Online/Teams',
        order: 8,
      },
      {
        date: new Date('2025-02-07'),
        time: '2:00 PM ET',
        presenter: 'Jonathan Crane',
        presenterUrl: 'https://www.linkedin.com/in/jonathan-crane-73466b92/',
        topic: 'AI data centers and their energy requirements.',
        location: 'Online/Teams',
        order: 9,
      },
      {
        date: new Date('2025-01-24'),
        time: '1:30 PM ET',
        topic: 'Organizational Meeting',
        location: 'McAuliffe-Shephard Discovery Center, 2 Institute Drive, Concord, NH 03301',
        locationUrl: 'https://www.starhop.com/',
        order: 10,
      },
    ];

    await Event.insertMany(events);
    console.log(`Seeded ${events.length} events`);

    // Seed Resources
    const resources = [
      {
        title: 'Stanford Emerging Technology Review',
        url: 'https://setr.stanford.edu/',
        order: 1,
      },
      {
        title: 'U.S. Department of Energy - New Horizons',
        url: 'https://www.energy.gov/#:~:text=Exploring%20New%20Horizons',
        order: 2,
      },
      {
        title: 'White House Working Group Digital Assets Report',
        url: 'https://www.whitehouse.gov/crypto/',
        order: 3,
      },
      {
        title: 'AI Ethics Guidelines',
        url: 'https://oecd.ai/en/ai-principles/',
        order: 4,
      },
    ];

    await Resource.insertMany(resources);
    console.log(`Seeded ${resources.length} resources`);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedDatabase();


/**
 * Script to copy data from development database to production database
 * Usage: npm run copy-to-prod
 */

import dotenv from 'dotenv';
import mongoose, { Schema } from 'mongoose';

// Load environment variables
dotenv.config();

// Get connection strings
const DEV_URI = process.env.MONGODB_URI || '';
const PROD_URI = DEV_URI.replace('etc-website-dev', 'etc-website-prod');

interface Stats {
  events: number;
  resources: number;
  techItems: number;
}

// Define schemas inline
const eventSchema = new Schema({
  date: { type: Date, required: true },
  time: { type: String, required: true },
  presenter: { type: String },
  presenterUrl: { type: String },
  topic: { type: String, required: true },
  location: { type: String, required: true },
  locationUrl: { type: String },
  presentations: [{
    filename: String,
    data: Buffer,
    contentType: String,
    size: Number
  }],
  isVisible: { type: Boolean, default: true },
  content: { type: String }
}, { timestamps: true });

const resourceSchema = new Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String },
  thumbnail: { type: String },
  order: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  isVisible: { type: Boolean, default: true }
}, { timestamps: true });

const techItemSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  isVisible: { type: Boolean, default: true }
}, { timestamps: true });

async function copyToProduction() {
  try {
    console.log('🔄 Starting database copy process...\n');

    // Validate URIs
    if (!DEV_URI) {
      throw new Error('MONGODB_URI not found in environment');
    }
    
    if (!DEV_URI.includes('etc-website-dev')) {
      throw new Error('MONGODB_URI must point to etc-website-dev database');
    }

    console.log('📊 Source Database: etc-website-dev');
    console.log('📊 Target Database: etc-website-prod\n');

    // Connect to development database
    console.log('🔌 Connecting to development database...');
    const devConnection = await mongoose.createConnection(DEV_URI).asPromise();
    console.log('✅ Connected to development database\n');

    // Get models from dev connection
    const DevEvent = devConnection.model('Event', eventSchema);
    const DevResource = devConnection.model('Resource', resourceSchema);
    const DevTechItem = devConnection.model('TechItem', techItemSchema);

    // Fetch all data from development
    console.log('📥 Fetching data from development database...');
    const [devEvents, devResources, devTechItems] = await Promise.all([
      DevEvent.find({}).lean(),
      DevResource.find({}).lean(),
      DevTechItem.find({}).lean()
    ]);

    const stats: Stats = {
      events: devEvents.length,
      resources: devResources.length,
      techItems: devTechItems.length
    };

    console.log(`   ✓ Found ${stats.events} events`);
    console.log(`   ✓ Found ${stats.resources} resources`);
    console.log(`   ✓ Found ${stats.techItems} tech items\n`);

    if (stats.events === 0 && stats.resources === 0 && stats.techItems === 0) {
      console.log('⚠️  No data found in development database. Nothing to copy.');
      await devConnection.close();
      return;
    }

    // Connect to production database
    console.log('🔌 Connecting to production database...');
    const prodConnection = await mongoose.createConnection(PROD_URI).asPromise();
    console.log('✅ Connected to production database\n');

    // Get models from prod connection
    const ProdEvent = prodConnection.model('Event', eventSchema);
    const ProdResource = prodConnection.model('Resource', resourceSchema);
    const ProdTechItem = prodConnection.model('TechItem', techItemSchema);

    // Clear production database
    console.log('🗑️  Clearing production database...');
    await Promise.all([
      ProdEvent.deleteMany({}),
      ProdResource.deleteMany({}),
      ProdTechItem.deleteMany({})
    ]);
    console.log('✅ Production database cleared\n');

    // Copy data to production
    console.log('📤 Copying data to production database...');
    
    const results = await Promise.allSettled([
      stats.events > 0 ? ProdEvent.insertMany(devEvents) : Promise.resolve([]),
      stats.resources > 0 ? ProdResource.insertMany(devResources) : Promise.resolve([]),
      stats.techItems > 0 ? ProdTechItem.insertMany(devTechItems) : Promise.resolve([])
    ]);

    // Check results
    let success = true;
    results.forEach((result, index) => {
      const collectionNames = ['events', 'resources', 'tech items'];
      if (result.status === 'fulfilled') {
        console.log(`   ✓ Copied ${collectionNames[index]}`);
      } else {
        console.log(`   ✗ Failed to copy ${collectionNames[index]}: ${result.reason}`);
        success = false;
      }
    });

    console.log('\n📊 Summary:');
    console.log('─'.repeat(50));
    console.log(`Events copied:     ${stats.events}`);
    console.log(`Resources copied:  ${stats.resources}`);
    console.log(`Tech items copied: ${stats.techItems}`);
    console.log('─'.repeat(50));

    // Close connections
    await devConnection.close();
    await prodConnection.close();

    if (success) {
      console.log('\n✅ Database copy completed successfully!');
      console.log('🎉 Production database is now in sync with development.\n');
    } else {
      console.log('\n⚠️  Database copy completed with errors.');
      console.log('Please review the errors above.\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Error during database copy:');
    console.error(error);
    process.exit(1);
  }
}

// Run the script
copyToProduction();

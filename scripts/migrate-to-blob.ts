/**
 * Migration script to move files from MongoDB to Vercel Blob Storage
 * 
 * This script:
 * 1. Reads all events with images or presentations stored as Buffer data
 * 2. Uploads each file to Vercel Blob Storage
 * 3. Updates the document to store the blob URL instead of Buffer data
 * 4. Same process for resources with thumbnails
 * 
 * Usage:
 *   npx tsx scripts/migrate-to-blob.ts
 * 
 * Prerequisites:
 *   - BLOB_READ_WRITE_TOKEN environment variable must be set
 *   - MongoDB connection must be configured
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import { put } from '@vercel/blob';

// Check for required environment variables
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('Error: BLOB_READ_WRITE_TOKEN environment variable is required');
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is required');
  process.exit(1);
}

// Define schemas for migration (with Buffer support for reading old data)
const eventSchema = new mongoose.Schema({
  date: Date,
  time: String,
  presenter: String,
  presenterUrl: String,
  topic: String,
  location: String,
  locationUrl: String,
  presentations: [{
    filename: String,
    data: Buffer,
    url: String,
    contentType: String,
    size: Number,
    uploadedAt: Date,
  }],
  images: [{
    filename: String,
    data: Buffer,
    url: String,
    contentType: String,
    size: Number,
    uploadedAt: Date,
    order: Number,
  }],
  isVisible: Boolean,
  content: String,
}, { timestamps: true });

const resourceSchema = new mongoose.Schema({
  title: String,
  url: String,
  description: String,
  thumbnail: {
    filename: String,
    data: Buffer,
    url: String,
    contentType: String,
    size: Number,
  },
  featured: Boolean,
  order: Number,
  isVisible: Boolean,
}, { timestamps: true });

// Create models
const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
const Resource = mongoose.models.Resource || mongoose.model('Resource', resourceSchema);

/**
 * Generate a blob path for a file
 */
function generateBlobPath(
  folder: string,
  id: string,
  subfolder: string,
  filename: string
): string {
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `files/${folder}/${id}/${subfolder}/${sanitizedFilename}`;
}

/**
 * Upload a buffer to Vercel Blob Storage
 */
async function uploadBufferToBlob(
  folder: string,
  id: string,
  subfolder: string,
  filename: string,
  data: Buffer,
  contentType: string
): Promise<string> {
  const path = generateBlobPath(folder, id, subfolder, filename);
  
  const blob = await put(path, data, {
    access: 'public',
    contentType,
    addRandomSuffix: false,
  });
  
  return blob.url;
}

/**
 * Migrate event files
 */
async function migrateEvents(): Promise<{ migrated: number; skipped: number; errors: number }> {
  console.log('\n📁 Migrating Events...');
  
  const events = await Event.find({
    $or: [
      { 'presentations.data': { $exists: true } },
      { 'images.data': { $exists: true } }
    ]
  });
  
  console.log(`Found ${events.length} events with potential files to migrate`);
  
  let migrated = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const event of events) {
    const eventId = event._id.toString();
    let hasChanges = false;
    
    console.log(`\n  Processing event: ${event.topic} (${eventId})`);
    
    // Migrate presentations
    if (event.presentations && event.presentations.length > 0) {
      for (let i = 0; i < event.presentations.length; i++) {
        const presentation = event.presentations[i];
        
        // Skip if already migrated (has URL but no data)
        if (presentation.url && !presentation.data) {
          console.log(`    ⏭️  Presentation ${i + 1} already migrated: ${presentation.filename}`);
          skipped++;
          continue;
        }
        
        // Skip if no data to migrate
        if (!presentation.data) {
          console.log(`    ⚠️  Presentation ${i + 1} has no data: ${presentation.filename}`);
          skipped++;
          continue;
        }
        
        try {
          console.log(`    📤 Uploading presentation ${i + 1}: ${presentation.filename}`);
          
          const url = await uploadBufferToBlob(
            'events',
            eventId,
            'presentations',
            presentation.filename,
            presentation.data,
            presentation.contentType
          );
          
          // Update the presentation with URL and remove data
          event.presentations[i] = {
            filename: presentation.filename,
            url: url,
            contentType: presentation.contentType,
            size: presentation.size,
            uploadedAt: presentation.uploadedAt || new Date(),
          };
          
          hasChanges = true;
          migrated++;
          console.log(`    ✅ Uploaded: ${url}`);
        } catch (error) {
          console.error(`    ❌ Error uploading presentation: ${error}`);
          errors++;
        }
      }
    }
    
    // Migrate images
    if (event.images && event.images.length > 0) {
      for (let i = 0; i < event.images.length; i++) {
        const image = event.images[i];
        
        // Skip if already migrated (has URL but no data)
        if (image.url && !image.data) {
          console.log(`    ⏭️  Image ${i + 1} already migrated: ${image.filename}`);
          skipped++;
          continue;
        }
        
        // Skip if no data to migrate
        if (!image.data) {
          console.log(`    ⚠️  Image ${i + 1} has no data: ${image.filename}`);
          skipped++;
          continue;
        }
        
        try {
          console.log(`    📤 Uploading image ${i + 1}: ${image.filename}`);
          
          const url = await uploadBufferToBlob(
            'events',
            eventId,
            'images',
            image.filename,
            image.data,
            image.contentType
          );
          
          // Update the image with URL and remove data
          event.images[i] = {
            filename: image.filename,
            url: url,
            contentType: image.contentType,
            size: image.size,
            uploadedAt: image.uploadedAt || new Date(),
            order: image.order !== undefined ? image.order : i,
          };
          
          hasChanges = true;
          migrated++;
          console.log(`    ✅ Uploaded: ${url}`);
        } catch (error) {
          console.error(`    ❌ Error uploading image: ${error}`);
          errors++;
        }
      }
    }
    
    // Save event if there were changes
    if (hasChanges) {
      await event.save();
      console.log(`  💾 Event saved`);
    }
  }
  
  return { migrated, skipped, errors };
}

/**
 * Migrate resource thumbnails
 */
async function migrateResources(): Promise<{ migrated: number; skipped: number; errors: number }> {
  console.log('\n📁 Migrating Resources...');
  
  const resources = await Resource.find({
    'thumbnail.data': { $exists: true }
  });
  
  console.log(`Found ${resources.length} resources with potential thumbnails to migrate`);
  
  let migrated = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const resource of resources) {
    const resourceId = resource._id.toString();
    
    console.log(`\n  Processing resource: ${resource.title} (${resourceId})`);
    
    if (!resource.thumbnail) {
      console.log(`    ⚠️  No thumbnail found`);
      skipped++;
      continue;
    }
    
    // Skip if already migrated (has URL but no data)
    if (resource.thumbnail.url && !resource.thumbnail.data) {
      console.log(`    ⏭️  Thumbnail already migrated: ${resource.thumbnail.filename}`);
      skipped++;
      continue;
    }
    
    // Skip if no data to migrate
    if (!resource.thumbnail.data) {
      console.log(`    ⚠️  Thumbnail has no data: ${resource.thumbnail.filename}`);
      skipped++;
      continue;
    }
    
    try {
      console.log(`    📤 Uploading thumbnail: ${resource.thumbnail.filename}`);
      
      const url = await uploadBufferToBlob(
        'resources',
        resourceId,
        'thumbnail',
        resource.thumbnail.filename,
        resource.thumbnail.data,
        resource.thumbnail.contentType
      );
      
      // Update the thumbnail with URL and remove data
      resource.thumbnail = {
        filename: resource.thumbnail.filename,
        url: url,
        contentType: resource.thumbnail.contentType,
        size: resource.thumbnail.size,
      };
      
      await resource.save();
      migrated++;
      console.log(`    ✅ Uploaded: ${url}`);
      console.log(`  💾 Resource saved`);
    } catch (error) {
      console.error(`    ❌ Error uploading thumbnail: ${error}`);
      errors++;
    }
  }
  
  return { migrated, skipped, errors };
}

/**
 * Main migration function
 */
async function main() {
  console.log('🚀 Starting MongoDB to Vercel Blob migration...\n');
  console.log('Environment:');
  console.log(`  MONGODB_URI: ${process.env.MONGODB_URI?.substring(0, 30)}...`);
  console.log(`  BLOB_READ_WRITE_TOKEN: ${process.env.BLOB_READ_WRITE_TOKEN?.substring(0, 20)}...`);
  
  try {
    // Connect to MongoDB
    console.log('\n📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Connected to MongoDB');
    
    // Migrate events
    const eventResults = await migrateEvents();
    
    // Migrate resources
    const resourceResults = await migrateResources();
    
    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Summary');
    console.log('='.repeat(50));
    console.log('\nEvents:');
    console.log(`  ✅ Migrated: ${eventResults.migrated} files`);
    console.log(`  ⏭️  Skipped: ${eventResults.skipped} files`);
    console.log(`  ❌ Errors: ${eventResults.errors} files`);
    console.log('\nResources:');
    console.log(`  ✅ Migrated: ${resourceResults.migrated} files`);
    console.log(`  ⏭️  Skipped: ${resourceResults.skipped} files`);
    console.log(`  ❌ Errors: ${resourceResults.errors} files`);
    console.log('\nTotal:');
    console.log(`  ✅ Migrated: ${eventResults.migrated + resourceResults.migrated} files`);
    console.log(`  ⏭️  Skipped: ${eventResults.skipped + resourceResults.skipped} files`);
    console.log(`  ❌ Errors: ${eventResults.errors + resourceResults.errors} files`);
    
    if (eventResults.errors + resourceResults.errors > 0) {
      console.log('\n⚠️  Some files failed to migrate. Please check the errors above.');
    } else {
      console.log('\n🎉 Migration completed successfully!');
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
}

// Run the migration
main();


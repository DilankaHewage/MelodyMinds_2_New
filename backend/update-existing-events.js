import mongoose from 'mongoose';
import Event from './models/event.model.js';
import Advertiser from './models/advertiser.model.js';
import dotenv from 'dotenv';

dotenv.config();

const updateExistingEvents = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB successfully!');
    
    // Get all events
    const events = await Event.find({});
    console.log(`Found ${events.length} events in database`);
    
    if (events.length === 0) {
      console.log('No events found. Nothing to update.');
      return;
    }
    
    // Get some advertisers to assign events to
    const advertisers = await Advertiser.find({}).limit(3);
    console.log(`Found ${advertisers.length} advertisers`);
    
    if (advertisers.length === 0) {
      console.log('No advertisers found. Cannot update events.');
      return;
    }
    
    // Update each event with an advertiser ID and isActive flag
    let updatedCount = 0;
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const advertiserIndex = i % advertisers.length; // Distribute events among advertisers
      const advertiser = advertisers[advertiserIndex];
      
      // Update the event
      await Event.findByIdAndUpdate(event._id, {
        advertiser: advertiser._id,
        isActive: true
      });
      
      console.log(`Updated event "${event.title}" to belong to advertiser: ${advertiser.firstName} ${advertiser.lastName}`);
      updatedCount++;
    }
    
    console.log(`\n=== UPDATE COMPLETE ===`);
    console.log(`Updated ${updatedCount} events with advertiser IDs`);
    
    // Verify the updates
    console.log('\n=== VERIFICATION ===');
    const updatedEvents = await Event.find({}).populate('advertiser', 'firstName lastName email');
    updatedEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title}`);
      console.log(`   Advertiser: ${event.advertiser.firstName} ${event.advertiser.lastName}`);
      console.log(`   Is Active: ${event.isActive}`);
    });
    
  } catch (error) {
    console.error('Error updating events:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

updateExistingEvents();

import mongoose from 'mongoose';
import Event from './models/event.model.js';
import Advertiser from './models/advertiser.model.js';
import dotenv from 'dotenv';

dotenv.config();

const testEventAccessControl = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB successfully!');
    
    // Get all events with advertiser info
    const allEvents = await Event.find({}).populate('advertiser', 'companyName firstName lastName email');
    console.log('\n=== ALL EVENTS IN DATABASE ===');
    console.log('Total count:', allEvents.length);
    
    allEvents.forEach((event, index) => {
      console.log(`\n${index + 1}. Event ID: ${event._id}`);
      console.log(`   Title: ${event.title}`);
      console.log(`   Advertiser ID: ${event.advertiser._id}`);
      console.log(`   Advertiser Name: ${event.advertiser.firstName} ${event.advertiser.lastName}`);
      console.log(`   Company: ${event.advertiser.companyName}`);
      console.log(`   Is Active: ${event.isActive}`);
    });

    // Get unique advertiser IDs
    const uniqueAdvertiserIds = [...new Set(allEvents.map(event => event.advertiser._id.toString()))];
    console.log('\n=== UNIQUE ADVERTISERS ===');
    uniqueAdvertiserIds.forEach((id, index) => {
      const advertiser = allEvents.find(event => event.advertiser._id.toString() === id)?.advertiser;
      console.log(`${index + 1}. ID: ${id}`);
      console.log(`   Name: ${advertiser.firstName} ${advertiser.lastName}`);
      console.log(`   Email: ${advertiser.email || advertiser.companyEmail}`);
    });

    // Test access control for each advertiser
    console.log('\n=== TESTING EVENT ACCESS CONTROL ===');
    for (let i = 0; i < uniqueAdvertiserIds.length; i++) {
      const advertiserId = uniqueAdvertiserIds[i];
      const advertiser = allEvents.find(event => event.advertiser._id.toString() === advertiserId)?.advertiser;
      
      console.log(`\n--- Testing Advertiser ${i + 1}: ${advertiser.firstName} ${advertiser.lastName} ---`);
      console.log(`Advertiser ID: ${advertiserId}`);
      
      // Simulate the exact query from the controller
      const query = { 
        advertiser: advertiserId,
        isActive: true 
      };
      
      console.log('Database Query:', JSON.stringify(query));
      
      const events = await Event.find(query).sort({ createdAt: -1 });
      
      console.log(`Found events: ${events.length}`);
      events.forEach(event => {
        console.log(`   - ${event.title} (ID: ${event._id})`);
      });
      
      // Verify all returned events belong to this advertiser
      const allBelongToAdvertiser = events.every(event => event.advertiser.toString() === advertiserId);
      console.log(`All events belong to this advertiser: ${allBelongToAdvertiser ? '✅ YES' : '❌ NO'}`);
      
      if (!allBelongToAdvertiser) {
        console.log('❌ ACCESS CONTROL FAILED! This advertiser can see other advertisers\' events!');
        const wrongEvents = events.filter(event => event.advertiser.toString() !== advertiserId);
        wrongEvents.forEach(event => {
          console.log(`   Wrong event: ${event.title} belongs to ${event.advertiser} but shown to ${advertiserId}`);
        });
      }
    }

    // Test cross-advertiser access (should be empty)
    if (uniqueAdvertiserIds.length > 1) {
      console.log('\n=== TESTING CROSS-ADVERTISER ACCESS (SHOULD BE EMPTY) ===');
      const firstAdvertiserId = uniqueAdvertiserIds[0];
      const secondAdvertiserId = uniqueAdvertiserIds[1];
      
      console.log(`Advertiser 1 (${firstAdvertiserId}) trying to see Advertiser 2's events:`);
      const crossAccessTest = await Event.find({ 
        advertiser: secondAdvertiserId,
        isActive: true 
      });
      
      console.log(`Found ${crossAccessTest.length} events for advertiser 2`);
      if (crossAccessTest.length > 0) {
        crossAccessTest.forEach(event => {
          console.log(`   - ${event.title} (Owner: ${event.advertiser})`);
        });
      }
      
      // This should be empty when advertiser 1 queries for advertiser 2's events
      const advertiser1QueryingAdvertiser2 = await Event.find({ 
        advertiser: firstAdvertiserId,
        isActive: true 
      });
      
      console.log(`\nAdvertiser 1's own events (should only see these):`);
      advertiser1QueryingAdvertiser2.forEach(event => {
        console.log(`   - ${event.title} (Owner: ${event.advertiser})`);
      });
    }

    console.log('\n=== EVENT ACCESS CONTROL TEST COMPLETE ===');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

testEventAccessControl();

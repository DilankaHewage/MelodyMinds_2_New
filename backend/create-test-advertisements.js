import mongoose from 'mongoose';
import Advertisement from './models/advertisement.model.js';
import Advertiser from './models/advertiser.model.js';
import dotenv from 'dotenv';

dotenv.config();

const createTestAdvertisements = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB successfully!');
    
    // Get some advertisers to create advertisements for
    const advertisers = await Advertiser.find({}).limit(3);
    console.log(`Found ${advertisers.length} advertisers`);
    
    if (advertisers.length === 0) {
      console.log('No advertisers found. Cannot create test advertisements.');
      return;
    }
    
    // Clear existing advertisements
    await Advertisement.deleteMany({});
    console.log('Cleared existing advertisements');
    
    // Create test advertisements for different advertisers
    const testAdvertisements = [
      {
        title: 'Special Offer - 50% Off Electronics',
        description: 'Get amazing discounts on all electronics this weekend only!',
        image: 'https://example.com/electronics-sale.jpg',
        advertiser: advertisers[0]._id,
        isActive: true
      },
      {
        title: 'New Restaurant Opening',
        description: 'Join us for the grand opening of our new restaurant with special menu items!',
        image: 'https://example.com/restaurant-opening.jpg',
        advertiser: advertisers[0]._id,
        isActive: true
      },
      {
        title: 'Fitness Class Promotion',
        description: 'First month of fitness classes at 50% off. Get fit and healthy!',
        image: 'https://example.com/fitness-classes.jpg',
        advertiser: advertisers[1] ? advertisers[1]._id : advertisers[0]._id,
        isActive: true
      },
      {
        title: 'Car Dealership Sale',
        description: 'End of year clearance sale on all vehicles. Best prices guaranteed!',
        image: 'https://example.com/car-sale.jpg',
        advertiser: advertisers[2] ? advertisers[2]._id : advertisers[0]._id,
        isActive: true
      }
    ];
    
    // Create the advertisements
    const createdAds = await Advertisement.insertMany(testAdvertisements);
    console.log(`Created ${createdAds.length} test advertisements`);
    
    // Display the created advertisements
    console.log('\n=== CREATED ADVERTISEMENTS ===');
    for (let i = 0; i < createdAds.length; i++) {
      const ad = createdAds[i];
      const advertiser = advertisers.find(a => a._id.toString() === ad.advertiser.toString());
      console.log(`${i + 1}. ${ad.title}`);
      console.log(`   Advertiser: ${advertiser.firstName} ${advertiser.lastName} (${advertiser.email || advertiser.companyEmail})`);
      console.log(`   Advertiser ID: ${ad.advertiser}`);
      console.log(`   Advertisement ID: ${ad._id}`);
      console.log('');
    }
    
    // Test the access control query
    console.log('=== TESTING ACCESS CONTROL QUERY ===');
    const firstAdvertiserId = advertisers[0]._id;
    console.log(`Testing query for advertiser ID: ${firstAdvertiserId}`);
    
    const firstAdvertiserAds = await Advertisement.find({ 
      advertiser: firstAdvertiserId,
      isActive: true 
    });
    
    console.log(`Found ${firstAdvertiserAds.length} advertisements for first advertiser`);
    firstAdvertiserAds.forEach(ad => {
      console.log(`   - ${ad.title} (ID: ${ad._id})`);
    });
    
    // Test cross-advertiser access (should not work)
    if (advertisers.length > 1) {
      console.log(`\nTesting cross-advertiser access (should be empty):`);
      const secondAdvertiserId = advertisers[1]._id;
      const crossAccessTest = await Advertisement.find({ 
        advertiser: secondAdvertiserId,
        isActive: true 
      });
      
      console.log(`Advertiser 1 trying to see advertiser 2's ads: ${crossAccessTest.length} ads found`);
      if (crossAccessTest.length > 0) {
        console.log('WARNING: Cross-advertiser access detected!');
      }
    }
    
    console.log('\n=== TEST COMPLETE ===');
    
  } catch (error) {
    console.error('Error creating test advertisements:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createTestAdvertisements();

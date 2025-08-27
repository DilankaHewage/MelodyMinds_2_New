// Simple test script to verify advertisement access control
import mongoose from 'mongoose';
import Advertisement from './models/advertisement.model.js';
import Advertiser from './models/advertiser.model.js';
import dotenv from 'dotenv';

dotenv.config();

const testAccessControl = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all advertisements
    const allAds = await Advertisement.find({}).populate('advertiser', 'companyName firstName lastName email');
    console.log('\n=== ALL ADVERTISEMENTS IN DATABASE ===');
    console.log('Total count:', allAds.length);
    
    allAds.forEach((ad, index) => {
      console.log(`\n${index + 1}. Advertisement ID: ${ad._id}`);
      console.log(`   Title: ${ad.title}`);
      console.log(`   Advertiser ID: ${ad.advertiser._id}`);
      console.log(`   Advertiser Name: ${ad.advertiser.firstName} ${ad.advertiser.lastName}`);
      console.log(`   Company: ${ad.advertiser.companyName}`);
      console.log(`   Is Active: ${ad.isActive}`);
    });

    // Test filtering by advertiser ID
    if (allAds.length > 0) {
      const firstAdvertiserId = allAds[0].advertiser._id;
      console.log('\n=== TESTING FILTER BY ADVERTISER ID ===');
      console.log('Filtering for advertiser ID:', firstAdvertiserId);
      
      const filteredAds = await Advertisement.find({ 
        advertiser: firstAdvertiserId,
        isActive: true 
      });
      
      console.log('Found advertisements for this advertiser:', filteredAds.length);
      filteredAds.forEach(ad => {
        console.log(`   - ${ad.title} (ID: ${ad._id})`);
      });
    }

    // Test with a different advertiser ID (if multiple advertisers exist)
    const uniqueAdvertiserIds = [...new Set(allAds.map(ad => ad.advertiser._id.toString()))];
    if (uniqueAdvertiserIds.length > 1) {
      console.log('\n=== TESTING CROSS-ADVERTISER ACCESS ===');
      const secondAdvertiserId = uniqueAdvertiserIds[1];
      console.log('Testing if advertiser 1 can see advertiser 2\'s ads:');
      
      const crossAccessTest = await Advertisement.find({ 
        advertiser: uniqueAdvertiserIds[0],
        isActive: true 
      });
      
      console.log('Advertiser 1\'s ads:', crossAccessTest.length);
      crossAccessTest.forEach(ad => {
        console.log(`   - ${ad.title} (Owner: ${ad.advertiser._id})`);
      });
    }

    console.log('\n=== TEST COMPLETE ===');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the test
testAccessControl();

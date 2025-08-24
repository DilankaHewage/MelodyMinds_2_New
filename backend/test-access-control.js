import mongoose from 'mongoose';
import Advertisement from './models/advertisement.model.js';
import Advertiser from './models/advertiser.model.js';
import dotenv from 'dotenv';

dotenv.config();

const testAccessControl = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB successfully!');
    
    // Get all advertisements with advertiser info
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

    // Get unique advertiser IDs
    const uniqueAdvertiserIds = [...new Set(allAds.map(ad => ad.advertiser._id.toString()))];
    console.log('\n=== UNIQUE ADVERTISERS ===');
    uniqueAdvertiserIds.forEach((id, index) => {
      const advertiser = allAds.find(ad => ad.advertiser._id.toString() === id)?.advertiser;
      console.log(`${index + 1}. ID: ${id}`);
      console.log(`   Name: ${advertiser.firstName} ${advertiser.lastName}`);
      console.log(`   Email: ${advertiser.email || advertiser.companyEmail}`);
    });

    // Test access control for each advertiser
    console.log('\n=== TESTING ACCESS CONTROL ===');
    for (let i = 0; i < uniqueAdvertiserIds.length; i++) {
      const advertiserId = uniqueAdvertiserIds[i];
      const advertiser = allAds.find(ad => ad.advertiser._id.toString() === advertiserId)?.advertiser;
      
      console.log(`\n--- Testing Advertiser ${i + 1}: ${advertiser.firstName} ${advertiser.lastName} ---`);
      console.log(`Advertiser ID: ${advertiserId}`);
      
      // Simulate the exact query from the controller
      const query = { 
        advertiser: advertiserId,
        isActive: true 
      };
      
      console.log('Database Query:', JSON.stringify(query));
      
      const advertisements = await Advertisement.find(query).sort({ createdAt: -1 });
      
      console.log(`Found advertisements: ${advertisements.length}`);
      advertisements.forEach(ad => {
        console.log(`   - ${ad.title} (ID: ${ad._id})`);
      });
      
      // Verify all returned ads belong to this advertiser
      const allBelongToAdvertiser = advertisements.every(ad => ad.advertiser.toString() === advertiserId);
      console.log(`All ads belong to this advertiser: ${allBelongToAdvertiser ? '✅ YES' : '❌ NO'}`);
      
      if (!allBelongToAdvertiser) {
        console.log('❌ ACCESS CONTROL FAILED! This advertiser can see other advertisers\' ads!');
        const wrongAds = advertisements.filter(ad => ad.advertiser.toString() !== advertiserId);
        wrongAds.forEach(ad => {
          console.log(`   Wrong ad: ${ad.title} belongs to ${ad.advertiser} but shown to ${advertiserId}`);
        });
      }
    }

    // Test cross-advertiser access (should be empty)
    if (uniqueAdvertiserIds.length > 1) {
      console.log('\n=== TESTING CROSS-ADVERTISER ACCESS (SHOULD BE EMPTY) ===');
      const firstAdvertiserId = uniqueAdvertiserIds[0];
      const secondAdvertiserId = uniqueAdvertiserIds[1];
      
      console.log(`Advertiser 1 (${firstAdvertiserId}) trying to see Advertiser 2's ads:`);
      const crossAccessTest = await Advertisement.find({ 
        advertiser: secondAdvertiserId,
        isActive: true 
      });
      
      console.log(`Found ${crossAccessTest.length} advertisements for advertiser 2`);
      if (crossAccessTest.length > 0) {
        crossAccessTest.forEach(ad => {
          console.log(`   - ${ad.title} (Owner: ${ad.advertiser})`);
        });
      }
      
      // This should be empty when advertiser 1 queries for advertiser 2's ads
      const advertiser1QueryingAdvertiser2 = await Advertisement.find({ 
        advertiser: firstAdvertiserId,
        isActive: true 
      });
      
      console.log(`\nAdvertiser 1's own ads (should only see these):`);
      advertiser1QueryingAdvertiser2.forEach(ad => {
        console.log(`   - ${ad.title} (Owner: ${ad.advertiser})`);
      });
    }

    console.log('\n=== ACCESS CONTROL TEST COMPLETE ===');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

testAccessControl();

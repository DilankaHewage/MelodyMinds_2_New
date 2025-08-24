import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB successfully!');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in database:');
    collections.forEach(col => console.log('-', col.name));
    
    // Check if advertisements collection exists
    const hasAdvertisements = collections.some(col => col.name === 'advertisements');
    console.log('\nAdvertisements collection exists:', hasAdvertisements);
    
    if (hasAdvertisements) {
      // Get advertisement count
      const adCount = await mongoose.connection.db.collection('advertisements').countDocuments();
      console.log('Total advertisements in database:', adCount);
      
      if (adCount > 0) {
        // Get a sample advertisement
        const sampleAd = await mongoose.connection.db.collection('advertisements').findOne({});
        console.log('\nSample advertisement:');
        console.log('ID:', sampleAd._id);
        console.log('Title:', sampleAd.title);
        console.log('Advertiser ID:', sampleAd.advertiser);
        console.log('Is Active:', sampleAd.isActive);
      }
    }
    
    // Check advertisers collection
    const hasAdvertisers = collections.some(col => col.name === 'advertisers');
    console.log('\nAdvertisers collection exists:', hasAdvertisers);
    
    if (hasAdvertisers) {
      const advertiserCount = await mongoose.connection.db.collection('advertisers').countDocuments();
      console.log('Total advertisers in database:', advertiserCount);
      
      if (advertiserCount > 0) {
        const sampleAdvertiser = await mongoose.connection.db.collection('advertisers').findOne({});
        console.log('\nSample advertiser:');
        console.log('ID:', sampleAdvertiser._id);
        console.log('Email:', sampleAdvertiser.email || sampleAdvertiser.companyEmail);
        console.log('Name:', sampleAdvertiser.firstName, sampleAdvertiser.lastName);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

testDatabase();

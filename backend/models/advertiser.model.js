import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const advertiserSchema = mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // Ensure unique email
    password: { type: String, required: true }, // Hashed password
    country: { type: String, required: true },
    telephone: { type: String, required: true },
    nicNumber: { type: String, required: true },
    companyName: { type: String, required: true },
    companyPosition: { type: String, required: true },
    companyWebsite: { type: String, required: false },
    companyTelephone: { type: String, required: true },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Method to compare entered password with stored hash
advertiserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Advertiser = mongoose.model('Advertiser', advertiserSchema);

export default Advertiser;
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Pre-save hook to hash the password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next(); // Skip hashing if the password hasn't changed
  }

  // Hash the password before saving
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare entered password with stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  console.log('Entered Password:', enteredPassword); // Debug: Log the entered password
  console.log('Stored Hashed Password:', this.password); // Debug: Log the stored hashed password
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
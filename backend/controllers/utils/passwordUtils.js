import bcrypt from 'bcryptjs';

// Function to hash a password
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Function to compare a plain password with a hashed password
export const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};
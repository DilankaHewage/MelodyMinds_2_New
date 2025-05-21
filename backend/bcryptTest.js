// filepath: /d:/Semester 5/Software Project/MelodyMinds_1/MelodyMinds_1/backend/bcryptTest.js
import bcrypt from 'bcryptjs';

const testPassword = async () => {
  const plainPassword = 'www';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  const isMatch = await bcrypt.compare(plainPassword, hashedPassword);

  console.log('Plain Password:', plainPassword);
  console.log('Hashed Password:', hashedPassword);
  console.log('Password Match Result:', isMatch);
}; // This function hashes a password and then compares it to the original password

testPassword();
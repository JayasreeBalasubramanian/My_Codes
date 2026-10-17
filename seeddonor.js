const mongoose = require('mongoose');
const Donor = require('./models/Donor');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/myfirstdatabase')
  .then(() => console.log('Connected to MongoDB for seeding...'))
  .catch((err) => console.error('Connection error:', err));

const firstNames = ['Aarav', 'Ananya', 'Karthik', 'Divya', 'Surya', 'Priya', 'Vijay', 'Deepika', 'Arun', 'Meena', 'Sanjay', 'Swetha', 'Vignesh', 'Ramya', 'Kavitha', 'Ganesh'];
const lastNames = ['Kumar', 'Rajan', 'Nair', 'Reddy', 'Babu', 'Iyer', 'Raman', 'Devi', 'Murugan', 'Selvam', 'Pandian', 'Nathan'];
const locations = ['Chrompet', 'Tambaram', 'Tambaram Sanatorium', 'Pallavaram', 'Guindy', 'Mambalam', 'Meenambakkam', 'Chitlapakkam', 'Selaiyur', 'Adambakkam'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedDatabase() {
  try {
    // Clears existing records to reset cleanly to 150
    await Donor.deleteMany({});
    
    const donorsList = [];

    // Reduced loop limit from 300 to 150
    for (let i = 1; i <= 150; i++) {
      const firstName = getRandomItem(firstNames);
      const lastName = getRandomItem(lastNames);
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
      const phone = `9${getRandomNumber(100000000, 999999999)}`;
      const age = getRandomNumber(18, 55);
      const bloodGroup = getRandomItem(bloodGroups);
      const location = getRandomItem(locations);

      donorsList.push({
        name,
        email,
        phone,
        age,
        bloodGroup,
        location
      });
    }

    await Donor.insertMany(donorsList);
    console.log('Successfully added 150 mock donors to the database!');
    process.exit();
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seedDatabase();
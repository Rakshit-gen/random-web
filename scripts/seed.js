const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load environment variables if using .env file
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/the-random-web';

const SiteSchema = new mongoose.Schema({
  url: String,
  title: String,
  category: String,
  genres: [String],
  year: Number,
  description: String,
  isApproved: Boolean,
  addedAt: Date,
});

const Site = mongoose.model('Site', SiteSchema);

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Path to your websites.json file
    const jsonPath = path.join(__dirname, '..', 'websites.json');
    
    if (!fs.existsSync(jsonPath)) {
      console.error('❌ Error: websites.json not found!');
      console.log('Please create a websites.json file in the root directory');
      process.exit(1);
    }

    // Read the JSON file
    console.log('Reading websites.json...');
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    // Validate data is an array
    if (!Array.isArray(data)) {
      console.error('❌ Error: websites.json must contain an array of websites');
      process.exit(1);
    }

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing data...');
    const deletedCount = await Site.deleteMany({});
    console.log(`✅ Cleared ${deletedCount.deletedCount} existing records`);

    // Process and insert new data
    console.log('Preparing data for insertion...');
    const websites = data.map(site => ({
      url: site.url,
      title: site.title,
      category: site.category,
      genres: Array.isArray(site.genres) ? site.genres : [],
      year: parseInt(site.year) || new Date().getFullYear(),
      description: site.description || '',
      isApproved: true, // Auto-approve seeded sites
      addedAt: new Date(),
    }));

    // Insert in batches to handle large datasets
    console.log(`Inserting ${websites.length} websites...`);
    const result = await Site.insertMany(websites);
    console.log(`✅ Successfully inserted ${result.length} websites`);

    // Display some stats
    const stats = await Site.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📊 Database Statistics:');
    console.log('------------------------');
    stats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count} sites`);
    });

    const totalApproved = await Site.countDocuments({ isApproved: true });
    console.log(`\nTotal approved sites: ${totalApproved}`);

    await mongoose.disconnect();
    console.log('\n✅ Seeding complete! Database is ready.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the seed function
seed();

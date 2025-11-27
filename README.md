# The Random Web

A discovery platform that lets users visit random fun/creative websites from a database and explore metadata (title, description, genres, year, etc.).

## Features

- **Random Website Discovery**: Click "Go" to discover a random website from the database
- **Submit Websites**: Add new websites with detailed metadata
- **Browse All**: View all approved websites in a paginated list
- **Clean UI**: Minimal, mobile-friendly design using Tailwind CSS and shadcn/ui

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## Project Structure

```
the-random-web/
├── app/
│   ├── api/
│   │   ├── random/route.ts      # GET random site
│   │   ├── sites/
│   │   │   ├── route.ts         # GET all sites (paginated)
│   │   │   └── [id]/route.ts    # GET site by ID
│   │   └── submit/route.ts      # POST new site
│   ├── add/page.tsx             # Submit website form
│   ├── all/page.tsx             # List all websites
│   ├── page.tsx                 # Home page
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/
│   ├── ui/                      # shadcn/ui components
│   └── navigation.tsx           # Navigation bar
├── lib/
│   ├── db.ts                    # MongoDB connection
│   ├── models/
│   │   └── siteModel.ts         # Site schema
│   └── utils.ts                 # Utility functions
└── public/                      # Static assets
```

## API Endpoints

### `GET /api/random`
Returns a random approved website from the database.

**Response:**
```json
{
  "_id": "...",
  "url": "https://example.com",
  "title": "Example Site",
  "category": "Art",
  "genres": ["Interactive", "Fun"],
  "year": 2024,
  "description": "An amazing website",
  "isApproved": true,
  "addedAt": "2024-01-01T00:00:00.000Z"
}
```

### `GET /api/sites?page=1&limit=20`
Returns paginated list of approved websites.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "sites": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### `GET /api/sites/[id]`
Returns a specific website by ID.

### `POST /api/submit`
Submit a new website (requires approval before appearing).

**Request Body:**
```json
{
  "url": "https://example.com",
  "title": "Example Site",
  "category": "Art",
  "genres": "Interactive, Fun",
  "year": 2024,
  "description": "An amazing website"
}
```

## Database Schema

```typescript
{
  url: String,           // Website URL
  title: String,         // Website title
  category: String,      // Main category
  genres: [String],      // Array of genre tags
  year: Number,          // Year created/launched
  description: String,   // Description
  isApproved: Boolean,   // Approval status (default: false)
  addedAt: Date         // Submission timestamp
}
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB instance (local or cloud like MongoDB Atlas)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd the-random-web
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Update the `.env` file with your MongoDB connection string:
```
MONGODB_URI=mongodb://localhost:27017/the-random-web
```

For MongoDB Atlas:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/the-random-web?retryWrites=true&w=majority
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Seeding the Database

You can seed your database with your `websites.json` file. Here's a sample script you can create:

**scripts/seed.js:**
```javascript
const mongoose = require('mongoose');
const fs = require('fs');

// Update with your MongoDB URI
const MONGODB_URI = 'mongodb://localhost:27017/the-random-web';

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
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Read your websites.json file
    const data = JSON.parse(fs.readFileSync('./websites.json', 'utf8'));

    // Clear existing data (optional)
    await Site.deleteMany({});
    console.log('Cleared existing data');

    // Insert new data (mark all as approved)
    const websites = data.map(site => ({
      ...site,
      isApproved: true,
      addedAt: new Date(),
    }));

    await Site.insertMany(websites);
    console.log(`Inserted ${websites.length} websites`);

    await mongoose.disconnect();
    console.log('Seeding complete!');
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
```

Run the seed script:
```bash
node scripts/seed.js
```

### Building for Production

```bash
npm run build
npm start
```

## Development Notes

### Approval System

By default, new website submissions via the `/add` page are set to `isApproved: false`. You'll need to manually approve them in your MongoDB database or create an admin panel.

To manually approve a site in MongoDB:
```javascript
db.sites.updateOne(
  { _id: ObjectId("...") },
  { $set: { isApproved: true } }
)
```

### Adding More Features

Some ideas to extend the project:
- Admin dashboard for approving submissions
- Search and filter functionality
- User ratings and favorites
- Categories page
- API authentication for submissions
- Rate limiting

## Troubleshooting

### MongoDB Connection Issues

If you see connection errors:
1. Check that MongoDB is running locally or your Atlas cluster is accessible
2. Verify the `MONGODB_URI` in your `.env` file
3. Check network/firewall settings for Atlas

### Port Already in Use

If port 3000 is already in use:
```bash
npm run dev -- -p 3001
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
# random-web

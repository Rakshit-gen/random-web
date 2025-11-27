# Complete Setup Guide

This guide will walk you through setting up "The Random Web" from scratch.

## Prerequisites

Before you begin, make sure you have:

- ✅ Node.js 18 or higher installed ([Download](https://nodejs.org/))
- ✅ MongoDB installed locally OR a MongoDB Atlas account ([Get Started](https://www.mongodb.com/cloud/atlas))
- ✅ A code editor (VS Code recommended)
- ✅ Terminal/Command Line access

## Step-by-Step Setup

### 1. Extract the Project

Unzip the project files to your desired location:
```bash
cd /path/to/your/projects
# Extract the-random-web folder here
```

### 2. Install Dependencies

Open terminal in the project folder and run:
```bash
npm install
```

This will install all required packages (Next.js, React, MongoDB, Tailwind, etc.)

**Expected output**: Installation should complete without errors. If you see peer dependency warnings, they're usually safe to ignore.

### 3. Set Up MongoDB

#### Option A: Local MongoDB

If you have MongoDB installed locally:
```bash
# Start MongoDB (if not already running)
mongod
```

#### Option B: MongoDB Atlas (Cloud)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Get your connection string (looks like: `mongodb+srv://...`)
4. Whitelist your IP address in Network Access
5. Create a database user in Database Access

### 4. Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Open `.env` in your editor and update:

**For local MongoDB:**
```
MONGODB_URI=mongodb://localhost:27017/the-random-web
```

**For MongoDB Atlas:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/the-random-web?retryWrites=true&w=majority
```

Replace `username`, `password`, and `cluster` with your actual values.

### 5. Prepare Your Website Data

You have two options:

#### Option A: Use Sample Data

Rename the example file:
```bash
mv websites.example.json websites.json
```

#### Option B: Use Your Own Data

Create a `websites.json` file in the root directory with this format:
```json
[
  {
    "url": "https://example.com",
    "title": "Example Site",
    "category": "Art",
    "genres": ["Interactive", "Fun"],
    "year": 2024,
    "description": "Description of the website"
  }
]
```

**Required fields**: url, title, category, year, description
**Optional fields**: genres (array of strings)

### 6. Seed the Database

Run the seed script to import your websites:
```bash
npm run seed
```

**Expected output:**
```
✅ Connected to MongoDB
✅ Cleared X existing records
✅ Successfully inserted Y websites
📊 Database Statistics: ...
```

If you see errors:
- Check your MongoDB connection string
- Ensure MongoDB is running
- Verify your websites.json is valid JSON

### 7. Start the Development Server

```bash
npm run dev
```

**Expected output:**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Ready in Xms
```

### 8. Test the Application

Open your browser and visit: **http://localhost:3000**

You should see:
- ✅ The Random Web homepage
- ✅ Navigation menu (Home | Add | All)
- ✅ A large "Go" button

**Test the features:**
1. Click "Go" to see a random website
2. Click "Visit" to open the site in a new tab
3. Navigate to "Add" and try submitting a site
4. Navigate to "All" to see all websites

## Troubleshooting

### MongoDB Connection Failed

**Error**: `MongooseServerSelectionError`

**Solutions**:
1. Check MongoDB is running: `mongosh` (should connect)
2. Verify connection string in `.env`
3. For Atlas: Check IP whitelist and database user credentials

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Use a different port
npm run dev -- -p 3001
```

### Module Not Found Errors

**Error**: `Cannot find module 'X'`

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### websites.json Not Found

**Error**: `websites.json not found!`

**Solution**:
- Ensure `websites.json` is in the root directory (not in scripts/)
- Use the provided `websites.example.json` as reference

### No Sites Showing Up

**Check**:
1. Did you run `npm run seed`?
2. Are sites marked as `isApproved: true` in MongoDB?
3. Check MongoDB with: `mongosh` then:
   ```javascript
   use the-random-web
   db.sites.find({ isApproved: true }).count()
   ```

## Verifying Installation

Run these checks to ensure everything is working:

### 1. Check API Endpoints

Visit in browser or use curl:
```bash
# Get random site
curl http://localhost:3000/api/random

# Get all sites
curl http://localhost:3000/api/sites

# Expected: JSON response with site data
```

### 2. Check Database Connection

```bash
mongosh
> use the-random-web
> db.sites.countDocuments()
# Should return number of sites
```

### 3. Check Pages Load

- ✅ Home: http://localhost:3000/
- ✅ Add: http://localhost:3000/add
- ✅ All: http://localhost:3000/all

## Building for Production

When you're ready to deploy:

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Next Steps

Now that your app is running:

1. **Customize the UI**: Edit files in `app/` and `components/`
2. **Add More Sites**: Use the `/add` page or edit `websites.json` and re-seed
3. **Approve Submissions**: Manually update `isApproved` in MongoDB
4. **Deploy**: Consider Vercel, Netlify, or your preferred platform

## Getting Help

If you run into issues:

1. Check this guide's Troubleshooting section
2. Review the main README.md for detailed documentation
3. Check the console for error messages
4. Verify your Node.js version: `node --version` (should be 18+)
5. Verify your MongoDB version: `mongod --version`

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Seed database
npm run seed

# Build for production
npm run build

# Run production server
npm start

# Run linter
npm run lint
```

## Success Checklist

- [ ] Node.js 18+ installed
- [ ] MongoDB running or Atlas configured
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created and configured
- [ ] `websites.json` prepared
- [ ] Database seeded (`npm run seed`)
- [ ] Dev server running (`npm run dev`)
- [ ] Homepage loads at http://localhost:3000
- [ ] "Go" button fetches random sites
- [ ] All pages work (Home, Add, All)

If all items are checked, you're ready to go! 🎉

---

**Need More Help?**
- See README.md for API documentation
- See QUICKSTART.md for quick reference
- See IMPLEMENTATION.md for technical details

# Quick Start Guide

## Setup in 3 Steps

### 1. Install Dependencies
```bash
cd the-random-web
npm install
```

### 2. Configure MongoDB
Create a `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/the-random-web
```

### 3. Run Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

## Key Files to Know

- **API Routes**: `app/api/` - All backend endpoints
- **Database**: `lib/db.ts` and `lib/models/siteModel.ts`
- **Pages**: `app/page.tsx`, `app/add/page.tsx`, `app/all/page.tsx`
- **Environment**: `.env` (create from `.env.example`)

## Database Schema

```typescript
{
  url: String,
  title: String,
  category: String,
  genres: [String],
  year: Number,
  description: String,
  isApproved: Boolean,
  addedAt: Date
}
```

## Seeding Data

To seed your `websites.json` into MongoDB:

1. Install mongoose globally or use npx:
```bash
npm install -g mongoose
```

2. Create `scripts/seed.js` (example in README.md)

3. Run:
```bash
node scripts/seed.js
```

## Common Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/random` | Get random approved site |
| GET | `/api/sites?page=1&limit=20` | Get paginated sites |
| GET | `/api/sites/[id]` | Get site by ID |
| POST | `/api/submit` | Submit new site |

## Troubleshooting

**Can't connect to MongoDB?**
- Check MongoDB is running: `mongod --version`
- Verify connection string in `.env`

**Port 3000 in use?**
```bash
npm run dev -- -p 3001
```

**No sites showing?**
- Seed your database first
- Check `isApproved: true` in MongoDB

## Next Steps

1. Seed your database with `websites.json`
2. Test the random functionality
3. Submit a test website via `/add`
4. Check MongoDB to approve submissions
5. Customize the UI styling
6. Add your own features!

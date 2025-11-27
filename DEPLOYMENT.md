# Deployment Guide

This guide covers deploying "The Random Web" to production.

## Deployment Options

### Option 1: Vercel (Recommended for Next.js)

Vercel is the easiest option since they created Next.js.

#### Prerequisites
- MongoDB Atlas account (free tier works)
- GitHub/GitLab/Bitbucket account
- Vercel account (free tier available)

#### Steps

1. **Prepare Your Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Set Up MongoDB Atlas**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a cluster (free M0 tier)
   - Network Access → Add IP: `0.0.0.0/0` (allow all - Vercel uses dynamic IPs)
   - Database Access → Create a user
   - Get connection string

3. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Add environment variable:
     - Key: `MONGODB_URI`
     - Value: Your Atlas connection string
   - Deploy!

4. **Seed Production Database**
   ```bash
   # Connect to production database
   MONGODB_URI=<your-atlas-uri> npm run seed
   ```

#### Vercel Configuration

Create `vercel.json` (optional):
```json
{
  "env": {
    "MONGODB_URI": "@mongodb_uri"
  }
}
```

---

### Option 2: Netlify

#### Steps

1. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Install command: `npm install`

2. **Environment Variables**
   - Site settings → Environment variables
   - Add: `MONGODB_URI=<your-connection-string>`

3. **Deploy**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

---

### Option 3: DigitalOcean App Platform

#### Steps

1. **Create App**
   - Connect your repository
   - Select branch to deploy

2. **Configure Build**
   - Build command: `npm run build`
   - Run command: `npm start`

3. **Environment Variables**
   - Add `MONGODB_URI`

4. **Deploy**
   - App will auto-deploy on push

---

### Option 4: Railway

#### Steps

1. **Create Project**
   - Go to [railway.app](https://railway.app)
   - New Project → Deploy from GitHub

2. **Add MongoDB**
   - Add Plugin → MongoDB
   - Railway provides `MONGODB_URI` automatically

3. **Configure**
   - Environment variables are set automatically
   - Deploy!

---

### Option 5: Self-Hosted (VPS)

For deployment on your own server (Ubuntu example):

#### Prerequisites
- VPS with Ubuntu 20.04+
- Domain name (optional)
- SSH access

#### Steps

1. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt update
   sudo apt install -y mongodb-org
   sudo systemctl start mongod
   sudo systemctl enable mongod
   
   # Install PM2 for process management
   sudo npm install -g pm2
   ```

2. **Deploy Application**
   ```bash
   # Clone repository
   cd /var/www
   git clone <your-repo-url> the-random-web
   cd the-random-web
   
   # Install dependencies
   npm install
   
   # Create .env file
   nano .env
   # Add: MONGODB_URI=mongodb://localhost:27017/the-random-web
   
   # Build application
   npm run build
   
   # Seed database
   npm run seed
   
   # Start with PM2
   pm2 start npm --name "random-web" -- start
   pm2 save
   pm2 startup
   ```

3. **Configure Nginx (Optional)**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/random-web
   ```
   
   Add:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   Enable and restart:
   ```bash
   sudo ln -s /etc/nginx/sites-available/random-web /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **SSL with Let's Encrypt (Optional)**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

---

## Environment Variables

All platforms need these environment variables:

| Variable | Required | Example |
|----------|----------|---------|
| `MONGODB_URI` | Yes | `mongodb+srv://user:pass@cluster.mongodb.net/db` |

---

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] MongoDB Atlas cluster is created
- [ ] Network access allows connections from deployment platform
- [ ] Database user is created with read/write permissions
- [ ] `MONGODB_URI` is set in environment variables
- [ ] Database is seeded with initial data
- [ ] Application builds successfully: `npm run build`
- [ ] `.env` is NOT committed to version control
- [ ] `.gitignore` includes `.env` and `node_modules`

---

## Post-Deployment Tasks

After deploying:

1. **Test All Endpoints**
   ```bash
   curl https://yourdomain.com/api/random
   curl https://yourdomain.com/api/sites
   ```

2. **Check Site Functionality**
   - Visit homepage
   - Test "Go" button
   - Try submitting a site
   - Check "All" page pagination

3. **Monitor Logs**
   - Vercel: Dashboard → Logs
   - Self-hosted: `pm2 logs random-web`

4. **Set Up Monitoring**
   - Uptime monitoring (UptimeRobot, Pingdom)
   - Error tracking (Sentry)

---

## Performance Optimization

### 1. Database Indexing

```javascript
// Connect to MongoDB and create indexes
db.sites.createIndex({ isApproved: 1 })
db.sites.createIndex({ addedAt: -1 })
db.sites.createIndex({ category: 1 })
```

### 2. Enable Compression

For self-hosted, enable gzip in nginx:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### 3. CDN (Optional)

For better global performance:
- Cloudflare (free tier)
- AWS CloudFront
- Fastly

---

## Maintenance

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Rebuild
npm run build

# Restart (if using PM2)
pm2 restart random-web
```

### Backing Up Database

**MongoDB Atlas**: Automatic backups included

**Self-hosted**:
```bash
# Backup
mongodump --db the-random-web --out /backups/$(date +%Y%m%d)

# Restore
mongorestore --db the-random-web /backups/20240101/the-random-web
```

---

## Scaling Considerations

As your app grows:

1. **Database**: Upgrade to a larger Atlas tier or add read replicas
2. **Compute**: Increase server resources or use auto-scaling
3. **Caching**: Add Redis for frequently accessed data
4. **CDN**: Serve static assets from CDN
5. **Load Balancing**: Use multiple server instances

---

## Troubleshooting Deployment Issues

### Build Fails

- Check Node.js version matches local (18+)
- Ensure all dependencies are in `package.json`
- Review build logs for specific errors

### Database Connection Issues

- Verify `MONGODB_URI` is set correctly
- Check IP whitelist in Atlas (use `0.0.0.0/0` for Vercel)
- Test connection string locally first

### 502/504 Errors

- Check if application is running
- Verify port configuration
- Check server logs for crashes

### Slow Performance

- Add database indexes
- Enable caching
- Use CDN for static assets
- Check for N+1 queries

---

## Security Best Practices

1. **Environment Variables**: Never commit `.env` to git
2. **MongoDB**: Use strong passwords, enable authentication
3. **HTTPS**: Always use SSL in production
4. **Rate Limiting**: Implement for API endpoints
5. **Input Validation**: Already implemented in API routes
6. **CORS**: Configure appropriately if needed

---

## Cost Estimates

**Free Tier Deployment** (suitable for testing/low traffic):
- Vercel: Free
- MongoDB Atlas: Free (M0 - 512MB)
- Domain: ~$10-15/year

**Small Production** (suitable for moderate traffic):
- Vercel Pro: $20/month
- MongoDB Atlas M10: $57/month
- Total: ~$77/month

**Self-Hosted** (suitable for full control):
- VPS (2GB RAM): $10-20/month
- MongoDB: Included
- Domain: ~$10-15/year

---

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/)

---

**Ready to Deploy?** Start with Vercel for the easiest experience!

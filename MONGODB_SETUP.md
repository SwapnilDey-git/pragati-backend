# MongoDB Atlas Setup Guide for Pragati Backend

This guide will help you configure MongoDB Atlas for the Pragati application and prepare it for production deployment.

## Prerequisites

- MongoDB Atlas account (free tier available at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))
- Node.js and npm installed
- Pragati backend code

## Step 1: MongoDB Atlas Setup

### 1.1 Create a MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in
2. Click "Create" to create a new cluster
3. Choose the **FREE** tier (M0 Sandbox)
4. Select your preferred cloud provider and region (choose closest to your users)
5. Name your cluster (e.g., "Pragati")
6. Click "Create Cluster"

### 1.2 Create Database User

1. In the left sidebar, click **Database Access** under "Security"
2. Click **Add New Database User**
3. Choose **Password** authentication method
4. Enter a username (e.g., `pragati_user`)
5. Click **Autogenerate Secure Password** or create your own
6. **IMPORTANT**: Copy and save the password securely
7. Under "Database User Privileges", select **Read and write to any database**
8. Click **Add User**

### 1.3 Configure Network Access

1. In the left sidebar, click **Network Access** under "Security"
2. Click **Add IP Address**
3. For development: Click **Allow Access from Anywhere** (0.0.0.0/0)
   - For production: Add specific IP addresses of your deployment servers
4. Click **Confirm**

### 1.4 Get Connection String

1. Go back to **Database** in the left sidebar
2. Click **Connect** on your cluster
3. Select **Connect your application**
4. Choose **Driver**: Node.js
5. Choose **Version**: Latest (5.5 or later)
6. Copy the connection string (it will look like):
   ```
   mongodb+srv://<username>:<password>@pragati.picucsb.mongodb.net/?retryWrites=true&w=majority&appName=Pragati
   ```

## Step 2: Configure Backend Application

### 2.1 Update .env File

1. Open `pragati-backend/.env`
2. Replace `<db_username>` with your database username
3. Replace `<db_password>` with your database password
4. Add the database name `pragati` after `.mongodb.net/`

**Example:**
```env
MONGO_URI=mongodb+srv://pragati_user:MySecurePassword123@pragati.picucsb.mongodb.net/pragati?retryWrites=true&w=majority&appName=Pragati
PORT=3001
NODE_ENV=development
```

> **Note**: If your password contains special characters (like `@`, `#`, `$`, etc.), you must URL encode them:
> - `@` → `%40`
> - `#` → `%23`
> - `$` → `%24`
> - `%` → `%25`

### 2.2 Update CORS for Production (When Deploying)

When you deploy your frontend, update `server.js`:

```javascript
const allowedOrigins = [
  "http://localhost:3000", 
  "http://127.0.0.1:3000", 
  "http://127.0.0.1:5500", 
  "http://localhost:8000", 
  "http://127.0.0.1:8000",
  "https://your-frontend-app.vercel.app", // Add your production URL
];
```

## Step 3: Test Connection

### 3.1 Install Dependencies

```bash
cd pragati-backend
npm install
```

### 3.2 Start the Server

```bash
npm start
```

### 3.3 Verify Connection

You should see in the console:
```
Connected to MongoDB from ENV
Server is running on port 3001
```

If you see this, your MongoDB Atlas connection is successful! ✅

## Step 4: Database Structure

MongoDB will automatically create the following when you use the application:

### Database: `pragati`

### Collection: `users`

**Schema:**
```javascript
{
  "_id": ObjectId,
  "name": String (unique),
  "userType": "worker" | "contractor",
  "skill": String,
  "location": {
    "type": "Point",
    "coordinates": [longitude, latitude]
  },
  "checkedIn": Boolean,
  "createdAt": Date,
  "updatedAt": Date
}
```

**Indexes:**
- `name`: Unique index (automatically created)
- `location`: 2dsphere geospatial index (automatically created for location-based queries)

## Step 5: Production Deployment

### 5.1 Environment Variables

When deploying to platforms like Railway, Render, or Heroku, set these environment variables:

| Variable | Value | Example |
|----------|-------|---------|
| `MONGO_URI` | Your MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/pragati?retryWrites=true&w=majority` |
| `PORT` | Port number (usually auto-assigned) | `3001` |
| `NODE_ENV` | Environment mode | `production` |

### 5.2 Deployment Platforms

#### Railway
1. Create new project
2. Connect GitHub repository
3. Add environment variables in "Variables" tab
4. Deploy automatically

#### Render
1. Create new Web Service
2. Connect GitHub repository
3. Add environment variables
4. Set build command: `npm install`
5. Set start command: `npm start`

#### Heroku
```bash
heroku create pragati-backend
heroku config:set MONGO_URI="your-connection-string"
heroku config:set NODE_ENV=production
git push heroku main
```

## Troubleshooting

### Connection Errors

**Error: "MongoServerError: bad auth"**
- Check username and password are correct
- Ensure password is URL encoded if it contains special characters

**Error: "MongooseServerSelectionError"**
- Check your IP address is whitelisted in MongoDB Atlas Network Access
- Verify your internet connection

**Error: "Could not connect to MongoDB"**
- Verify the connection string format is correct
- Ensure the database name is included in the URI

### Data Not Persisting

If you see "Connected to In-Memory MongoDB" instead of "Connected to MongoDB from ENV":
- Check that `MONGO_URI` is properly set in `.env`
- Ensure `.env` file is in the same directory as `server.js`
- Verify `require('dotenv').config()` is at the top of `server.js`

## Monitoring and Maintenance

### MongoDB Atlas Dashboard

1. **View Data**: Database → Browse Collections
2. **Monitor Performance**: Metrics tab
3. **Check Logs**: Database → Logs
4. **Backup**: Automated backups available on paid tiers

### Best Practices

- **Regular Backups**: Enable automated backups in production
- **Monitor Usage**: Check Atlas dashboard for storage and connection limits
- **Security**: Use strong passwords and restrict IP access in production
- **Indexing**: The geospatial index is crucial for location-based features
- **Connection Pooling**: Mongoose handles this automatically

## Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Connection String Format](https://docs.mongodb.com/manual/reference/connection-string/)
- [Geospatial Queries in MongoDB](https://docs.mongodb.com/manual/geospatial-queries/)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review MongoDB Atlas logs
3. Check server console output for error messages
4. Verify all environment variables are set correctly

# Pragati Backend

Backend API for the Pragati worker-contractor matching platform.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL with PostGIS)
- **Real-time**: Socket.io
- **Deployment**: Railway

## Features

- User authentication (workers and contractors)
- Geospatial worker search using PostGIS
- Real-time job notifications via Socket.io
- Worker check-in/check-out system

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
PORT=3001
NODE_ENV=development
```

3. Set up Supabase database:
   - Run SQL from `supabase/schema.sql`
   - Run SQL from `supabase/functions.sql`

4. Start the server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login/registration

### Worker Routes
- `POST /api/worker/check-in` - Check in with location and skill
- `POST /api/worker/check-out` - Check out

### Contractor Routes
- `GET /api/contractor/workers` - Get available workers (with optional location and skill filters)

## Documentation

- [Quick Start Guide](./QUICKSTART.md)
- [Supabase Setup Guide](./SUPABASE_SETUP.md)

## License

ISC

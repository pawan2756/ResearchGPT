# Build and Deployment Guide

## 1. Local Environment Prerequisites
- **Node.js**: v20+ (Node v24 supported)
- **MongoDB**: Local MongoDB instance or free MongoDB Atlas URI
- **Git**

## 2. Environment Variables Configuration

### Server (`server/.env`)
Copy `server/.env.example` to `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/researchgpt
JWT_SECRET=supersecretjwtstringatleast32characterslong
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
TAVILY_API_KEY=
CLIENT_ORIGIN=http://localhost:5173
RESEARCH_THRESHOLD=3
MOCK_MODE=false
```
*Note: If `GEMINI_API_KEY` or `TAVILY_API_KEY` are empty or invalid, the server automatically enables Mock Mode.*

### Client (`client/.env`)
Copy `client/.env.example` to `client/.env`:
```env
VITE_API_URL=http://localhost:5000
```

## 3. Installation & Local Development

### Server
```bash
cd server
npm install
npm run dev
```

### Client
```bash
cd client
npm install
npm run dev
```

## 4. Running Automated Tests

```bash
# Run server unit & integration tests
cd server
npm test

# Run client tests
cd client
npm test
```

## 5. Deployment Guide

### Backend (Render / Railway)
- Service type: Web Service
- Build Command: `cd server && npm install`
- Start Command: `cd server && npm start`
- Environment Variables: Set `PORT`, `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `TAVILY_API_KEY`, `CLIENT_ORIGIN`.

### Frontend (Vercel / Netlify)
- Root Directory: `client`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables: `VITE_API_URL` pointing to backend production URL.

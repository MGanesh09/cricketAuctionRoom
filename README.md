# 🏏 CricketAuction - Real-Time Fantasy Cricket Auction Platform

> 🌐 **Live Working Link**: [https://mganesh09.github.io/cricketAuctionRoom/](https://mganesh09.github.io/cricketAuctionRoom/)  
> 📂 **GitHub Repository**: [https://github.com/MGanesh09/cricketAuctionRoom](https://github.com/MGanesh09/cricketAuctionRoom)

**CricketAuction** is a modern, full-stack MERN application that brings the excitement of a live cricket auction to your fingertips. Unlike traditional fantasy leagues, CricketAuction features an interactive real-time bidding system where players are exclusively owned by the highest bidder.

## 🚀 Key Features

- **Live Auction Room**: Real-time bidding powered by Socket.io with dynamic countdown timers, instant highest-bidder updates, and automatic unsold/sold resolution.
- **Dynamic Scoreboard**: Live match scores and series info (Yesterday, Today, Tomorrow) fetched with resilient fallbacks for offline or quota-limited scenarios.
- **Custom Fantasy Points**: League hosts can configure customized scoring rules (Runs, Wickets, Boundaries, Duck penalties, etc.) per tournament.
- **Player Database & Auto-Seed**: Integrated with top international & league players (Virat Kohli, MS Dhoni, Jasprit Bumrah, Rohit Sharma, Pat Cummins, etc.) with auto-seeding.
- **Real-Time Live Chat**: Integrated banter chat within the auction room for a competitive social experience.
- **Automatic Scoring & Rank Tracking**: Daily jobs fetch real match data and calculate fantasy points for each user's squad.
- **Squad Management**: Assign Captains (2x points) and Vice-Captains (1.5x points) to maximize your team's leaderboard potential.
- **Player Profiles & Hall of Fame**: Lifetime point tracking, tournaments won, and most expensive player records.

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, Framer Motion, Lucide-React, Axios, Socket.io-client.
- **Backend**: Node.js, Express, Socket.io, Mongoose (MongoDB), Node-Cron, Bcryptjs, JWT.
- **Database**: MongoDB (Local or Atlas).

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on default port 27017 or MongoDB Atlas connection string)

### 1. Backend Setup
1. Open a terminal and navigate to `backend`:
   ```bash
   cd backend
   npm install
   ```
2. Check or create `backend/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/cricketAuction
   JWT_SECRET=cricketAuction_jwt_secret_key_2026_super_secure
   CRICKET_API_KEY=your_cricapi_key
   ```
3. Start the backend server:
   ```bash
   npm start
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to `frontend`:
   ```bash
   cd frontend
   npm install
   ```
2. Verify `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_SOCKET_URL=http://localhost:5000
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📋 How to Play

1. **Register**: Create an account and name your dream team.
2. **Create/Join**: Start a tournament or join a friend's tournament using the unique invite code.
3. **Auction**: Enter the live auction room. Bid on players using your virtual budget before the countdown timer hits zero!
4. **Manage Squad**: Navigate to "My Squad" and assign your Captain (2x points) and Vice-Captain (1.5x points).
5. **Win**: Earn points based on real match performances and climb to the top of the leaderboard!

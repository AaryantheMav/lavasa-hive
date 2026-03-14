# Lavasa Hive - Roommate Finding Platform

## Project Overview
A full-stack web application for finding roommates and managing room listings in LAVASA.

## Features
- User Authentication (Register/Login)
- Role-based access (User / Developer)
- Create and Manage Room Listings
- Developer Analytics Dashboard
- Roommate Search & Matching
- Search Rooms by Rent Range
- Apply for Rooms
- Manage Applications
- Image Upload for Listings

## Tech Stack
- **Frontend:** React.js, Material-UI
- **Backend:** Node.js, Express.js
- **Database:** SQLite3

## Prerequisites
- [Node.js](https://nodejs.org/) (v14 or later)
- npm (comes with Node.js)

---

## Getting Started with VS Code

### 1. Clone the Repository

Open a terminal (or use the VS Code integrated terminal) and run:

```bash
git clone https://github.com/AaryantheMav/lavasa-hive.git
cd lavasa-hive
```

### 2. Open in VS Code

```bash
code .
```

Or open VS Code manually, then go to **File → Open Folder** and select the `lavasa-hive` folder.

### 3. Set Up the Backend

Open a terminal in VS Code (**Terminal → New Terminal**) and run:

```bash
cd backend
cp .env.example .env
npm install
```

The `.env` file will have these defaults (edit `JWT_SECRET` for production):

```
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=30d
DATABASE_URL=./database.sqlite
```

### 4. Set Up the Frontend

Open a **second terminal** in VS Code (**Terminal → New Terminal**) and run:

```bash
cd frontend
cp .env.example .env
npm install
```

The `.env` file should contain:

```
REACT_APP_API_URL=http://localhost:5000
```

### 5. Run the Application

**Start the backend** (in the first terminal):

```bash
cd backend
npm run dev
```

The backend API will be running at **http://localhost:5000**.

**Start the frontend** (in the second terminal):

```bash
cd frontend
npm start
```

The frontend will open automatically at **http://localhost:3000** in your browser.

### 6. View the Website

Once both servers are running:
- Open your browser and go to **http://localhost:3000**
- Register a new account (choose **User** or **Developer** role)
- Explore the features: browse listings, search rooms, find roommates
- Developers can access the **Dashboard** to post rooms and view analytics

---

## VS Code Recommended Extensions

- **ES7+ React/Redux/React-Native snippets** – React code snippets
- **Prettier** – Code formatting
- **ESLint** – JavaScript linting
- **SQLite Viewer** – View the SQLite database file

## Project Structure

```
lavasa-hive/
├── backend/
│   ├── controllers/    # Route handlers
│   ├── middleware/      # Auth & image upload middleware
│   ├── routes/          # API route definitions
│   ├── server.js        # Express server entry point
│   └── package.json
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # React Context (Auth)
│   │   ├── pages/       # Page components
│   │   └── utils/       # Axios instance & helpers
│   └── package.json
└── README.md
```
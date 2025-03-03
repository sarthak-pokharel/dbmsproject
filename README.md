## Prerequisites
- Node.js (v14 or higher recommended)
- npm (Node Package Manager)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Install backend dependencies:
```bash
cd server
npm install
```

## Configuration

1. Create a `.env` file in the server directory:
```bash
PORT=7777
# Add other environment variables as needed
```

## Usage

1. Start the server:
```bash
cd server
npm start
```

2. Access the application:
- Frontend Dashboard: http://localhost:7777/dashboard.html
- API Base URL: http://localhost:7777/api

## API Documentation

### Base URL
All API routes are prefixed with `/api`

### Available Endpoints
- GET `/` - Server health check
- Additional endpoints (Add your API endpoints documentation here)

## Development

### Backend (Express.js)
- The server is built using Express.js
- CORS is enabled for cross-origin requests
- Static files are served from the `client` directory
- API routes are modularized in the `api` directory

### Frontend
- Static HTML/CSS/JavaScript files served from the `client` directory
- Dashboard available at `/dashboard.html`

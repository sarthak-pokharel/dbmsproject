# Project Name

Brief description of your project goes here.

## Table of Contents
- [Overview](#overview)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)

## Overview
This is a full-stack web application built with Express.js backend and a static frontend client. The application serves static files and provides API endpoints for data management.

## Project Structure
```
project-root/
├── client/                     # Frontend static files
│   ├── index.html             # Main entry page
│   ├── dashboard.html         # Dashboard page
│   ├── categories.html        # Categories management page
│   ├── computers.html         # Computers inventory page
│   ├── lab-utilities.html     # Lab utilities page
│   ├── rooms.html            # Rooms management page
│   ├── smartboards.html      # Smartboards inventory page
│   ├── css/                  # Stylesheets directory
│   └── js/                   # JavaScript files directory
├── server/                    # Backend server code
│   ├── index.js              # Main server entry point
│   ├── dbinit.js            # Database initialization
│   ├── api/                  # API routes
│   ├── uploads/             # File uploads directory
│   ├── package.json         # Node dependencies
│   ├── package-lock.json    # Locked dependencies
│   └── .env                 # Environment variables
└── README.md                 # Project documentation
```

## Prerequisites
- Node.js (v14 or higher recommended)
- npm (Node Package Manager)
- MySQL (v8.0 or higher recommended)

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

1. Create a `.env` file in the server directory with the following variables:
```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=departmentinventory
DB_PORT=3306

PORT=7777

```

## Database Setup

1. Make sure you have MySQL installed and running on your system.

2. Configure your database credentials in the `.env` file as shown above.

3. Run the database setup script:
```bash
cd server
npm run setup
```
This will initialize the database schema and create necessary tables.

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




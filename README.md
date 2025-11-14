# Nigeria Aviation Innovation Hub

A web platform connecting aviation innovators in Nigeria with regulators and resources to develop new technologies safely and sustainably.

## Features

- User registration and authentication for innovators
- Project proposal submission with regulatory feedback
- Knowledge base with aviation regulations and compliance guidelines
- Project dashboard with ICAO basket categorization
- Admin panel for hub managers

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: React + Vite
- **Database**: SQLite (planned)
- **Routing**: React Router

## Project Structure

```
nigeria-aviation-innovation-hub/
├── server/              # Express backend
│   └── index.js        # Main server file
├── client/             # React frontend
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Page components
│   │   ├── App.jsx     # Main app component
│   │   └── main.jsx    # Entry point
│   └── vite.config.js  # Vite configuration
└── package.json        # Root package file
```

## API Documentation

📚 **Interactive API Documentation**: http://localhost:5000/api/docs

The API documentation is available via Swagger UI when the server is running. It includes:
- Complete endpoint documentation with examples
- Request/response schemas
- Authentication requirements
- CSRF protection details
- Rate limiting information

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install root dependencies:
```bash
npm install
```

2. Install client dependencies:
```bash
cd client
npm install
cd ..
```

### Running the Application

#### Option 1: Run both servers concurrently
```bash
npm run dev
```

#### Option 2: Run servers separately

Terminal 1 - Backend (port 5000):
```bash
npm run server
```

Terminal 2 - Frontend (port 3000):
```bash
npm run client
```

### Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## Development Roadmap

### Milestone 1: Project Setup & Homepage ✅
- [x] Project structure
- [x] Express server setup
- [x] React frontend with Vite
- [x] Homepage with navigation
- [x] Basic routing

### Milestone 2: User Authentication ✅
- [x] User registration with email/password
- [x] Login/logout functionality
- [x] Session management with httpOnly cookies
- [x] Password hashing with bcrypt
- [x] Role-based access control (innovator/regulator)
- [x] Protected routes on frontend
- [x] Dynamic navbar showing auth state
- [x] SQLite database integration

### Milestone 3: Project Submission & Listing ✅
- [x] Projects database table with ICAO categories
- [x] Project submission form with validation
- [x] Project listing with category filters
- [x] Project detail pages
- [x] Edit functionality for owners/regulators
- [x] Public viewing, protected creation
- [x] RESTful API endpoints

### Milestone 4: Knowledge Base ✅
- [x] Guidelines index page with 4 ICAO topics
- [x] Individual guideline detail pages
- [x] Aircraft Technology Improvements content
- [x] Operational Improvements content
- [x] Sustainable Aviation Fuels (SAF) content
- [x] Market-Based Measures (CORSIA) content
- [x] Consistent styling and navigation

### Milestone 5: Admin Dashboard ✅
- [x] Regulator-only admin panel
- [x] Project management with status updates
- [x] User management with role changes
- [x] Audit logging system
- [x] Real-time status updates
- [x] Search and filtering
- [x] Toast notifications

## Contributing

This project is in active development. Contributions and suggestions are welcome!

## License

MIT

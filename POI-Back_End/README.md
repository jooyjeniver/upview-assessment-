# POI Explorer API

A Node.js + Express API for the POI Explorer web application that allows users to manage Points of Interest (POIs) and calculate distances between them.

## Features

- User authentication using JWT (register, login, profile management)
- Secure routes protected by JWT authentication middleware
- POI management (create, read, update, delete) linked to authenticated users
- Geospatial calculations using the Haversine formula
  - Distance between two POIs
  - Distance between coordinate pairs
  - Finding POIs within a specific radius
- Sync functionality for offline-first applications, allowing client-side POIs to be synchronized with the server
- SQLite database for persistent storage with proper indexing for performance
- RESTful API structure with consistent response formatting
- Comprehensive error handling

## Project Structure

```
poi-explorer-api/
├── data/                  # SQLite database files
├── src/
│   ├── config/            # Configuration files
│   │   └── database.js    # Database connection and initialization
│   ├── controllers/       # Route handlers
│   │   ├── authController.js     # Authentication operations
│   │   ├── distanceController.js # Distance calculation operations
│   │   ├── poiController.js      # POI CRUD operations
│   │   └── syncController.js     # POI synchronization operations
│   ├── middleware/        # Express middleware
│   │   └── auth.js        # JWT authentication middleware
│   ├── models/            # Database models
│   │   ├── POI.js         # POI data model
│   │   └── User.js        # User data model
│   ├── routes/            # Express routes
│   │   ├── auth.js        # Authentication routes
│   │   ├── distance.js    # Distance calculation routes
│   │   ├── pois.js        # POI management routes
│   │   └── sync.js        # Synchronization routes
│   ├── utils/             # Utility functions
│   │   └── haversine.js   # Distance calculation using Haversine formula
│   └── server.js          # Express application setup
├── .env                   # Environment variables
├── package.json           # Project dependencies and scripts
└── README.md              # Project documentation
```

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   JWT_SECRET=your_secret_key
   JWT_EXPIRES_IN=7d
   NODE_ENV=development
   ```
4. Run the server:
   ```bash
   # Production
   npm start
   
   # Development with auto-reload
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
  - Request body: `{ username, email, password }`
  - Response: User data with JWT token

- `POST /api/auth/login` - Login and get JWT token
  - Request body: `{ username, password }`
  - Response: User data with JWT token

- `GET /api/auth/profile` - Get current user profile (authenticated)
  - Response: User data

- `PUT /api/auth/profile` - Update user profile (authenticated)
  - Request body: `{ username, email, password }`
  - Response: Updated user data

### POIs
- `GET /api/pois` - Get all POIs for authenticated user
  - Response: Array of POI objects

- `GET /api/pois/:id` - Get single POI by ID
  - Response: POI object

- `POST /api/pois` - Create a new POI
  - Request body: `{ name, description, latitude, longitude, category, is_visited, client_id }`
  - Response: Created POI object

- `PUT /api/pois/:id` - Update a POI
  - Request body: `{ name, description, latitude, longitude, category, is_visited }`
  - Response: Updated POI object

- `DELETE /api/pois/:id` - Delete a POI
  - Response: Success message

- `GET /api/pois/nearby` - Find POIs within a specified radius
  - Query parameters: `latitude, longitude, radius` (radius in kilometers)
  - Response: Array of POI objects with distance information

### Synchronization
- `POST /api/sync` - Sync client POIs with server database
  - Request body: `{ pois: [array of POI objects] }`
  - Response: Summary of sync operations and updated POIs

### Distance Calculations
- `POST /api/distance/pois` - Calculate distance between two POIs
  - Request body: `{ poiId1, poiId2 }`
  - Response: Distance in kilometers and POI details

- `POST /api/distance/coordinates` - Calculate distance between coordinate pairs
  - Request body: `{ lat1, lon1, lat2, lon2 }`
  - Response: Distance in kilometers and coordinate details

## Technical Implementation

### Distance Calculation

The API uses the Haversine formula to calculate the great-circle distance between two points on the Earth's surface. This is implemented in the `haversine.js` utility and used throughout the application for:

- Direct distance calculations between coordinate pairs
- Distance calculations between POIs
- Finding POIs within a specific radius

### POI Synchronization

The synchronization endpoint allows client applications to maintain an offline-first architecture by:

1. Sending all local POIs to the server
2. Having the server determine which POIs need to be created, updated, or deleted
3. Performing the necessary operations and returning a comprehensive result

## Error Handling

All API endpoints include proper error handling with appropriate HTTP status codes:

- `400` - Bad Request (invalid input)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource does not exist)
- `409` - Conflict (e.g., duplicate username/email)
- `500` - Internal Server Error

## Recent Optimizations

- Improved the `findNearby` method in the POI model to use the Haversine formula for more accurate proximity calculations
- Fixed a typo in the distance calculation function name for better code clarity
- Removed redundant database configuration file
- Cleaned up unused imports and code

## License

ISC 
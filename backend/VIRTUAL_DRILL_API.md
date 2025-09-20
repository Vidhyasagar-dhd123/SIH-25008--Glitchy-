# Virtual Drill RESTful API Documentation

## Overview
This API provides complete CRUD operations for Virtual Drill management with proper authentication and role-based access control.

## Base URL
```
http://localhost:3000/api/virtualdrills
```

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Public Endpoints (No Authentication Required)

#### 1. Get Public Virtual Drills
```
GET /api/virtualdrills/public
```
**Description:** Get only released virtual drills for public viewing

**Query Parameters:**
- `page` (optional, default: 1) - Page number for pagination
- `limit` (optional, default: 10) - Number of items per page
- `search` (optional) - Search term for name, description, or instructions

**Response:**
```json
{
  "success": true,
  "message": "Public virtual drills fetched successfully",
  "data": {
    "drills": [
      {
        "_id": "drill_id",
        "name": "Drill Name",
        "description": "Drill Description",
        "assests": [...],
        "targets": [...],
        "instructions": "Instructions",
        "released": true,
        "createdBy": {
          "_id": "user_id",
          "name": "Creator Name"
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

### Protected Endpoints (Authentication Required)

#### 2. Create Virtual Drill
```
POST /api/virtualdrills
```
**Description:** Create a new virtual drill (authenticated users only)

**Request Body:**
```json
{
  "name": "Drill Name",
  "description": "Drill Description",
  "assests": [
    {
      "name": "Asset Name",
      "type": "model", // "model", "text", or "raw"
      "imageURL": "https://example.com/image.jpg",
      "isStatic": false,
      "position": { "x": 0, "y": 0, "z": 0 },
      "visible": true,
      "actions": [
        {
          "name": "Action Name",
          "from": 0,
          "to": 100,
          "framerate": 30,
          "loop": false,
          "conditions": [
            { "type": "condition_type", "value": "condition_value" }
          ]
        }
      ]
    }
  ],
  "targets": ["Target 1", "Target 2"],
  "instructions": "Drill Instructions",
  "released": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Virtual drill created successfully",
  "data": {
    "_id": "drill_id",
    "name": "Drill Name",
    // ... full drill object
  }
}
```

#### 3. Get All Virtual Drills
```
GET /api/virtualdrills
```
**Description:** Get all virtual drills with access control (released drills + user's own drills for non-admins)

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `released` (optional) - Filter by release status (true/false)
- `search` (optional) - Search term

#### 4. Get Virtual Drill by ID
```
GET /api/virtualdrills/:id
```
**Description:** Get a specific virtual drill by ID

**Parameters:**
- `id` - Virtual drill ID (MongoDB ObjectId)

#### 5. Update Virtual Drill
```
PUT /api/virtualdrills/:id
```
**Description:** Update a virtual drill (creator or admin only)

**Parameters:**
- `id` - Virtual drill ID

**Request Body:** Same as create, but all fields are optional

#### 6. Delete Virtual Drill
```
DELETE /api/virtualdrills/:id
```
**Description:** Delete a virtual drill (creator or admin only)

**Parameters:**
- `id` - Virtual drill ID

#### 7. Get My Virtual Drills
```
GET /api/virtualdrills/my
```
**Description:** Get current user's virtual drills

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)

### Admin-Only Endpoints

#### 8. Toggle Release Status
```
PATCH /api/virtualdrills/:id/toggle-release
```
**Description:** Toggle the release status of a virtual drill (admin only)

**Parameters:**
- `id` - Virtual drill ID

#### 9. Get All Virtual Drills (Admin)
```
GET /api/virtualdrills/admin/all
```
**Description:** Get all virtual drills including unreleased ones (admin only)

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `search` (optional)
- `released` (optional) - Filter by release status
- `createdBy` (optional) - Filter by creator ID

#### 10. Get Virtual Drill Statistics
```
GET /api/virtualdrills/admin/stats
```
**Description:** Get statistics for admin dashboard (admin only)

**Response:**
```json
{
  "success": true,
  "message": "Virtual drill statistics fetched successfully",
  "data": {
    "statistics": {
      "total": 100,
      "released": 75,
      "unreleased": 25,
      "releaseRate": "75.00"
    },
    "recentDrills": [
      // ... 5 most recent drills
    ]
  }
}
```

### Institute Admin Endpoints

#### 11. Get Institute Virtual Drills
```
GET /api/virtualdrills/institute/drills
```
**Description:** Get virtual drills for institute admin's institute (institute-admin only)

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Error description"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authorization token required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Virtual drill not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Detailed error message (in development mode only)"
}
```

## Data Models

### Virtual Drill Model
```javascript
{
  name: String (required),
  description: String,
  assests: [AssetSchema],
  targets: [String],
  instructions: String,
  released: Boolean (default: false),
  createdBy: ObjectId (ref: User, required)
}
```

### Asset Model
```javascript
{
  name: String (required),
  actions: [ActionSchema],
  imageURL: String (required),
  isStatic: Boolean (default: false),
  type: String (enum: ['model', 'text', 'raw'], required),
  position: { x: Number, y: Number, z: Number },
  visible: Boolean (default: true)
}
```

### Action Model
```javascript
{
  name: String (required),
  from: Number (required),
  to: Number (required),
  framerate: Number (required),
  loop: Boolean (default: false),
  conditions: [{ type: String, value: String }]
}
```

## Rate Limiting
Currently no rate limiting is implemented, but it's recommended for production use.

## Security Features
- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- MongoDB injection protection
- Environment-specific error messages

## Testing
To test the API endpoints, you can use tools like:
- Postman
- Insomnia
- cURL
- Thunder Client (VS Code extension)

Example cURL command:
```bash
curl -X GET "http://localhost:3000/api/virtualdrills/public" \
  -H "Content-Type: application/json"
```

For authenticated endpoints:
```bash
curl -X POST "http://localhost:3000/api/virtualdrills" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name": "Test Drill", "description": "Test Description"}'
```
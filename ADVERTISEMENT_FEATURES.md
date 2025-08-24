# Advertisement Features

## Overview
This application now includes a comprehensive advertisement management system with proper access control.

## Features

### For Advertisers
- **Create Advertisements**: Advertisers can create new advertisements with title, description, and optional image
- **View Own Advertisements**: Advertisers can only view advertisements they created
- **Edit Advertisements**: Advertisers can update their own advertisements
- **Delete Advertisements**: Advertisers can delete their own advertisements (soft delete)

### For Users
- **View All Advertisements**: Users can browse all active advertisements
- **Public Access**: No authentication required to view advertisements

## Access Control

### Backend Security
- **Advertiser-Only Operations**: Create, update, and delete operations are restricted to advertisers only
- **Ownership Verification**: Advertisers can only modify advertisements they created
- **Authentication Required**: Protected routes use JWT token verification
- **User Type Validation**: Middleware checks user type (advertiser vs user)

### Access Control Rules
1. **Users (Public)**: Can view ALL advertisements without authentication
2. **Advertisers**: 
   - Can view ALL advertisements (public browsing)
   - Can create new advertisements
   - Can ONLY view/edit/delete their OWN advertisements
   - Cannot see other advertisers' advertisements in their management panel

### API Endpoints

#### Public Routes (No Authentication Required)
- `GET /api/advertisements` - Get all active advertisements
- `GET /api/advertisements/:id` - Get specific advertisement by ID

#### Protected Routes (Authentication Required)
- `POST /api/advertisements` - Create new advertisement (advertisers only)
- `GET /api/advertisements/advertiser/my-ads` - Get advertiser's own advertisements
- `PUT /api/advertisements/:id` - Update advertisement (owner only)
- `DELETE /api/advertisements/:id` - Delete advertisement (owner only)

## Database Schema

### Advertisement Model
```javascript
{
  title: String (required),
  description: String (required),
  image: String (optional),
  advertiser: ObjectId (required, references Advertiser),
  isActive: Boolean (default: true),
  timestamps: true
}
```

## Frontend Pages

### Advertiser Advertisement Management
- **Route**: `/advertiser-advertisements`
- **Access**: Advertisers only (protected route)
- **Features**: Create, edit, delete, and view own advertisements

### User Advertisements View
- **Route**: `/advertisements`
- **Access**: Public (no authentication required)
- **Features**: Browse all active advertisements

## Navigation

### Header Navigation
- **Advertisements Link**: Available to all users in the main navigation
- **Manage Advertisements**: Available to advertisers in the user dropdown menu

## Security Features

1. **JWT Authentication**: All protected routes require valid JWT tokens
2. **User Type Verification**: Middleware validates user type from JWT
3. **Ownership Checks**: Advertisers can only access their own advertisements
4. **Soft Delete**: Advertisements are marked as inactive rather than permanently removed
5. **Input Validation**: Required fields are validated on both frontend and backend

## Usage Examples

### Creating an Advertisement (Advertiser)
```javascript
const response = await axios.post('/api/advertisements', {
  title: 'Special Offer',
  description: 'Get 20% off on all products',
  image: 'https://example.com/image.jpg'
}, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Viewing All Advertisements (User)
```javascript
const response = await axios.get('/api/advertisements');
const advertisements = response.data.data;
```

### Managing Own Advertisements (Advertiser)
```javascript
const response = await axios.get('/api/advertisements/advertiser/my-ads', {
  headers: { Authorization: `Bearer ${token}` }
});
```

## Error Handling

- **Authentication Errors**: 401 Unauthorized for invalid/missing tokens
- **Authorization Errors**: 403 Forbidden for insufficient permissions
- **Validation Errors**: 400 Bad Request for missing required fields
- **Not Found Errors**: 404 for non-existent advertisements
- **Server Errors**: 500 Internal Server Error for unexpected issues

## Future Enhancements

- Image upload functionality with cloud storage
- Advertisement categories and tags
- Advertisement scheduling and expiration
- Analytics and performance tracking
- Advertisement approval workflow for admins
- Rich text editor for descriptions
- Advertisement templates

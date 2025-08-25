# Testing Advertisement Access Control

## Overview
This guide helps you test that the advertisement access control is working correctly.

## Access Control Rules
1. **Users**: Can view ALL advertisements (public access)
2. **Advertisers**: Can view ALL advertisements publicly, but can only manage their OWN advertisements

## Testing Steps

### 1. Test Public Access (Users)
- Navigate to `/advertisements` without logging in
- Should see all active advertisements
- No authentication required

### 2. Test Advertiser Management
- Login as an advertiser
- Navigate to `/advertiser-advertisements`
- Should only see advertisements created by that advertiser
- Should NOT see advertisements created by other advertisers

### 3. Test Advertiser Public Viewing
- Login as an advertiser
- Navigate to `/advertisements` (public view)
- Should see ALL advertisements (including other advertisers' ads)
- This is correct behavior - advertisers can browse all ads publicly

### 4. Test User Viewing
- Login as a regular user
- Navigate to `/advertisements`
- Should see ALL advertisements
- Should NOT have access to `/advertiser-advertisements`

## Debug Endpoint
To test if the authentication is working:
- Login as an advertiser
- Make a GET request to: `http://localhost:5000/api/advertisements/debug/user-info`
- Should return user information including `userType: 'advertiser'`

## Expected Behavior

### For Advertisers:
- **Public browsing** (`/advertisements`): See ALL advertisements
- **Management panel** (`/advertiser-advertisements`): See ONLY their own advertisements
- **Create/Edit/Delete**: Only their own advertisements

### For Users:
- **Public browsing** (`/advertisements`): See ALL advertisements
- **No access** to advertiser management features

## Common Issues

1. **Token not found**: Check if using correct localStorage key (`token` for advertisers, `userToken` for users)
2. **userType undefined**: Check if authentication middleware is setting `req.user.userType`
3. **Access denied**: Verify JWT token is valid and not expired

## Testing Commands

### Test Public Endpoint
```bash
curl http://localhost:5000/api/advertisements
```

### Test Protected Endpoint (with token)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/advertisements/advertiser/my-ads
```

### Test Debug Endpoint
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/advertisements/debug/user-info
```

## Verification Checklist
- [ ] Users can view all advertisements without login
- [ ] Advertisers can view all advertisements publicly
- [ ] Advertisers can only see their own ads in management panel
- [ ] Advertisers cannot access other advertisers' ads for editing/deleting
- [ ] Authentication middleware properly sets userType
- [ ] JWT tokens are working correctly

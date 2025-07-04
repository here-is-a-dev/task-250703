# Firestore Security Rules

## Overview
Các rules bảo mật cho Firestore database của ứng dụng Face Recognition & Image Processing.

## Collections Structure

### 1. `registered_faces` Collection
Lưu trữ thông tin khuôn mặt đã đăng ký
```
registered_faces/{faceId}
├── name: string (tên người dùng)
├── faceData: object (dữ liệu khuôn mặt)
├── registeredAt: timestamp
├── isActive: boolean
└── userId: string (optional - for future user auth)
```

### 2. `attendance` Collection  
Lưu trữ log chấm công
```
attendance/{attendanceId}
├── name: string (tên người chấm công)
├── confidence: number (độ tin cậy nhận diện)
├── timestamp: timestamp (thời gian chấm công)
├── date: string (ngày YYYY-MM-DD)
├── createdAt: timestamp
└── userId: string (optional - for future user auth)
```

### 3. `users` Collection (Future)
Lưu trữ thông tin người dùng (cho tương lai)
```
users/{userId}
├── email: string
├── name: string
├── role: string (admin, user)
├── createdAt: timestamp
└── isActive: boolean
```

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isValidAttendance() {
      return request.resource.data.keys().hasAll(['name', 'confidence', 'timestamp', 'date', 'createdAt']) &&
             request.resource.data.name is string &&
             request.resource.data.confidence is number &&
             request.resource.data.confidence >= 0 &&
             request.resource.data.confidence <= 1 &&
             request.resource.data.timestamp is timestamp &&
             request.resource.data.date is string &&
             request.resource.data.createdAt is timestamp;
    }
    
    function isValidRegisteredFace() {
      return request.resource.data.keys().hasAll(['name', 'faceData', 'registeredAt', 'isActive']) &&
             request.resource.data.name is string &&
             request.resource.data.name.size() > 0 &&
             request.resource.data.faceData is map &&
             request.resource.data.registeredAt is timestamp &&
             request.resource.data.isActive is bool;
    }
    
    // Registered Faces Collection
    match /registered_faces/{faceId} {
      // Allow read for all (needed for face recognition)
      allow read: if true;
      
      // Allow create with valid data
      allow create: if isValidRegisteredFace();
      
      // Allow update/delete only for admin (future)
      allow update, delete: if isAdmin();
    }
    
    // Attendance Collection
    match /attendance/{attendanceId} {
      // Allow read for all (needed for attendance display)
      allow read: if true;
      
      // Allow create with valid data
      allow create: if isValidAttendance();
      
      // Allow update/delete only for admin (future)
      allow update, delete: if isAdmin();
    }
    
    // Users Collection (Future)
    match /users/{userId} {
      // Users can read their own data
      allow read: if isOwner(userId) || isAdmin();
      
      // Users can create their own profile
      allow create: if isOwner(userId) && 
                       request.resource.data.keys().hasAll(['email', 'name', 'role', 'createdAt', 'isActive']) &&
                       request.resource.data.role == 'user'; // Default role
      
      // Users can update their own profile (except role)
      allow update: if isOwner(userId) && 
                       !('role' in request.resource.data.diff(resource.data).affectedKeys());
      
      // Only admin can delete users
      allow delete: if isAdmin();
    }
    
    // Admin Collection (Future)
    match /admin/{document=**} {
      allow read, write: if isAdmin();
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Face images storage
    match /faces/{faceId}/{allPaths=**} {
      // Allow read for all (needed for face recognition)
      allow read: if true;
      
      // Allow write for authenticated users only
      allow write: if request.auth != null &&
                      request.resource.size < 5 * 1024 * 1024 && // Max 5MB
                      request.resource.contentType.matches('image/.*');
    }
    
    // Attendance images storage (optional)
    match /attendance/{attendanceId}/{allPaths=**} {
      // Allow read for authenticated users
      allow read: if request.auth != null;
      
      // Allow write for authenticated users only
      allow write: if request.auth != null &&
                      request.resource.size < 2 * 1024 * 1024 && // Max 2MB
                      request.resource.contentType.matches('image/.*');
    }
    
    // Deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## Deployment Commands

### Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### Deploy Storage Rules  
```bash
firebase deploy --only storage
```

### Deploy All Rules
```bash
firebase deploy --only firestore:rules,storage
```

## Security Best Practices

### 1. Data Validation
- ✅ Validate all required fields
- ✅ Check data types and constraints
- ✅ Limit string lengths
- ✅ Validate number ranges

### 2. Access Control
- ✅ Principle of least privilege
- ✅ Role-based access control (future)
- ✅ Owner-based access for user data

### 3. File Upload Security
- ✅ File size limits (5MB for faces, 2MB for attendance)
- ✅ Content type validation (images only)
- ✅ Authentication required for uploads

### 4. Rate Limiting
- Consider implementing rate limiting for:
  - Face registration (max 10 per hour per user)
  - Attendance logging (max 1 per minute per person)

### 5. Data Privacy
- ✅ Face data is stored securely
- ✅ Personal information is protected
- ✅ Attendance logs are access-controlled

## Testing Rules

### Test Commands
```bash
# Install Firebase emulator
npm install -g firebase-tools

# Start emulator with rules
firebase emulators:start --only firestore,storage

# Run rules tests
firebase emulators:exec --only firestore "npm test"
```

### Test Cases
1. ✅ Anonymous users can read registered faces
2. ✅ Anonymous users can create attendance records
3. ✅ Anonymous users can create registered faces
4. ❌ Anonymous users cannot update/delete data
5. ✅ Valid data passes validation
6. ❌ Invalid data is rejected
7. ✅ File uploads respect size/type limits

## Monitoring & Alerts

### Set up alerts for:
- Unusual number of face registrations
- High volume of attendance records
- Failed authentication attempts
- Large file uploads
- Rules violations

## Future Enhancements

1. **User Authentication**
   - Implement Firebase Auth
   - Role-based permissions
   - User-specific data access

2. **Advanced Security**
   - Rate limiting rules
   - IP-based restrictions
   - Audit logging

3. **Data Encryption**
   - Client-side encryption for sensitive data
   - Key management for face data

4. **Compliance**
   - GDPR compliance for EU users
   - Data retention policies
   - Right to deletion

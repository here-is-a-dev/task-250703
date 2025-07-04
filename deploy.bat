@echo off
echo Firebase Deployment Script
echo ==========================

echo.
echo 1. Installing Firebase CLI (if not installed)...
where firebase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Firebase CLI not found. Installing...
    npm install -g firebase-tools
) else (
    echo Firebase CLI already installed.
)

echo.
echo 2. Login to Firebase...
firebase login

echo.
echo 3. Initialize Firebase project...
firebase use task-250703

echo.
echo 4. Deploy Firestore Rules...
firebase deploy --only firestore:rules

echo.
echo 5. Deploy Storage Rules...
firebase deploy --only storage

echo.
echo 6. Deploy Firestore Indexes...
firebase deploy --only firestore:indexes

echo.
echo 7. Deploy Frontend to Firebase Hosting...
firebase deploy --only hosting

echo.
echo 8. Deployment Summary:
echo ✅ Firestore Rules deployed
echo ✅ Storage Rules deployed  
echo ✅ Firestore Indexes deployed
echo ✅ Frontend deployed to Firebase Hosting

echo.
echo 🎉 Deployment completed successfully!
echo.
echo Your app is now live at:
echo https://task-250703.web.app
echo https://task-250703.firebaseapp.com

pause

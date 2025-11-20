# Do Not Rent (DNR) List Manager - README

## 📋 Overview
The Do Not Rent (DNR) List Manager is a comprehensive web application for managing guest restrictions with real-time Google Sheets integration. This offline-capable application allows you to maintain a secure list of individuals who should not be rented to, with automatic data synchronization to Google Sheets.

## ✨ Features

### Core Functionality
- ✅ Add, edit, and delete DNR entries
- ✅ Search and filter entries by name and status
- ✅ Automatic 1-year expiration for entries
- ✅ Detailed reason tracking with modal view
- ✅ Room number and location tracking
- ✅ Agent name recording

### Data Management
- ✅ Local storage for offline operation
- ✅ Export to Excel functionality
- ✅ Clear expired entries (older than 1 year)
- ✅ Real-time statistics and counters

### Google Sheets Integration
- ✅ One-time setup with Google Sheets URL
- ✅ Automatic synchronization
- ✅ CSV export for manual import
- ✅ Direct sheet opening
- ✅ No complex authentication required

## 🚀 Quick Start Guide

### Step 1: Setup Google Sheets Integration

1. **Create a Google Sheet:**
   - Go to [Google Sheets](https://sheets.google.com)
   - Create a new spreadsheet
   - Name it "DNR List Manager" or your preferred name

2. **Share the Sheet:**
   - Click the "Share" button
   - Set permissions to "Anyone with the link can edit"
   - Copy the sheet URL

3. **Connect in the App:**
   - Open the DNR app
   - Click "Settings" (gear icon)
   - Paste your Google Sheet URL in the setup section
   - Click "Connect to Sheet"

### Step 2: Using the Application

1. **Adding Entries:**
   - Click "Add New Entry"
   - Fill in required fields (Last Name, First Name, Agent, Reason)
   - Add optional fields (Room Number, Location)
   - Click "Save Entry"

2. **Managing Entries:**
   - Use search box to find specific guests
   - Filter by status (All, Active, Expired)
   - Click "Reason" to view detailed information
   - Click "Delete" to remove entries

3. **Data Sync:**
   - Auto-sync is enabled by default
   - Manual sync available via "Sync Now" button
   - Open connected sheet with "Open Sheet" button

## 🛠️ File Structure

dnr-list-manager/
│
├── index.html                 # Main application file
├── style.css                  # Styles and responsive design
├── config.js                  # Application configuration
├── google-sheets-integration.js  # Google Sheets integration
├── script.js                  # Main application logic
└── images/
    └── star image.jfif        # Application logo

## 🔧 Configuration

### Google Sheets Setup
The application uses a simplified approach:
- No OAuth authentication required
- One-time URL setup
- Automatic reconnection
- CSV fallback for manual import

### Auto-Sync Settings
- Enabled by default
- Syncs after every data change
- Can be disabled in Settings

## 📊 Data Fields

Each DNR entry contains:
- **Last Name** (Required)
- **First Name** (Required) 
- **Room Number** (Optional)
- **Location** (Dropdown selection)
- **Agent Name** (Required)
- **Reason** (Required, detailed description)
- **Date Added** (Auto-generated)
- **Expiry Date** (Auto-set to 1 year from creation)
- **Status** (Auto-calculated: Active/Expired)

## 🔒 Data Security

- All data stored locally in browser
- Google Sheets integration is read/write to your specified sheet
- No external data sharing
- Complete offline capability

## 🌐 Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📱 Mobile Support

- Fully responsive design
- Touch-friendly interface
- Mobile-optimized layouts

## 🚨 Troubleshooting

### Common Issues:

1. **Google Sheets Connection Fails**
   - Verify sheet URL is correct
   - Ensure sheet is shared with "Anyone can edit"
   - Check internet connection

2. **Sync Not Working**
   - Verify auto-sync is enabled in Settings
   - Check if sheet is accessible
   - Try manual sync with "Sync Now"

3. **Data Not Saving**
   - Check browser storage permissions
   - Ensure all required fields are filled
   - Try refreshing the application

### Support:
For technical issues, ensure:
- JavaScript is enabled
- Browser is up to date
- Sufficient storage space available

## 📄 License

This application is provided as-is for internal use. Ensure compliance with your organization's data privacy policies when storing guest information.

## 🔄 Version History
----------------------
- v2.0: Enhanced Google Sheets integration
- v1.0: Initial release with basic functionality

---
Support
-------
System Designed by Yashvanth.

**Note:** This application works completely offline after initial setup. Google Sheets integration requires internet connection for synchronization.
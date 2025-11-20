// App Configuration
const APP_CONFIG = {
    appName: 'DNR List Manager',
    sheetName: 'DNR_List_Manager',
    dataVersion: '2.0'
};

// Default locations for the dropdown
const LOCATIONS = [
    'Front desk',
    'Lobby',
    'Parking',
    'Room',
    'Side walk',
    'Floor',
    'Back parking area',
    'Public area',
    'Stairs',
    'Other'
];

// Google Sheets API configuration (Public access method)
const SHEETS_CONFIG = {
    // This uses Google Sheets API with simplified access
    apiBase: 'https://sheets.googleapis.com/v4/spreadsheets/',
    // We'll use a proxy to avoid CORS issues in development
    proxyUrl: 'https://cors-anywhere.herokuapp.com/'
};
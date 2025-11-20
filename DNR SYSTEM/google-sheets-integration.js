// Google Sheets Integration - Simplified Version
class GoogleSheetsManager {
    constructor() {
        this.sheetId = null;
        this.sheetUrl = null;
        this.isConnected = false;
        this.init();
    }

    init() {
        this.loadStoredConfig();
        this.updateUI();
    }

    loadStoredConfig() {
        const storedConfig = localStorage.getItem('dnr_sheets_config');
        if (storedConfig) {
            const config = JSON.parse(storedConfig);
            this.sheetId = config.sheetId;
            this.sheetUrl = config.sheetUrl;
            this.isConnected = true;
        }
    }

    saveConfig() {
        const config = {
            sheetId: this.sheetId,
            sheetUrl: this.sheetUrl,
            connectedAt: new Date().toISOString()
        };
        localStorage.setItem('dnr_sheets_config', JSON.stringify(config));
    }

    extractSheetIdFromUrl(url) {
        try {
            // Extract sheet ID from various Google Sheets URL formats
            const patterns = [
                /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
                /\/d\/([a-zA-Z0-9-_]+)\//,
                /^([a-zA-Z0-9-_]+)$/
            ];
            
            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match && match[1]) {
                    return match[1];
                }
            }
            return null;
        } catch (error) {
            console.error('Error extracting sheet ID:', error);
            return null;
        }
    }

    async setupConnection(sheetUrl) {
        try {
            const sheetId = this.extractSheetIdFromUrl(sheetUrl);
            if (!sheetId) {
                throw new Error('Invalid Google Sheets URL. Please check the URL format.');
            }

            this.sheetId = sheetId;
            this.sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}`;
            
            // Test connection by trying to read the sheet
            await this.testConnection();
            
            this.isConnected = true;
            this.saveConfig();
            this.updateUI();
            
            return true;
        } catch (error) {
            console.error('Setup error:', error);
            throw error;
        }
    }

    async testConnection() {
        // Simple test to verify sheet exists and is accessible
        const testUrl = `https://docs.google.com/spreadsheets/d/${this.sheetId}/edit`;
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => reject(new Error('Cannot access Google Sheet. Please check the URL and sharing permissions.'));
            img.src = testUrl;
        });
    }

    async syncToSheet(entries) {
        if (!this.isConnected || !this.sheetId) {
            throw new Error('Not connected to Google Sheets');
        }

        try {
            // Prepare data for CSV format (simpler than direct API)
            const csvData = this.convertToCSV(entries);
            
            // Create a downloadable CSV file that user can import to Google Sheets
            this.downloadCSV(csvData, 'dnr_export.csv');
            
            // Also try to open the sheet for manual copy-paste
            this.openSheetForManualUpdate();
            
            return true;
        } catch (error) {
            console.error('Sync error:', error);
            throw error;
        }
    }

    convertToCSV(entries) {
        const headers = ['ID', 'Last Name', 'First Name', 'Room Number', 'Location', 'Agent', 'Reason', 'Date Added', 'Expiry Date', 'Status'];
        const csvRows = [headers.join(',')];
        
        entries.forEach((entry, index) => {
            const isExpired = new Date(entry.expiryDate) < new Date();
            const row = [
                entry.id,
                `"${entry.lastName.replace(/"/g, '""')}"`,
                `"${entry.firstName.replace(/"/g, '""')}"`,
                `"${(entry.room || '').replace(/"/g, '""')}"`,
                `"${(entry.location || '').replace(/"/g, '""')}"`,
                `"${entry.agent.replace(/"/g, '""')}"`,
                `"${entry.reason.replace(/"/g, '""')}"`,
                `"${new Date(entry.date).toLocaleDateString()}"`,
                `"${new Date(entry.expiryDate).toLocaleDateString()}"`,
                `"${isExpired ? 'Expired' : 'Active'}"`
            ];
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }

    downloadCSV(csvData, filename) {
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    openSheetForManualUpdate() {
        if (this.sheetUrl) {
            window.open(this.sheetUrl, '_blank');
        }
    }

    async createNewSheet() {
        try {
            // Open Google Sheets to create a new sheet
            const newSheetUrl = 'https://docs.google.com/spreadsheets/create';
            window.open(newSheetUrl, '_blank');
            
            return 'Please create your sheet, then copy the URL and paste it in the setup.';
        } catch (error) {
            console.error('Error creating new sheet:', error);
            throw error;
        }
    }

    updateUI() {
        const authStatus = document.getElementById('authStatus');
        const syncButton = document.getElementById('syncDrive');
        const openSheetButton = document.getElementById('openSheet');
        const setupSection = document.getElementById('setupSection');

        if (this.isConnected) {
            authStatus.innerHTML = `
                <i class="fas fa-circle status-online"></i>
                <span>Connected to Google Sheets</span>
            `;
            authStatus.style.borderLeftColor = 'var(--success-color)';
            syncButton.disabled = false;
            openSheetButton.disabled = false;
            
            if (setupSection) {
                setupSection.style.display = 'none';
            }
        } else {
            authStatus.innerHTML = `
                <i class="fas fa-circle status-offline"></i>
                <span>Not connected to Google Sheets</span>
            `;
            authStatus.style.borderLeftColor = 'var(--danger-color)';
            syncButton.disabled = true;
            openSheetButton.disabled = true;
            
            if (setupSection) {
                setupSection.style.display = 'block';
            }
        }
    }

    disconnect() {
        this.sheetId = null;
        this.sheetUrl = null;
        this.isConnected = false;
        localStorage.removeItem('dnr_sheets_config');
        this.updateUI();
    }

    getConnectionInfo() {
        return {
            isConnected: this.isConnected,
            sheetId: this.sheetId,
            sheetUrl: this.sheetUrl
        };
    }
}

// Alternative method using Google Apps Script (More reliable)
class GoogleAppsScriptManager {
    constructor() {
        this.scriptUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'; // Replace with your Apps Script URL
        this.isConnected = false;
    }

    async setupWithAppsScript() {
        // This requires setting up a Google Apps Script
        // Instructions provided in setup
        try {
            const response = await fetch(this.scriptUrl + '?action=test');
            const data = await response.json();
            
            if (data.success) {
                this.isConnected = true;
                return true;
            }
        } catch (error) {
            console.error('Apps Script connection failed:', error);
            throw new Error('Please set up Google Apps Script as shown in instructions');
        }
    }

    async syncViaAppsScript(entries) {
        if (!this.isConnected) {
            throw new Error('Not connected via Apps Script');
        }

        const payload = {
            action: 'updateSheet',
            data: entries
        };

        try {
            const response = await fetch(this.scriptUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            
            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('Apps Script sync error:', error);
            throw error;
        }
    }
}

// Initialize Google Sheets Manager
let googleSheetsManager;

function initGoogleSheets() {
    googleSheetsManager = new GoogleSheetsManager();
    window.googleSheetsManager = googleSheetsManager;
}
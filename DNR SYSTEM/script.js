// Main Application Script
class DNRApp {
    constructor() {
        this.entries = [];
        this.filteredEntries = [];
        this.currentEditId = null;
        this.googleSheetsManager = null;
        this.init();
    }

    init() {
        this.loadEntries();
        this.loadSettings();
        this.renderList();
        this.updateStats();
        this.setupEventListeners();
        this.initGoogleSheets();
    }

    setupEventListeners() {
        // Add entry buttons
        document.getElementById('addBtn').addEventListener('click', () => this.openAddModal());
        document.getElementById('emptyAddBtn').addEventListener('click', () => this.openAddModal());
        
        // Form handling
        document.getElementById('entryForm').addEventListener('submit', (e) => this.saveEntry(e));
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeEntryModal());
        
        // Search and filter
        document.getElementById('searchInput').addEventListener('input', () => this.filterEntries());
        document.getElementById('clearSearch').addEventListener('click', () => this.clearSearchInput());
        document.getElementById('statusFilter').addEventListener('change', () => this.filterEntries());
        
        // Settings panel
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
        document.getElementById('closeSettings').addEventListener('click', () => this.closeSettingsPanel());
        document.getElementById('overlay').addEventListener('click', () => this.closeSettingsPanel());
        
        // Google Sheets actions
        document.getElementById('setupDrive').addEventListener('click', () => this.showSetupModal());
        document.getElementById('syncDrive').addEventListener('click', () => this.syncWithGoogleSheets());
        document.getElementById('openSheet').addEventListener('click', () => this.openGoogleSheet());
        document.getElementById('exportExcel').addEventListener('click', () => this.exportToExcel());
        document.getElementById('clearOld').addEventListener('click', () => this.clearExpiredEntries());
        document.getElementById('autoSync').addEventListener('change', (e) => this.toggleAutoSync(e));
        
        // Setup modal
        document.getElementById('createNewSheet').addEventListener('click', () => this.createNewSheet());
        document.getElementById('confirmSetup').addEventListener('click', () => this.confirmSetup());
        
        // Sync modal
        document.getElementById('retrySync').addEventListener('click', () => this.syncWithGoogleSheets());
        document.getElementById('syncSuccessClose').addEventListener('click', () => this.closeSyncModal());
        document.getElementById('syncErrorClose').addEventListener('click', () => this.closeSyncModal());
        
        // Modal close handlers
        document.querySelectorAll('.close').forEach(button => {
            button.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) modal.style.display = 'none';
            });
        });
        
        window.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
            }
        });
    }

    initGoogleSheets() {
        setTimeout(() => {
            if (typeof initGoogleSheets === 'function') {
                initGoogleSheets();
                this.googleSheetsManager = window.googleSheetsManager;
            }
        }, 1000);
    }

    loadEntries() {
        const storedEntries = localStorage.getItem('dnrEntries');
        if (storedEntries) {
            this.entries = JSON.parse(storedEntries);
        }
    }

    saveEntries() {
        localStorage.setItem('dnrEntries', JSON.stringify(this.entries));
        this.updateStats();
        
        // Auto-sync if enabled
        if (localStorage.getItem('autoSync') === 'true' && this.googleSheetsManager && this.googleSheetsManager.isConnected) {
            setTimeout(() => this.syncWithGoogleSheets(), 1000);
        }
    }

    loadSettings() {
        const autoSyncValue = localStorage.getItem('autoSync');
        if (autoSyncValue !== null) {
            document.getElementById('autoSync').checked = autoSyncValue === 'true';
        } else {
            // Default to enabled
            document.getElementById('autoSync').checked = true;
            localStorage.setItem('autoSync', 'true');
        }
        
        const lastSyncTime = localStorage.getItem('lastSyncTime');
        if (lastSyncTime) {
            document.getElementById('syncStatusText').textContent = `Last sync: ${this.formatDateTime(lastSyncTime)}`;
            document.getElementById('lastSync').textContent = this.formatDateTime(lastSyncTime);
        }
    }

    toggleAutoSync(e) {
        localStorage.setItem('autoSync', e.target.checked);
    }

    updateStats() {
        const now = new Date();
        const total = this.entries.length;
        const expired = this.entries.filter(entry => new Date(entry.expiryDate) < now).length;
        const active = total - expired;
        
        document.getElementById('totalEntries').textContent = total;
        document.getElementById('activeEntries').textContent = active;
        document.getElementById('expiredEntries').textContent = expired;
    }

    renderList() {
        const entriesToRender = this.filteredEntries.length > 0 ? this.filteredEntries : this.entries;
        const now = new Date();
        
        if (entriesToRender.length === 0) {
            document.getElementById('dnrList').innerHTML = '';
            document.getElementById('emptyState').style.display = 'block';
            return;
        }
        
        document.getElementById('emptyState').style.display = 'none';
        
        document.getElementById('dnrList').innerHTML = entriesToRender
            .map((entry, index) => {
                const entryDate = new Date(entry.date);
                const expiryDate = new Date(entry.expiryDate);
                const isExpired = expiryDate < now;
                const statusClass = isExpired ? 'status-expired' : 'status-active';
                const statusText = isExpired ? 'Expired' : 'Active';
                
                return `
                    <li class="list-item ${isExpired ? 'expired' : ''}">
                        <div class="item-info">${index + 1}</div>
                        <div class="item-info">
                            <div class="item-name">${this.escapeHtml(entry.lastName)}, ${this.escapeHtml(entry.firstName)}</div>
                        </div>
                        <div class="item-info">${this.escapeHtml(entry.room || '-')}</div>
                        <div class="item-info">${this.escapeHtml(entry.location || '-')}</div>
                        <div class="item-info">${this.escapeHtml(entry.agent)}</div>
                        <div class="item-info">
                            <div class="item-date">${this.formatDate(entry.date)}</div>
                        </div>
                        <div class="item-info">
                            <div class="item-expiry ${isExpired ? 'expired' : ''}">${this.formatDate(entry.expiryDate)}</div>
                        </div>
                        <div class="item-info">
                            <span class="status-badge ${statusClass}">${statusText}</span>
                        </div>
                        <div class="item-actions">
                            <button class="btn-reason" onclick="dnrApp.showReason('${entry.id}')">
                                <i class="fas fa-eye"></i> Reason
                            </button>
                            <button class="btn-delete" onclick="dnrApp.deleteEntry('${entry.id}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </li>
                `;
            })
            .join('');
    }

    filterEntries() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const statusValue = document.getElementById('statusFilter').value;
        const now = new Date();
        
        this.filteredEntries = this.entries.filter(entry => {
            // Search filter
            const nameMatch = entry.lastName.toLowerCase().includes(searchTerm) || 
                             entry.firstName.toLowerCase().includes(searchTerm) ||
                             `${entry.lastName}, ${entry.firstName}`.toLowerCase().includes(searchTerm);
            
            // Status filter
            const isExpired = new Date(entry.expiryDate) < now;
            let statusMatch = true;
            
            if (statusValue === 'active') {
                statusMatch = !isExpired;
            } else if (statusValue === 'expired') {
                statusMatch = isExpired;
            }
            
            return nameMatch && statusMatch;
        });
        
        this.renderList();
    }

    clearSearchInput() {
        document.getElementById('searchInput').value = '';
        this.filterEntries();
    }

    openAddModal() {
        this.currentEditId = null;
        document.getElementById('modalTitle').innerHTML = '<i class="fas fa-user-plus"></i> Add New DNR Entry';
        this.resetForm();
        document.getElementById('entryModal').style.display = 'flex';
        document.getElementById('lastNameInput').focus();
    }

    resetForm() {
        document.getElementById('lastNameInput').value = '';
        document.getElementById('firstNameInput').value = '';
        document.getElementById('roomInput').value = '';
        document.getElementById('locationSelect').value = '';
        document.getElementById('agentInput').value = '';
        document.getElementById('reasonInput').value = '';
    }

    closeEntryModal() {
        document.getElementById('entryModal').style.display = 'none';
        this.currentEditId = null;
    }

    saveEntry(e) {
        e.preventDefault();
        
        const lastName = document.getElementById('lastNameInput').value.trim();
        const firstName = document.getElementById('firstNameInput').value.trim();
        const room = document.getElementById('roomInput').value.trim();
        const location = document.getElementById('locationSelect').value;
        const agent = document.getElementById('agentInput').value.trim();
        const reason = document.getElementById('reasonInput').value.trim();
        
        if (!lastName || !firstName || !agent || !reason) {
            alert('Please fill in all required fields (Last Name, First Name, Agent, and Reason).');
            return;
        }
        
        const now = new Date();
        const expiryDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
        
        if (this.currentEditId) {
            // Update existing entry
            const index = this.entries.findIndex(e => e.id === this.currentEditId);
            if (index !== -1) {
                this.entries[index].lastName = lastName;
                this.entries[index].firstName = firstName;
                this.entries[index].room = room;
                this.entries[index].location = location;
                this.entries[index].agent = agent;
                this.entries[index].reason = reason;
            }
        } else {
            // Add new entry
            const newEntry = {
                id: this.generateId(),
                lastName: lastName,
                firstName: firstName,
                room: room,
                location: location,
                agent: agent,
                reason: reason,
                date: now.toISOString(),
                expiryDate: expiryDate.toISOString()
            };
            this.entries.unshift(newEntry);
        }
        
        this.saveEntries();
        this.renderList();
        this.closeEntryModal();
    }

    showReason(id) {
        const entry = this.entries.find(e => e.id === id);
        if (!entry) return;
        
        document.getElementById('reasonTitle').innerHTML = '<i class="fas fa-eye"></i> Reason Details';
        document.getElementById('guestName').textContent = `${entry.lastName}, ${entry.firstName}`;
        document.getElementById('guestDetails').textContent = `Room: ${entry.room || 'N/A'} | Location: ${entry.location || 'N/A'} | Agent: ${entry.agent}`;
        document.getElementById('reasonText').textContent = entry.reason;
        document.getElementById('reasonModal').style.display = 'flex';
    }

    deleteEntry(id) {
        if (confirm('Are you sure you want to delete this entry?')) {
            this.entries = this.entries.filter(entry => entry.id !== id);
            this.saveEntries();
            this.renderList();
        }
    }

    openSettings() {
        document.getElementById('settingsPanel').classList.add('active');
        document.getElementById('overlay').classList.add('active');
    }

    closeSettingsPanel() {
        document.getElementById('settingsPanel').classList.remove('active');
        document.getElementById('overlay').classList.remove('active');
    }

    showSetupModal() {
        document.getElementById('setupModal').style.display = 'flex';
    }

    async createNewSheet() {
        try {
            const message = await this.googleSheetsManager.createNewSheet();
            alert(message);
        } catch (error) {
            alert('Error: ' + error.message);
        }
    }

    async confirmSetup() {
        const sheetUrl = document.getElementById('setupSheetUrl').value.trim();
        
        if (!sheetUrl) {
            alert('Please enter a valid Google Sheets URL');
            return;
        }

        try {
            await this.googleSheetsManager.setupConnection(sheetUrl);
            document.getElementById('setupModal').style.display = 'none';
            alert('Successfully connected to Google Sheets! Auto-sync is now enabled.');
            
            // Do initial sync
            this.syncWithGoogleSheets();
        } catch (error) {
            alert('Setup failed: ' + error.message);
        }
    }

    async syncWithGoogleSheets() {
        if (!this.googleSheetsManager || !this.googleSheetsManager.isConnected) {
            alert('Please set up Google Sheets connection first in Settings');
            return;
        }

        this.showSyncModal();
        this.updateProgress(10);

        try {
            this.updateProgress(50);
            await this.googleSheetsManager.syncToSheet(this.entries);
            this.updateProgress(100);

            // Update sync status
            const now = new Date().toISOString();
            localStorage.setItem('lastSyncTime', now);
            document.getElementById('syncStatusText').textContent = `Last sync: ${this.formatDateTime(now)}`;
            document.getElementById('lastSync').textContent = this.formatDateTime(now);

            // Show success
            setTimeout(() => {
                document.getElementById('syncStatus').classList.add('hidden');
                document.getElementById('syncSuccess').classList.remove('hidden');
            }, 500);

        } catch (error) {
            console.error('Sync error:', error);
            document.getElementById('errorMessage').textContent = error.message || 'Unable to sync with Google Sheets. Please try again.';
            document.getElementById('syncStatus').classList.add('hidden');
            document.getElementById('syncError').classList.remove('hidden');
        }
    }

    openGoogleSheet() {
        if (this.googleSheetsManager && this.googleSheetsManager.isConnected) {
            this.googleSheetsManager.openSheetForManualUpdate();
        }
    }

    showSyncModal() {
        document.getElementById('syncModal').style.display = 'flex';
        document.getElementById('syncStatus').classList.remove('hidden');
        document.getElementById('syncSuccess').classList.add('hidden');
        document.getElementById('syncError').classList.add('hidden');
    }

    closeSyncModal() {
        document.getElementById('syncModal').style.display = 'none';
    }

    updateProgress(percent) {
        document.getElementById('progressFill').style.width = `${percent}%`;
    }

    exportToExcel() {
        if (this.entries.length === 0) {
            alert('No data to export.');
            return;
        }
        
        // Prepare data for Excel
        const excelData = this.entries.map((entry, index) => ({
            'S.No': index + 1,
            'Last Name': entry.lastName,
            'First Name': entry.firstName,
            'Room Number': entry.room || '',
            'Location': entry.location || '',
            'Agent': entry.agent,
            'Reason': entry.reason,
            'Date Added': this.formatDate(entry.date),
            'Expiry Date': this.formatDate(entry.expiryDate),
            'Status': new Date(entry.expiryDate) < new Date() ? 'Expired' : 'Active'
        }));
        
        // Create worksheet and workbook
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'DNR List');
        
        // Generate Excel file and trigger download
        const fileName = `DNR_List_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    }

    clearExpiredEntries() {
        const now = new Date();
        const expiredCount = this.entries.filter(entry => new Date(entry.expiryDate) < now).length;
        
        if (expiredCount === 0) {
            alert('No expired entries to clear.');
            return;
        }
        
        if (confirm(`Are you sure you want to clear ${expiredCount} expired entries?`)) {
            this.entries = this.entries.filter(entry => new Date(entry.expiryDate) >= now);
            this.saveEntries();
            this.renderList();
            alert(`${expiredCount} expired entries have been cleared.`);
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is loaded
let dnrApp;

document.addEventListener('DOMContentLoaded', () => {
    dnrApp = new DNRApp();
    window.dnrApp = dnrApp;
});
class InventoryManager {
    constructor() {
        this.setupEventListeners();
        this.currentSection = 'computers';
    }

    setupEventListeners() {
        // Navigation
        $('.nav-link').on('click', (e) => {
            e.preventDefault();
            const section = $(e.currentTarget).data('section');
            this.switchSection(section);
        });

        // Auth events
        $(document).on('auth:login', () => this.loadInitialData());
        $(document).on('auth:logout', () => this.clearData());

        // Setup CRUD event listeners
        this.setupComputerEvents();
        this.setupRoomEvents();
        this.setupSmartBoardEvents();
        this.setupCategoryEvents();
        this.setupLabUtilityEvents();
    }

    // Section Management
    switchSection(section) {
        $('.content-section').addClass('d-none');
        $(`#${section}Section`).removeClass('d-none');
        $('.nav-link').removeClass('active');
        $(`.nav-link[data-section="${section}"]`).addClass('active');
        this.currentSection = section;
    }

    // Data Loading
    async loadInitialData() {
        try {
            await Promise.all([
                this.loadComputers(),
                this.loadRooms(),
                this.loadSmartBoards(),
                this.loadCategories(),
                this.loadLabUtilities()
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error);
            alert('Error loading data. Please try again.');
        }
    }

    clearData() {
        $('#computersTable tbody').empty();
        $('#roomsTable tbody').empty();
        $('#smartBoardsTable tbody').empty();
        $('#categoriesTable tbody').empty();
        $('#labUtilitiesTable tbody').empty();
    }

    // Computers
    async loadComputers() {
        try {
            const response = await axios.get(`${config.apiBaseUrl}${config.endpoints.getAllComputers}`);
            const computers = response.data;
            
            const tbody = $('#computersTable tbody');
            tbody.empty();
            
            computers.forEach(computer => {
                tbody.append(`
                    <tr>
                        <td>${computer.label}</td>
                        <td>${computer.install_date ? new Date(computer.install_date).toLocaleDateString() : '-'}</td>
                        <td><span class="status-badge status-${computer.status.toLowerCase()}">${computer.status}</span></td>
                        <td>${computer.belongstocategory}</td>
                        <td>${computer.isassignedto}</td>
                        <td>
                            <button class="btn btn-sm btn-primary action-btn edit-computer" data-id="${computer.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger action-btn delete-computer" data-id="${computer.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `);
            });
        } catch (error) {
            console.error('Error loading computers:', error);
            alert('Error loading computers. Please try again.');
        }
    }

    setupComputerEvents() {
        // Add Computer
        $('#saveComputerBtn').on('click', async () => {
            const formData = {
                label: $('#addComputerForm [name="label"]').val(),
                install_date: $('#addComputerForm [name="install_date"]').val(),
                isassignedto: parseInt($('#addComputerForm [name="room"]').val()),
                belongstocategory: parseInt($('#addComputerForm [name="category"]').val()),
                status: $('#addComputerForm [name="status"]').val()
            };

            try {
                await axios.post(`${config.apiBaseUrl}${config.endpoints.createComputer}`, formData);
                $('#addComputerModal').modal('hide');
                $('#addComputerForm')[0].reset();
                this.loadComputers();
            } catch (error) {
                console.error('Error adding computer:', error);
                alert(error.response?.data?.message || 'Error adding computer. Please try again.');
            }
        });

        // Edit Computer
        $('#computersTable').on('click', '.edit-computer', async (e) => {
            const id = $(e.currentTarget).data('id');
            try {
                const response = await axios.get(`${config.apiBaseUrl}${config.endpoints.getComputer}/${id}`);
                const computer = response.data;
                
                // Populate edit form
                $('#editComputerForm [name="label"]').val(computer.label);
                $('#editComputerForm [name="install_date"]').val(computer.install_date ? computer.install_date.split('T')[0] : '');
                $('#editComputerForm [name="room"]').val(computer.isassignedto);
                $('#editComputerForm [name="category"]').val(computer.belongstocategory);
                $('#editComputerForm [name="status"]').val(computer.status);
                
                // Store computer ID
                $('#editComputerForm').data('id', id);
                
                // Show modal
                $('#editComputerModal').modal('show');
            } catch (error) {
                console.error('Error loading computer details:', error);
                alert('Error loading computer details. Please try again.');
            }
        });

        // Save Edit
        $('#saveEditComputerBtn').on('click', async () => {
            const id = $('#editComputerForm').data('id');
            const formData = {
                label: $('#editComputerForm [name="label"]').val(),
                install_date: $('#editComputerForm [name="install_date"]').val(),
                isassignedto: parseInt($('#editComputerForm [name="room"]').val()),
                belongstocategory: parseInt($('#editComputerForm [name="category"]').val()),
                status: $('#editComputerForm [name="status"]').val()
            };

            try {
                await axios.put(`${config.apiBaseUrl}${config.endpoints.updateComputer}/${id}`, formData);
                $('#editComputerModal').modal('hide');
                this.loadComputers();
            } catch (error) {
                console.error('Error updating computer:', error);
                alert(error.response?.data?.message || 'Error updating computer. Please try again.');
            }
        });

        // Delete Computer
        $('#computersTable').on('click', '.delete-computer', async (e) => {
            if (confirm('Are you sure you want to delete this computer?')) {
                const id = $(e.currentTarget).data('id');
                try {
                    await axios.delete(`${config.apiBaseUrl}${config.endpoints.deleteComputer}/${id}`);
                    this.loadComputers();
                } catch (error) {
                    console.error('Error deleting computer:', error);
                    alert(error.response?.data?.message || 'Error deleting computer. Please try again.');
                }
            }
        });
    }

    // Rooms
    async loadRooms() {
        try {
            const response = await axios.get(`${config.apiBaseUrl}${config.endpoints.getAllRooms}`);
            const rooms = response.data;
            
            const tbody = $('#roomsTable tbody');
            tbody.empty();
            
            rooms.forEach(room => {
                tbody.append(`
                    <tr>
                        <td>${room.label}</td>
                        <td>${room.type}</td>
                        <td><span class="status-badge status-${room.status.toLowerCase()}">${room.status}</span></td>
                        <td>
                            <button class="btn btn-sm btn-primary action-btn edit-room" data-id="${room.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger action-btn delete-room" data-id="${room.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `);
            });
        } catch (error) {
            console.error('Error loading rooms:', error);
            alert('Error loading rooms. Please try again.');
        }
    }

    setupRoomEvents() {
        // Similar to computer events, implement room CRUD operations
    }

    // Smart Boards
    async loadSmartBoards() {
        try {
            const response = await axios.get(`${config.apiBaseUrl}${config.endpoints.getAllSmartBoards}`);
            const smartBoards = response.data;
            
            const tbody = $('#smartBoardsTable tbody');
            tbody.empty();
            
            smartBoards.forEach(board => {
                tbody.append(`
                    <tr>
                        <td>${board.model_id}</td>
                        <td><span class="status-badge status-${board.status.toLowerCase()}">${board.status}</span></td>
                        <td>${board.room_name}</td>
                        <td>
                            <button class="btn btn-sm btn-primary action-btn edit-smartboard" data-id="${board.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger action-btn delete-smartboard" data-id="${board.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `);
            });
        } catch (error) {
            console.error('Error loading smart boards:', error);
            alert('Error loading smart boards. Please try again.');
        }
    }

    setupSmartBoardEvents() {
        // Similar to computer events, implement smart board CRUD operations
    }

    // Categories
    async loadCategories() {
        try {
            const response = await axios.get(`${config.apiBaseUrl}${config.endpoints.getAllCategories}`);
            const categories = response.data;
            
            const tbody = $('#categoriesTable tbody');
            tbody.empty();
            
            categories.forEach(category => {
                tbody.append(`
                    <tr>
                        <td>${category.label}</td>
                        <td>${category.description || '-'}</td>
                        <td>
                            <button class="btn btn-sm btn-primary action-btn edit-category" data-id="${category.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger action-btn delete-category" data-id="${category.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `);
            });

            // Update category dropdowns
            this.updateCategoryDropdowns(categories);
        } catch (error) {
            console.error('Error loading categories:', error);
            alert('Error loading categories. Please try again.');
        }
    }

    setupCategoryEvents() {
        // Similar to computer events, implement category CRUD operations
    }

    // Utility Functions
    updateCategoryDropdowns(categories) {
        const options = categories.map(category => 
            `<option value="${category.id}">${category.label}</option>`
        ).join('');

        $('select[name="category"]').html(`
            <option value="">Select Category</option>
            ${options}
        `);
    }

    showSpinner() {
        if (!$('.spinner-overlay').length) {
            $('body').append(`
                <div class="spinner-overlay">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            `);
        }
    }

    hideSpinner() {
        $('.spinner-overlay').remove();
    }

    // Lab Utilities
    async loadLabUtilities() {
        try {
            const response = await axios.get(`${config.apiBaseUrl}${config.endpoints.getAllLabUtilities}`);
            const utilities = response.data;
            
            const tbody = $('#labUtilitiesTable tbody');
            tbody.empty();
            
            utilities.forEach(utility => {
                tbody.append(`
                    <tr>
                        <td>${utility.name}</td>
                        <td>${utility.type}</td>
                        <td><span class="status-badge status-${utility.status.toLowerCase()}">${utility.status}</span></td>
                        <td>${utility.room}</td>
                        <td>
                            <button class="btn btn-sm btn-primary action-btn edit-utility" data-id="${utility.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger action-btn delete-utility" data-id="${utility.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `);
            });
        } catch (error) {
            console.error('Error loading lab utilities:', error);
            alert('Error loading lab utilities. Please try again.');
        }
    }

    setupLabUtilityEvents() {
        // Add Lab Utility
        $('#saveLabUtilityBtn').on('click', async () => {
            const formData = {
                name: $('#addLabUtilityForm [name="name"]').val(),
                type: $('#addLabUtilityForm [name="type"]').val(),
                status: $('#addLabUtilityForm [name="status"]').val(),
                room: $('#addLabUtilityForm [name="room"]').val()
            };

            try {
                await axios.post(`${config.apiBaseUrl}${config.endpoints.createLabUtility}`, formData);
                $('#addLabUtilityModal').modal('hide');
                this.loadLabUtilities();
            } catch (error) {
                console.error('Error adding lab utility:', error);
                alert('Error adding lab utility. Please try again.');
            }
        });

        // Edit Lab Utility
        $('#labUtilitiesTable').on('click', '.edit-utility', async (e) => {
            const id = $(e.currentTarget).data('id');
            try {
                const response = await axios.get(`${config.apiBaseUrl}${config.endpoints.getLabUtility}/${id}`);
                const utility = response.data;
                
                // Populate edit form
                $('#editLabUtilityForm [name="name"]').val(utility.name);
                $('#editLabUtilityForm [name="type"]').val(utility.type);
                $('#editLabUtilityForm [name="status"]').val(utility.status);
                $('#editLabUtilityForm [name="room"]').val(utility.room);
                $('#editLabUtilityForm [name="id"]').val(utility.id);
                
                $('#editLabUtilityModal').modal('show');
            } catch (error) {
                console.error('Error loading lab utility details:', error);
                alert('Error loading lab utility details. Please try again.');
            }
        });

        // Update Lab Utility
        $('#updateLabUtilityBtn').on('click', async () => {
            const id = $('#editLabUtilityForm [name="id"]').val();
            const formData = {
                name: $('#editLabUtilityForm [name="name"]').val(),
                type: $('#editLabUtilityForm [name="type"]').val(),
                status: $('#editLabUtilityForm [name="status"]').val(),
                room: $('#editLabUtilityForm [name="room"]').val()
            };

            try {
                await axios.put(`${config.apiBaseUrl}${config.endpoints.updateLabUtility}/${id}`, formData);
                $('#editLabUtilityModal').modal('hide');
                this.loadLabUtilities();
            } catch (error) {
                console.error('Error updating lab utility:', error);
                alert('Error updating lab utility. Please try again.');
            }
        });

        // Delete Lab Utility
        $('#labUtilitiesTable').on('click', '.delete-utility', async (e) => {
            if (confirm('Are you sure you want to delete this lab utility?')) {
                const id = $(e.currentTarget).data('id');
                try {
                    await axios.delete(`${config.apiBaseUrl}${config.endpoints.deleteLabUtility}/${id}`);
                    this.loadLabUtilities();
                } catch (error) {
                    console.error('Error deleting lab utility:', error);
                    alert('Error deleting lab utility. Please try again.');
                }
            }
        });
    }
}

// Create and initialize the inventory manager
const inventoryManager = new InventoryManager();

// Add axios interceptors for loading states
axios.interceptors.request.use(
    (config) => {
        inventoryManager.showSpinner();
        return config;
    },
    (error) => {
        inventoryManager.hideSpinner();
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(
    (response) => {
        inventoryManager.hideSpinner();
        return response;
    },
    (error) => {
        inventoryManager.hideSpinner();
        return Promise.reject(error);
    }
); 
class ComputerManager {
    constructor() {
        this.categories = new Map();
        this.rooms = new Map();
        this.currentSort = {
            field: null,
            direction: 'asc'
        };
        this.setupEventListeners();
        this.loadCategories();
        this.loadRooms();
        this.loadComputers();
    }

    setupEventListeners() {
        // Add Computer
        $('#saveComputerBtn').on('click', () => this.saveComputer());

        // Edit Computer
        $('#computersTable').on('click', '.edit-computer', (e) => this.editComputer(e));

        // Save Edit
        $('#updateComputerBtn').on('click', () => this.updateComputer());

        // Delete Computer
        $('#computersTable').on('click', '.delete-computer', (e) => this.deleteComputer(e));

        // Add sorting event listener
        $('#computersTable').on('click', '.sortable', (e) => this.handleSort(e));
    }

    handleSort(e) {
        const field = $(e.currentTarget).data('sort');
        if (this.currentSort.field === field) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.field = field;
            this.currentSort.direction = 'asc';
        }
        this.loadComputers();
    }

    updateSortIcons() {
        $('.sortable i').removeClass('fa-sort-up fa-sort-down').addClass('fa-sort');
        if (this.currentSort.field) {
            const icon = this.currentSort.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
            $(`.sortable[data-sort="${this.currentSort.field}"] i`).removeClass('fa-sort').addClass(icon);
        }
    }

    sortComputers(computers) {
        if (!this.currentSort.field) return computers;

        return [...computers].sort((a, b) => {
            let aVal = a[this.currentSort.field];
            let bVal = b[this.currentSort.field];

            if (this.currentSort.field === 'install_date') {
                aVal = aVal ? new Date(aVal) : new Date(0);
                bVal = bVal ? new Date(bVal) : new Date(0);
            } else if (this.currentSort.field === 'room') {
                aVal = this.rooms.get(a.isassignedto) || '';
                bVal = this.rooms.get(b.isassignedto) || '';
            } else if (this.currentSort.field === 'quantity') {
                aVal = Number(aVal);
                bVal = Number(bVal);
            }

            if (aVal < bVal) return this.currentSort.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.currentSort.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    async loadComputers() {
        try {
            const response = await axios.get(`${config.apiBaseUrl}${config.endpoints.getAllComputers}`);
            let computers = response.data;
            
            // Apply sorting
            computers = this.sortComputers(computers);
            
            const tbody = $('#computersTable tbody');
            tbody.empty();
            
            computers.forEach(computer => {
                const categoryLabel = this.categories.get(computer.belongstocategory) || 'Unknown Category';
                const roomLabel = this.rooms.get(computer.isassignedto) || 'Unknown Room';
                
                tbody.append(`
                    <tr>
                        <td>${computer.label}</td>
                        <td>${computer.install_date ? new Date(computer.install_date).toLocaleDateString() : '-'}</td>
                        <td><span class="status-badge status-${computer.status.toLowerCase()}">${computer.status}</span></td>
                        <td>${categoryLabel}</td>
                        <td>${roomLabel}</td>
                        <td>${computer.quantity}</td>
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

            // Update sort icons
            this.updateSortIcons();
        } catch (error) {
            console.error('Error loading computers:', error);
            alert('Error loading computers. Please try again.');
        }
    }

    async saveComputer() {
        const formData = {
            label: $('#addComputerForm [name="label"]').val(),
            install_date: $('#addComputerForm [name="install_date"]').val(),
            isassignedto: parseInt($('#addComputerForm [name="room"]').val()),
            belongstocategory: parseInt($('#addComputerForm [name="category"]').val()),
            status: $('#addComputerForm [name="status"]').val(),
            quantity: parseInt($('#addComputerForm [name="quantity"]').val())
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
    }

    async editComputer(e) {
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
            $('#editComputerForm [name="quantity"]').val(computer.quantity);
            
            // Store computer ID
            $('#editComputerForm').data('id', id);
            
            // Show modal
            $('#editComputerModal').modal('show');
        } catch (error) {
            console.error('Error loading computer details:', error);
            alert('Error loading computer details. Please try again.');
        }
    }

    async updateComputer() {
        const id = $('#editComputerForm').data('id');
        const formData = {
            label: $('#editComputerForm [name="label"]').val(),
            install_date: $('#editComputerForm [name="install_date"]').val(),
            isassignedto: parseInt($('#editComputerForm [name="room"]').val()),
            belongstocategory: parseInt($('#editComputerForm [name="category"]').val()),
            status: $('#editComputerForm [name="status"]').val(),
            quantity: parseInt($('#editComputerForm [name="quantity"]').val())
        };

        try {
            await axios.put(`${config.apiBaseUrl}${config.endpoints.updateComputer}/${id}`, formData);
            $('#editComputerModal').modal('hide');
            this.loadComputers();
        } catch (error) {
            console.error('Error updating computer:', error);
            alert(error.response?.data?.message || 'Error updating computer. Please try again.');
        }
    }

    async deleteComputer(e) {
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
    }

    async loadCategories() {
        try {
            const response = await axios.get(`${config.apiBaseUrl}${config.endpoints.getAllCategories}`);
            const categories = response.data;
            
            // Store categories in the Map
            this.categories.clear();
            categories.forEach(category => {
                this.categories.set(category.id, category.label);
            });
            
            const addSelect = $('#addComputerForm [name="category"]');
            const editSelect = $('#editComputerForm [name="category"]');
            
            addSelect.empty();
            editSelect.empty();
            
            // Add default option
            addSelect.append('<option value="">Select Category</option>');
            editSelect.append('<option value="">Select Category</option>');
            
            categories.forEach(category => {
                const option = `<option value="${category.id}">${category.label}</option>`;
                addSelect.append(option);
                editSelect.append(option);
            });
        } catch (error) {
            console.error('Error loading categories:', error);
            alert('Error loading categories. Please try again.');
        }
    }

    async loadRooms() {
        try {
            const response = await axios.get(`${config.apiBaseUrl}${config.endpoints.getAllRooms}`);
            const rooms = response.data;
            
            // Store rooms in the Map
            this.rooms.clear();
            rooms.forEach(room => {
                this.rooms.set(room.id, room.label);
            });
            
            const addSelect = $('#addComputerForm [name="room"]');
            const editSelect = $('#editComputerForm [name="room"]');
            
            addSelect.empty();
            editSelect.empty();
            
            // Add default option
            addSelect.append('<option value="">Select Room</option>');
            editSelect.append('<option value="">Select Room</option>');
            
            rooms.forEach(room => {
                const option = `<option value="${room.id}">${room.label}</option>`;
                addSelect.append(option);
                editSelect.append(option);
            });
        } catch (error) {
            console.error('Error loading rooms:', error);
            alert('Error loading rooms. Please try again.');
        }
    }
}

// Initialize the computer manager when the document is ready
$(document).ready(() => {
    const computerManager = new ComputerManager();
}); 
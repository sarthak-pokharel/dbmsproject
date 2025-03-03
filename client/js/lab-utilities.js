class LabUtilityManager {
    constructor() {
        this.currentSort = {
            field: null,
            direction: 'asc'
        };
        this.setupEventListeners();
        this.loadLabUtilities();
        this.loadRooms();
    }

    setupEventListeners() {
        // Add sorting event listener
        $('#labUtilitiesTable').on('click', '.sortable', (e) => this.handleSort(e));

        // Add Lab Utility
        $('#saveLabUtilityBtn').on('click', () => this.saveLabUtility());

        // Edit Lab Utility
        $('#labUtilitiesTable').on('click', '.edit-lab-utility', (e) => this.editLabUtility(e));

        // Save Edit
        $('#updateLabUtilityBtn').on('click', () => this.updateLabUtility());

        // Delete Lab Utility
        $('#labUtilitiesTable').on('click', '.delete-lab-utility', (e) => this.deleteLabUtility(e));
    }

    handleSort(e) {
        const field = $(e.currentTarget).data('sort');
        if (this.currentSort.field === field) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.field = field;
            this.currentSort.direction = 'asc';
        }
        this.loadLabUtilities();
    }

    updateSortIcons() {
        $('.sortable i').removeClass('fa-sort-up fa-sort-down').addClass('fa-sort');
        if (this.currentSort.field) {
            const icon = this.currentSort.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
            $(`.sortable[data-sort="${this.currentSort.field}"] i`).removeClass('fa-sort').addClass(icon);
        }
    }

    sortLabUtilities(labUtilities) {
        if (!this.currentSort.field) return labUtilities;

        return [...labUtilities].sort((a, b) => {
            let aVal = a[this.currentSort.field];
            let bVal = b[this.currentSort.field];

            if (this.currentSort.field === 'room') {
                aVal = a.room_name;
                bVal = b.room_name;
            } else if (this.currentSort.field === 'quantity') {
                aVal = Number(aVal);
                bVal = Number(bVal);
            }

            if (aVal < bVal) return this.currentSort.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.currentSort.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    async loadLabUtilities() {
        try {
            const response = await axios.get(`${config.apiBaseUrl}${config.endpoints.getAllLabUtilities}`);
            let labUtilities = response.data;
            
            // Apply sorting
            labUtilities = this.sortLabUtilities(labUtilities);
            
            const tbody = $('#labUtilitiesTable tbody');
            tbody.empty();
            
            labUtilities.forEach(utility => {
                tbody.append(`
                    <tr>
                        <td>${utility.label}</td>
                        <td>${utility.description}</td>
                        <td>${utility.quantity}</td>
                        <td><span class="status-badge status-${utility.status.toLowerCase()}">${utility.status}</span></td>
                        <td>${utility.room_name}</td>
                        <td>
                            <button class="btn btn-sm btn-primary action-btn edit-lab-utility" data-id="${utility.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger action-btn delete-lab-utility" data-id="${utility.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `);
            });

            // Update sort icons
            this.updateSortIcons();
        } catch (error) {
            console.error('Error loading lab utilities:', error);
            alert('Error loading lab utilities. Please try again.');
        }
    }

    async loadRooms() {
        try {
            const response = await axios.get(`${config.apiBaseUrl}${config.endpoints.getAllRooms}`);
            const rooms = response.data;
            
            const addSelect = $('#addLabUtilityForm [name="room"]');
            const editSelect = $('#editLabUtilityForm [name="room"]');
            
            addSelect.empty();
            editSelect.empty();
            
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

    async saveLabUtility() {
        const formData = {
            label: $('#addLabUtilityForm [name="label"]').val(),
            description: $('#addLabUtilityForm [name="description"]').val(),
            quantity: parseInt($('#addLabUtilityForm [name="quantity"]').val()),
            status: $('#addLabUtilityForm [name="status"]').val(),
            isassignedto: parseInt($('#addLabUtilityForm [name="room"]').val())
        };

        try {
            await axios.post(`${config.apiBaseUrl}${config.endpoints.createLabUtility}`, formData);
            $('#addLabUtilityModal').modal('hide');
            $('#addLabUtilityForm')[0].reset();
            this.loadLabUtilities();
        } catch (error) {
            console.error('Error adding lab utility:', error);
            alert(error.response?.data?.message || 'Error adding lab utility. Please try again.');
        }
    }

    async editLabUtility(e) {
        const id = $(e.currentTarget).data('id');
        try {
            const response = await axios.get(`${config.apiBaseUrl}${config.endpoints.getLabUtility}/${id}`);
            const utility = response.data;
            
            // Populate edit form
            $('#editLabUtilityForm [name="label"]').val(utility.label);
            $('#editLabUtilityForm [name="description"]').val(utility.description);
            $('#editLabUtilityForm [name="quantity"]').val(utility.quantity);
            $('#editLabUtilityForm [name="status"]').val(utility.status);
            $('#editLabUtilityForm [name="room"]').val(utility.isassignedto);
            
            // Store lab utility ID
            $('#editLabUtilityForm').data('id', id);
            
            // Show modal
            $('#editLabUtilityModal').modal('show');
        } catch (error) {
            console.error('Error loading lab utility details:', error);
            alert('Error loading lab utility details. Please try again.');
        }
    }

    async updateLabUtility() {
        const id = $('#editLabUtilityForm').data('id');
        const formData = {
            label: $('#editLabUtilityForm [name="label"]').val(),
            description: $('#editLabUtilityForm [name="description"]').val(),
            quantity: parseInt($('#editLabUtilityForm [name="quantity"]').val()),
            status: $('#editLabUtilityForm [name="status"]').val(),
            isassignedto: parseInt($('#editLabUtilityForm [name="room"]').val())
        };

        try {
            await axios.put(`${config.apiBaseUrl}${config.endpoints.updateLabUtility}/${id}`, formData);
            $('#editLabUtilityModal').modal('hide');
            this.loadLabUtilities();
        } catch (error) {
            console.error('Error updating lab utility:', error);
            alert(error.response?.data?.message || 'Error updating lab utility. Please try again.');
        }
    }

    async deleteLabUtility(e) {
        if (confirm('Are you sure you want to delete this lab utility?')) {
            const id = $(e.currentTarget).data('id');
            try {
                await axios.delete(`${config.apiBaseUrl}${config.endpoints.deleteLabUtility}/${id}`);
                this.loadLabUtilities();
            } catch (error) {
                console.error('Error deleting lab utility:', error);
                alert(error.response?.data?.message || 'Error deleting lab utility. Please try again.');
            }
        }
    }
}

// Initialize the lab utility manager when the document is ready
$(document).ready(() => {
    const labUtilityManager = new LabUtilityManager();
}); 
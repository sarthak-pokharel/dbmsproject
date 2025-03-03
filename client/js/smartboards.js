class SmartBoardManager {
    constructor() {
        this.currentSort = {
            field: null,
            direction: 'asc'
        };
        this.setupEventListeners();
        this.loadSmartBoards();
        this.loadRooms();
    }

    setupEventListeners() {
        // Add Smart Board
        $('#saveSmartBoardBtn').on('click', () => this.saveSmartBoard());

        // Edit Smart Board
        $('#smartBoardsTable').on('click', '.edit-smartboard', (e) => this.editSmartBoard(e));

        // Save Edit
        $('#updateSmartBoardBtn').on('click', () => this.updateSmartBoard());

        // Delete Smart Board
        $('#smartBoardsTable').on('click', '.delete-smartboard', (e) => this.deleteSmartBoard(e));

        // Image preview for edit form
        $('#editSmartBoardForm [name="image"]').on('change', (e) => this.handleImagePreview(e));

        // Image zoom functionality
        $('#smartBoardsTable').on('click', '.smartboard-image', (e) => {
            const imgSrc = $(e.currentTarget).attr('src');
            $('#zoomedImage').attr('src', imgSrc);
            $('#imageZoomModal').modal('show');
        });

        // Add sorting event listener
        $('#smartBoardsTable').on('click', '.sortable', (e) => this.handleSort(e));
    }

    handleImagePreview(e) {
        const file = e.target.files[0];
        const currentImageDiv = $('#currentImage');
        
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                currentImageDiv.html(`
                    <img src="${e.target.result}" alt="Preview" class="img-thumbnail mt-2" style="width: 200px; height: 200px; object-fit: cover;">
                    <p class="mt-2 text-info">New image selected (not yet saved)</p>
                `);
            }
            reader.readAsDataURL(file);
        }
    }

    handleSort(e) {
        const field = $(e.currentTarget).data('sort');
        if (this.currentSort.field === field) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.field = field;
            this.currentSort.direction = 'asc';
        }
        this.loadSmartBoards();
    }

    updateSortIcons() {
        $('.sortable i').removeClass('fa-sort-up fa-sort-down').addClass('fa-sort');
        if (this.currentSort.field) {
            const icon = this.currentSort.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
            $(`.sortable[data-sort="${this.currentSort.field}"] i`).removeClass('fa-sort').addClass(icon);
        }
    }

    sortSmartBoards(smartBoards) {
        if (!this.currentSort.field) return smartBoards;

        return [...smartBoards].sort((a, b) => {
            let aVal = a[this.currentSort.field];
            let bVal = b[this.currentSort.field];

            if (this.currentSort.field === 'room') {
                aVal = a.room_name;
                bVal = b.room_name;
            }

            if (aVal < bVal) return this.currentSort.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.currentSort.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    async loadSmartBoards() {
        try {
            const response = await axios.get(`${config.apiBaseUrl}${config.endpoints.getAllSmartBoards}`);
            let smartBoards = response.data;
            
            // Apply sorting
            smartBoards = this.sortSmartBoards(smartBoards);
            
            const tbody = $('#smartBoardsTable tbody');
            tbody.empty();
            
            smartBoards.forEach(board => {
                const imageHtml = board.image_file_id 
                    ? `<img src="${config.apiBaseUrl}/smart-board/image/${board.image_file_id}" 
                         alt="Smart Board Image" class="img-thumbnail smartboard-image" 
                         style="width: 100px; height: 100px; object-fit: cover; cursor: pointer;">`
                    : '<span class="text-muted">No image</span>';

                tbody.append(`
                    <tr>
                        <td>${imageHtml}</td>
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

            // Update sort icons
            this.updateSortIcons();
        } catch (error) {
            console.error('Error loading smart boards:', error);
            alert('Error loading smart boards. Please try again.');
        }
    }

    async loadRooms() {
        try {
            const response = await axios.get(`${config.apiBaseUrl}${config.endpoints.getAllRooms}`);
            const rooms = response.data;
            
            const addSelect = $('#addSmartBoardForm [name="room"]');
            const editSelect = $('#editSmartBoardForm [name="room"]');
            
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

    async saveSmartBoard() {
        const formData = new FormData();
        formData.append('model_id', $('#addSmartBoardForm [name="model_id"]').val());
        formData.append('status', $('#addSmartBoardForm [name="status"]').val());
        formData.append('room_id', $('#addSmartBoardForm [name="room"]').val());

        const imageFile = $('#addSmartBoardForm [name="image"]')[0].files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const response = await axios.post(`${config.apiBaseUrl}${config.endpoints.createSmartBoard}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (imageFile && response.data.id) {
                await this.uploadImage(response.data.id, imageFile);
            }

            $('#addSmartBoardModal').modal('hide');
            $('#addSmartBoardForm')[0].reset();
            this.loadSmartBoards();
        } catch (error) {
            console.error('Error adding smart board:', error);
            alert(error.response?.data?.message || 'Error adding smart board. Please try again.');
        }
    }

    async editSmartBoard(e) {
        const id = $(e.currentTarget).data('id');
        try {
            const response = await axios.get(`${config.apiBaseUrl}${config.endpoints.getSmartBoard}/${id}`);
            const board = response.data;
            
            // Populate edit form
            $('#editSmartBoardForm [name="model_id"]').val(board.model_id);
            $('#editSmartBoardForm [name="status"]').val(board.status);
            $('#editSmartBoardForm [name="room"]').val(board.isassignedto);
            
            // Reset file input
            $('#editSmartBoardForm [name="image"]').val('');
            
            // Show current image if exists
            const currentImageDiv = $('#currentImage');
            if (board.image_file_id) {
                currentImageDiv.html(`
                    <div class="text-center">
                        <img src="${config.apiBaseUrl}/smart-board/image/${board.image_file_id}" 
                             alt="Current Image" class="img-thumbnail" style="width: 200px; height: 200px; object-fit: cover;">
                        <p class="mt-2 text-muted">Current image</p>
                    </div>
                `);
            } else {
                currentImageDiv.html('<p class="text-muted">No current image</p>');
            }
            
            // Store smart board ID and current image ID
            $('#editSmartBoardForm').data('id', id);
            $('#editSmartBoardForm').data('current-image', board.image_file_id);
            
            // Show modal
            $('#editSmartBoardModal').modal('show');
        } catch (error) {
            console.error('Error loading smart board details:', error);
            alert('Error loading smart board details. Please try again.');
        }
    }

    async updateSmartBoard() {
        const id = $('#editSmartBoardForm').data('id');
        const formData = new FormData();
        formData.append('model_id', $('#editSmartBoardForm [name="model_id"]').val());
        formData.append('status', $('#editSmartBoardForm [name="status"]').val());
        formData.append('room_id', $('#editSmartBoardForm [name="room"]').val());

        try {
            // First update the smart board details
            await axios.put(`${config.apiBaseUrl}${config.endpoints.updateSmartBoard}/${id}`, formData);

            // Then handle image upload if a new image was selected
            const imageFile = $('#editSmartBoardForm [name="image"]')[0].files[0];
            if (imageFile) {
                await this.uploadImage(id, imageFile);
            }

            $('#editSmartBoardModal').modal('hide');
            this.loadSmartBoards();
        } catch (error) {
            console.error('Error updating smart board:', error);
            alert(error.response?.data?.message || 'Error updating smart board. Please try again.');
        }
    }

    async uploadImage(smartBoardId, imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        try {
            await axios.post(`${config.apiBaseUrl}${config.endpoints.uploadSmartBoardImage}/${smartBoardId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }

    async deleteSmartBoard(e) {
        if (confirm('Are you sure you want to delete this smart board?')) {
            const id = $(e.currentTarget).data('id');
            try {
                await axios.delete(`${config.apiBaseUrl}${config.endpoints.deleteSmartBoard}/${id}`);
                this.loadSmartBoards();
            } catch (error) {
                console.error('Error deleting smart board:', error);
                alert(error.response?.data?.message || 'Error deleting smart board. Please try again.');
            }
        }
    }
}

// Initialize the smart board manager when the document is ready
$(document).ready(() => {
    const smartBoardManager = new SmartBoardManager();
}); 
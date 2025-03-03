class RoomManager {
    constructor() {
        this.setupEventListeners();
        this.loadRooms();
    }

    setupEventListeners() {
        // Add Room
        $('#saveRoomBtn').on('click', () => this.saveRoom());

        // View Room
        $('#roomsTable').on('click', '.view-room', (e) => this.viewRoom(e));

        // Edit Room
        $('#roomsTable').on('click', '.edit-room', (e) => this.editRoom(e));

        // Save Edit
        $('#updateRoomBtn').on('click', () => this.updateRoom());

        // Delete Room
        $('#roomsTable').on('click', '.delete-room', (e) => this.deleteRoom(e));

        // Image preview for edit form
        $('#editRoomForm [name="image"]').on('change', (e) => this.handleImagePreview(e));

        // Image zoom functionality
        $('#roomsTable').on('click', '.room-image', (e) => {
            const imgSrc = $(e.currentTarget).attr('src');
            $('#zoomedImage').attr('src', imgSrc);
            $('#imageZoomModal').modal('show');
        });
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

    async loadRooms() {
        try {
            const response = await axios.get(`${config.apiBaseUrl}${config.endpoints.getAllRooms}`);
            const rooms = response.data;
            
            const tbody = $('#roomsTable tbody');
            tbody.empty();
            
            rooms.forEach(room => {
                const imageHtml = room.image_file_id 
                    ? `<img src="${config.apiBaseUrl}/room/image/${room.image_file_id}" 
                         alt="Room Image" class="img-thumbnail room-image" 
                         style="width: 100px; height: 100px; object-fit: cover; cursor: pointer;">`
                    : '<span class="text-muted">No image</span>';

                tbody.append(`
                    <tr>
                        <td>${imageHtml}</td>
                        <td>${room.label}</td>
                        <td>${room.type}</td>
                        <td><span class="status-badge status-${room.status.toLowerCase()}">${room.status}</span></td>
                        <td>
                            <button class="btn btn-sm btn-info action-btn view-room" data-id="${room.id}">
                                <i class="fas fa-eye"></i>
                            </button>
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

    async viewRoom(e) {
        const id = $(e.currentTarget).data('id');
        try {
            const response = await axios.get(`${config.apiBaseUrl}${config.endpoints.getRoomWithAssets}/${id}`);
            const { room, computers, utilities, smartBoards } = response.data;

            // Set room details title
            $('#roomDetailsTitle').text(`${room.label} (${room.type})`);

            // Populate computers table
            const computersBody = $('#roomComputersTable tbody');
            computersBody.empty();
            if (computers.length === 0) {
                computersBody.append('<tr><td colspan="5" class="text-center">No computers assigned</td></tr>');
            } else {
                computers.forEach(computer => {
                    computersBody.append(`
                        <tr>
                            <td>${computer.label}</td>
                            <td>${computer.category_name || 'N/A'}</td>
                            <td>${computer.install_date ? new Date(computer.install_date).toLocaleDateString() : 'N/A'}</td>
                            <td><span class="status-badge status-${computer.status.toLowerCase()}">${computer.status}</span></td>
                            <td>${computer.quantity}</td>
                        </tr>
                    `);
                });
            }

            // Populate lab utilities table
            const utilitiesBody = $('#roomUtilitiesTable tbody');
            utilitiesBody.empty();
            if (utilities.length === 0) {
                utilitiesBody.append('<tr><td colspan="4" class="text-center">No lab utilities assigned</td></tr>');
            } else {
                utilities.forEach(utility => {
                    utilitiesBody.append(`
                        <tr>
                            <td>${utility.label}</td>
                            <td>${utility.description}</td>
                            <td><span class="status-badge status-${utility.status.toLowerCase()}">${utility.status}</span></td>
                            <td>${utility.quantity}</td>
                        </tr>
                    `);
                });
            }

            // Populate smart boards table
            const smartBoardsBody = $('#roomSmartBoardsTable tbody');
            smartBoardsBody.empty();
            if (smartBoards.length === 0) {
                smartBoardsBody.append('<tr><td colspan="3" class="text-center">No smart boards assigned</td></tr>');
            } else {
                smartBoards.forEach(board => {
                    smartBoardsBody.append(`
                        <tr>
                            <td>${board.model_id}</td>
                            <td>${new Date(board.installed_date).toLocaleDateString()}</td>
                            <td><span class="status-badge status-${board.status.toLowerCase()}">${board.status}</span></td>
                        </tr>
                    `);
                });
            }

            // Show the modal
            $('#viewRoomAssetsModal').modal('show');
        } catch (error) {
            console.error('Error loading room details:', error);
            alert('Error loading room details. Please try again.');
        }
    }

    async saveRoom() {
        const formData = new FormData();
        formData.append('label', $('#addRoomForm [name="label"]').val());
        formData.append('type', $('#addRoomForm [name="type"]').val());
        formData.append('status', $('#addRoomForm [name="status"]').val());

        const imageFile = $('#addRoomForm [name="image"]')[0].files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const response = await axios.post(`${config.apiBaseUrl}${config.endpoints.createRoom}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (imageFile && response.data.id) {
                await this.uploadImage(response.data.id, imageFile);
            }

            $('#addRoomModal').modal('hide');
            $('#addRoomForm')[0].reset();
            this.loadRooms();
        } catch (error) {
            console.error('Error adding room:', error);
            alert(error.response?.data?.message || 'Error adding room. Please try again.');
        }
    }

    async editRoom(e) {
        const id = $(e.currentTarget).data('id');
        try {
            const response = await axios.get(`${config.apiBaseUrl}${config.endpoints.getRoom}/${id}`);
            const room = response.data;
            
            // Populate edit form
            $('#editRoomForm [name="label"]').val(room.label);
            $('#editRoomForm [name="type"]').val(room.type);
            $('#editRoomForm [name="status"]').val(room.status);
            
            // Reset file input
            $('#editRoomForm [name="image"]').val('');
            
            // Show current image if exists
            const currentImageDiv = $('#currentImage');
            if (room.image_file_id) {
                currentImageDiv.html(`
                    <div class="text-center">
                        <img src="${config.apiBaseUrl}/room/image/${room.image_file_id}" 
                             alt="Current Image" class="img-thumbnail" style="width: 200px; height: 200px; object-fit: cover;">
                        <p class="mt-2 text-muted">Current image</p>
                    </div>
                `);
            } else {
                currentImageDiv.html('<p class="text-muted">No current image</p>');
            }
            
            // Store room ID and current image ID
            $('#editRoomForm').data('id', id);
            $('#editRoomForm').data('current-image', room.image_file_id);
            
            // Show modal
            $('#editRoomModal').modal('show');
        } catch (error) {
            console.error('Error loading room details:', error);
            alert('Error loading room details. Please try again.');
        }
    }

    async updateRoom() {
        const id = $('#editRoomForm').data('id');
        const formData = new FormData();
        formData.append('label', $('#editRoomForm [name="label"]').val());
        formData.append('type', $('#editRoomForm [name="type"]').val());
        formData.append('status', $('#editRoomForm [name="status"]').val());

        try {
            // First update the room details
            await axios.put(`${config.apiBaseUrl}${config.endpoints.updateRoom}/${id}`, formData);

            // Then handle image upload if a new image was selected
            const imageFile = $('#editRoomForm [name="image"]')[0].files[0];
            if (imageFile) {
                await this.uploadImage(id, imageFile);
            }

            $('#editRoomModal').modal('hide');
            this.loadRooms();
        } catch (error) {
            console.error('Error updating room:', error);
            alert(error.response?.data?.message || 'Error updating room. Please try again.');
        }
    }

    async uploadImage(roomId, imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        try {
            await axios.post(`${config.apiBaseUrl}${config.endpoints.uploadRoomImage}/${roomId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }

    async deleteRoom(e) {
        if (confirm('Are you sure you want to delete this room?')) {
            const id = $(e.currentTarget).data('id');
            try {
                await axios.delete(`${config.apiBaseUrl}${config.endpoints.deleteRoom}/${id}`);
                this.loadRooms();
            } catch (error) {
                console.error('Error deleting room:', error);
                alert(error.response?.data?.message || 'Error deleting room. Please try again.');
            }
        }
    }
}

// Initialize the room manager when the document is ready
$(document).ready(() => {
    const roomManager = new RoomManager();
}); 
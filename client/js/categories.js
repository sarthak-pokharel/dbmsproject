$(document).ready(function() {
    let currentSort = {
        field: null,
        direction: 'asc'
    };

    // Format date for display
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    // Truncate text to specified length
    function truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }

    // Sort function
    function sortCategories(categories, field, direction) {
        return [...categories].sort((a, b) => {
            let aVal = a[field];
            let bVal = b[field];
            
            if (field === 'model_release_date') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }
            
            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // Update sort icons
    function updateSortIcons(field) {
        $('.sortable i').removeClass('fa-sort-up fa-sort-down').addClass('fa-sort');
        if (currentSort.field === field) {
            const icon = currentSort.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
            $(`.sortable[data-sort="${field}"] i`).removeClass('fa-sort').addClass(icon);
        }
    }

    // Fetch and display all categories
    function fetchCategories() {
        axios.get(`${config.apiBaseUrl}${config.endpoints.getAllCategories}`)
            .then(response => {
                let categories = response.data;
                
                // Apply sorting if set
                if (currentSort.field) {
                    categories = sortCategories(categories, currentSort.field, currentSort.direction);
                }
                
                const tbody = $('#categoriesTable tbody');
                tbody.empty();
                categories.forEach(category => {
                    const truncatedDesc = truncateText(category.description, 50);
                    const showMoreBtn = category.description.length > 50 
                        ? `<button class="btn btn-link p-0 show-more-btn" data-description="${encodeURIComponent(category.description)}">See More</button>` 
                        : '';
                    
                    tbody.append(`
                        <tr>
                            <td>${category.label}</td>
                            <td>${formatDate(category.model_release_date)}</td>
                            <td>
                                ${truncatedDesc}
                                ${showMoreBtn}
                            </td>
                            <td>
                                <button class="btn btn-sm btn-warning edit-category-btn" 
                                    data-id="${category.id}" 
                                    data-label="${category.label}"
                                    data-model-release-date="${category.model_release_date.split('T')[0]}"
                                    data-description="${encodeURIComponent(category.description)}">Edit</button>
                                <button class="btn btn-sm btn-danger delete-category-btn" data-id="${category.id}">Delete</button>
                            </td>
                        </tr>
                    `);
                });
                
                // Update sort icons
                updateSortIcons(currentSort.field);
            })
            .catch(error => {
                console.error('Error fetching categories:', error);
            });
    }

    // Handle sort clicks
    $(document).on('click', '.sortable', function() {
        const field = $(this).data('sort');
        if (currentSort.field === field) {
            currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            currentSort.field = field;
            currentSort.direction = 'asc';
        }
        fetchCategories();
    });

    // Handle show more button click
    $(document).on('click', '.show-more-btn', function(e) {
        e.preventDefault();
        const fullDescription = decodeURIComponent($(this).data('description'));
        $('#fullDescription').text(fullDescription);
        $('#descriptionModal').modal('show');
    });

    // Add new category
    $('#saveCategoryBtn').click(function() {
        const formData = new FormData($('#addCategoryForm')[0]);
        const data = Object.fromEntries(formData.entries());
        
        axios.post(`${config.apiBaseUrl}${config.endpoints.createCategory}`, data)
            .then(response => {
                $('#addCategoryModal').modal('hide');
                $('#addCategoryForm')[0].reset();
                fetchCategories();
            })
            .catch(error => {
                console.error('Error adding category:', error);
                alert('Error adding category. Please try again.');
            });
    });

    // Edit category
    $(document).on('click', '.edit-category-btn', function() {
        const id = $(this).data('id');
        const label = $(this).data('label');
        const modelReleaseDate = $(this).data('model-release-date');
        const description = decodeURIComponent($(this).data('description'));
        
        $('#editCategoryForm [name="id"]').val(id);
        $('#editCategoryForm [name="label"]').val(label);
        $('#editCategoryForm [name="model_release_date"]').val(modelReleaseDate);
        $('#editCategoryForm [name="description"]').val(description);
        $('#editCategoryModal').modal('show');
    });

    $('#updateCategoryBtn').click(function() {
        const id = $('#editCategoryForm [name="id"]').val();
        const formData = new FormData($('#editCategoryForm')[0]);
        const data = Object.fromEntries(formData.entries());
        
        axios.put(`${config.apiBaseUrl}${config.endpoints.updateCategory}/${id}`, data)
            .then(response => {
                $('#editCategoryModal').modal('hide');
                fetchCategories();
            })
            .catch(error => {
                console.error('Error updating category:', error);
                alert('Error updating category. Please try again.');
            });
    });

    // Delete category
    $(document).on('click', '.delete-category-btn', function() {
        const id = $(this).data('id');
        if (confirm('Are you sure you want to delete this category?')) {
            axios.delete(`${config.apiBaseUrl}${config.endpoints.deleteCategory}/${id}`)
                .then(response => {
                    fetchCategories();
                })
                .catch(error => {
                    if (error.response && error.response.status === 400) {
                        alert('Cannot delete this category because it is being used by computers');
                    } else {
                        console.error('Error deleting category:', error);
                        alert('Error deleting category. Please try again.');
                    }
                });
        }
    });

    // Clear form when modal is hidden
    $('#addCategoryModal').on('hidden.bs.modal', function() {
        $('#addCategoryForm')[0].reset();
    });

    $('#editCategoryModal').on('hidden.bs.modal', function() {
        $('#editCategoryForm')[0].reset();
    });

    // Initial fetch of categories
    fetchCategories();
});


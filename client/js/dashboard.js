// Dashboard charts
let statusChart;
let timelineChart;
let miniCharts = {};

// Chart resize observer
let resizeObserver;

// Initialize DataTables
const tables = {
    computers: $('#computersTable').DataTable({
        pageLength: 5,
        lengthMenu: [5, 10, 25],
        order: [[0, 'desc']],
        columnDefs: [{
            targets: 3, // Status column
            render: function(data, type, row) {
                if (type === 'display') {
                    return data;
                }
                return data.replace(/<[^>]*>/g, '');
            }
        }]
    }),
    rooms: $('#roomsTable').DataTable({
        pageLength: 5,
        lengthMenu: [5, 10, 25],
        order: [[0, 'desc']],
        columnDefs: [{
            targets: 2, // Status column
            render: function(data, type, row) {
                if (type === 'display') {
                    return data;
                }
                return data.replace(/<[^>]*>/g, '');
            }
        }]
    }),
    smartboards: $('#smartboardsTable').DataTable({
        pageLength: 5,
        lengthMenu: [5, 10, 25],
        order: [[0, 'desc']],
        columnDefs: [{
            targets: 2, // Status column
            render: function(data, type, row) {
                if (type === 'display') {
                    return data;
                }
                return data.replace(/<[^>]*>/g, '');
            }
        }]
    }),
    utilities: $('#utilitiesTable').DataTable({
        pageLength: 5,
        lengthMenu: [5, 10, 25],
        order: [[0, 'desc']],
        columnDefs: [{
            targets: 2, // Status column
            render: function(data, type, row) {
                if (type === 'display') {
                    return data;
                }
                return data.replace(/<[^>]*>/g, '');
            }
        }]
    })
};

// Initialize dashboard
$(document).ready(function() {
    // Initialize resize observer for charts
    resizeObserver = new ResizeObserver(entries => {
        entries.forEach(entry => {
            const chartId = entry.target.id;
            if (chartId === 'timelineChart' && timelineChart) {
                timelineChart.resize();
            } else if (chartId === 'statusChart' && statusChart) {
                statusChart.resize();
            }
        });
    });

    // Observe chart containers
    const chartElements = document.querySelectorAll('.chart-container canvas');
    chartElements.forEach(element => resizeObserver.observe(element));

    // Clean up charts when switching tabs
    $('#recentTabs a[data-bs-toggle="tab"]').on('shown.bs.tab', function() {
        if (timelineChart) timelineChart.resize();
        if (statusChart) statusChart.resize();
    });

    // Initial data fetch
    fetchDashboardData();

    // Set up periodic refresh
    setInterval(fetchDashboardData, 60000); // Refresh every minute
});

// Cleanup function for charts
function cleanupCharts() {
    if (timelineChart) {
        timelineChart.destroy();
        timelineChart = null;
    }
    if (statusChart) {
        statusChart.destroy();
        statusChart = null;
    }
    Object.values(miniCharts).forEach(chart => {
        if (chart) {
            chart.destroy();
        }
    });
    miniCharts = {};
}

// Fetch all dashboard data
async function fetchDashboardData() {
    try {
        // Cleanup existing charts before fetching new data
        cleanupCharts();

        const [summaryResponse, recentResponse] = await Promise.all([
            axios.get(`${config.apiBaseUrl}/dashboard/summary`),
            axios.get(`${config.apiBaseUrl}/dashboard/recent`)
        ]);

        updateStatistics(summaryResponse.data);
        updateCharts(summaryResponse.data);
        updateMiniCharts(summaryResponse.data);
        updateRoomUtilization(summaryResponse.data.roomUtilization);
        updateTables(recentResponse.data);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
    }
}

// Update statistics cards
function updateStatistics(data) {
    // Computers
    $('#computerTotal').text(data.computers.total);
    $('#computerFunctional').text(data.computers.functionalCount);
    
    // Rooms
    $('#roomTotal').text(data.rooms.total);
    $('#roomTypes').text(data.rooms.uniqueTypes);
    
    // Smart Boards
    $('#smartboardTotal').text(data.smartBoards.total);
    $('#smartboardFunctional').text(data.smartBoards.functionalCount);
    
    // Lab Utilities
    $('#utilityTotal').text(data.labUtilities.total);
    $('#utilityQuantity').text(data.labUtilities.totalQuantity);
}

// Update main charts
function updateCharts(data) {
    try {
        // Update Timeline Chart
        const timelineCanvas = document.getElementById('timelineChart');
        if (timelineCanvas) {
            const timelineCtx = timelineCanvas.getContext('2d');
            
            // Extract timeline data for computer installations
            const timelineLabels = data.timeline.computers ? data.timeline.computers.map(item => item.month) : [];
            const timelineData = data.timeline.computers ? data.timeline.computers.map(item => item.installations) : [];
            
            timelineChart = new Chart(timelineCtx, {
                type: 'line',
                data: {
                    labels: timelineLabels,
                    datasets: [{
                        label: 'Equipment Installations',
                        data: timelineData,
                        borderColor: '#0d6efd',
                        backgroundColor: 'rgba(13, 110, 253, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        }

        // Update Status Distribution Chart
        const statusCanvas = document.getElementById('statusChart');
        if (statusCanvas) {
            const statusCtx = statusCanvas.getContext('2d');
            
            // Calculate total counts for each status across all equipment types
            // Using parseInt to ensure proper number conversion and || 0 for null/undefined fallback
            const functionalCount = (parseInt(data.computers?.functionalCount) || 0) + 
                                  (parseInt(data.smartBoards?.functionalCount) || 0) + 
                                  (parseInt(data.labUtilities?.functionalCount) || 0);
            const maintenanceCount = (parseInt(data.computers?.maintenanceCount) || 0) + 
                                   (parseInt(data.smartBoards?.maintenanceCount) || 0) + 
                                   (parseInt(data.labUtilities?.maintenanceCount) || 0);
            const retiredCount = (parseInt(data.computers?.retiredCount) || 0) + 
                               (parseInt(data.smartBoards?.retiredCount) || 0) + 
                               (parseInt(data.labUtilities?.retiredCount) || 0);

            statusChart = new Chart(statusCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Functional', 'Maintenance', 'Retired'],
                    datasets: [{
                        data: [functionalCount, maintenanceCount, retiredCount],
                        backgroundColor: ['#198754', '#ffc107', '#dc3545']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error updating charts:', error);
    }
}

// Update mini charts in stat cards
function updateMiniCharts(data) {
    try {
        // Computer Status Mini Chart
        const computerCanvas = document.getElementById('computerStatusMini');
        if (computerCanvas) {
            const computerCtx = computerCanvas.getContext('2d');
            miniCharts.computer = new Chart(computerCtx, {
                type: 'bar',
                data: {
                    labels: ['F', 'M', 'R'],
                    datasets: [{
                        data: [
                            data.computers.functionalCount || 0,
                            data.computers.maintenanceCount || 0,
                            data.computers.retiredCount || 0
                        ],
                        backgroundColor: ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0.4)']
                    }]
                },
                options: getMiniChartOptions()
            });
        }

        // Room Types Mini Chart
        const roomCanvas = document.getElementById('roomTypeMini');
        if (roomCanvas) {
            const roomCtx = roomCanvas.getContext('2d');
            miniCharts.room = new Chart(roomCtx, {
                type: 'doughnut',
                data: {
                    labels: data.rooms.types ? data.rooms.types.split(',') : [],
                    datasets: [{
                        data: Array(data.rooms.uniqueTypes || 0).fill(1),
                        backgroundColor: Array(data.rooms.uniqueTypes || 0).fill().map(() => 'rgba(255,255,255,0.6)')
                    }]
                },
                options: getMiniChartOptions()
            });
        }

        // Smart Board Status Mini Chart
        const smartboardCanvas = document.getElementById('smartboardStatusMini');
        if (smartboardCanvas) {
            const smartboardCtx = smartboardCanvas.getContext('2d');
            miniCharts.smartboard = new Chart(smartboardCtx, {
                type: 'bar',
                data: {
                    labels: ['F', 'M', 'R'],
                    datasets: [{
                        data: [
                            data.smartBoards.functionalCount || 0,
                            data.smartBoards.maintenanceCount || 0,
                            data.smartBoards.retiredCount || 0
                        ],
                        backgroundColor: ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0.4)']
                    }]
                },
                options: getMiniChartOptions()
            });
        }

        // Lab Utilities Status Mini Chart
        const utilityCanvas = document.getElementById('utilityStatusMini');
        if (utilityCanvas) {
            const utilityCtx = utilityCanvas.getContext('2d');
            miniCharts.utility = new Chart(utilityCtx, {
                type: 'bar',
                data: {
                    labels: ['F', 'M', 'R'],
                    datasets: [{
                        data: [
                            data.labUtilities.functionalCount || 0,
                            data.labUtilities.maintenanceCount || 0,
                            data.labUtilities.retiredCount || 0
                        ],
                        backgroundColor: ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0.4)']
                    }]
                },
                options: getMiniChartOptions()
            });
        }
    } catch (error) {
        console.error('Error updating mini charts:', error);
    }
}

// Mini chart options
function getMiniChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                enabled: false
            }
        },
        scales: {
            x: {
                display: false
            },
            y: {
                display: false
            }
        }
    };
}

// Update room utilization section
function updateRoomUtilization(rooms) {
    const container = $('#roomUtilizationContainer');
    container.empty();

    // Sort rooms by total equipment count in descending order and take top 8
    const topRooms = rooms
        .map(room => ({
            ...room,
            totalEquipment: room.computer_count + room.smartboard_count + room.utility_count
        }))
        .sort((a, b) => b.totalEquipment - a.totalEquipment)
        .slice(0, 8);

    topRooms.forEach(room => {
        const totalEquipment = parseInt(room.computer_count || 0) + parseInt(room.smartboard_count || 0) + parseInt(room.utility_count || 0);
        const functionalEquipment = parseInt(room.functional_computers || 0) + parseInt(room.functional_smartboards || 0) + parseInt(room.functional_utilities || 0);
        const functionalPercentage = totalEquipment > 0 ? 
            Math.round((functionalEquipment / totalEquipment) * 100) : 100;

        container.append(`
            <div class="col-md-4 col-lg-3">
                <div class="card room-card">
                    <div class="card-body">
                        <h6 class="card-title">${room.room_name}</h6>
                        <small class="text-muted">${room.room_type}</small>
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <div>
                                <div class="equipment-count">${totalEquipment}</div>
                                <small class="text-muted">Total Equipment</small>
                            </div>
                            <div class="text-end">
                                <h4 class="mb-0 ${functionalPercentage >= 80 ? 'text-success' : 
                                                 functionalPercentage >= 50 ? 'text-warning' : 
                                                 'text-danger'}">${functionalPercentage}%</h4>
                                <small class="text-muted">Functional</small>
                            </div>
                        </div>
                        <div class="mt-3">
                            <small class="d-block">
                                <i class="fas fa-desktop me-2"></i>${room.computer_count || 0} Computers
                            </small>
                            <small class="d-block">
                                <i class="fas fa-chalkboard me-2"></i>${room.smartboard_count || 0} Smart Boards
                            </small>
                            <small class="d-block">
                                <i class="fas fa-tools me-2"></i>${room.utility_count || 0} Utilities
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        `);
    });
}

// Update recent items tables
function updateTables(recent) {
    // Clear existing data
    Object.values(tables).forEach(table => table.clear());

    // Update Computers table
    if (recent.computers && Array.isArray(recent.computers)) {
        recent.computers.forEach(computer => {
            tables.computers.row.add([
                computer.label || 'N/A',
                computer.room_name || 'N/A',
                computer.category_name || 'N/A',
                `<span class="status-badge status-${computer.status.toLowerCase()}">${computer.status}</span>`,
                computer.quantity || 0
            ]);
        });
    }

    // Update Rooms table
    if (recent.rooms && Array.isArray(recent.rooms)) {
        recent.rooms.forEach(room => {
            tables.rooms.row.add([
                room.label || 'N/A',
                room.type || 'N/A',
                `<span class="status-badge status-${room.status.toLowerCase()}">${room.status}</span>`
            ]);
        });
    }

    // Update Smart Boards table
    if (recent.smartBoards && Array.isArray(recent.smartBoards)) {
        recent.smartBoards.forEach(board => {
            tables.smartboards.row.add([
                board.model_id || 'N/A',
                board.room_name || 'N/A',
                `<span class="status-badge status-${board.status.toLowerCase()}">${board.status}</span>`,
                board.installed_date ? new Date(board.installed_date).toLocaleDateString() : 'N/A'
            ]);
        });
    }

    // Update Lab Utilities table
    if (recent.labUtilities && Array.isArray(recent.labUtilities)) {
        recent.labUtilities.forEach(utility => {
            tables.utilities.row.add([
                utility.label || 'N/A',
                utility.room_name || 'N/A',
                `<span class="status-badge status-${utility.status.toLowerCase()}">${utility.status}</span>`,
                utility.quantity || 0
            ]);
        });
    }

    // Redraw all tables
    Object.values(tables).forEach(table => {
        table.draw(false); // false parameter prevents table position reset
    });
} 
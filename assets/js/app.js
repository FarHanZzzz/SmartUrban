// Smart Urban Development - Frontend Application
const API_BASE = 'api';

// Feature configurations
const features = {
    traffic: {
        title: 'Smart City Traffic Management',
        description: 'Monitor and manage real-time traffic data, congestion, and accidents from IoT sensors, CCTV cameras, and GPS systems',
        endpoint: 'traffic.php'
    },
    parking: {
        title: 'Smart Parking System',
        description: 'Centralized parking management solution that tracks available parking spaces and allows users to view and reserve them',
        endpoint: 'parking.php'
    },
    waste: {
        title: 'Waste Management & Recycling Tracking',
        description: 'Efficient waste collection, transportation, and recycling operations with IoT-enabled smart bins for route optimization',
        endpoint: 'waste.php'
    },
    energy: {
        title: 'Smart Energy Monitoring System',
        description: 'Record and manage real-time energy, water, and gas usage data from households and industries with smart meters',
        endpoint: 'energy.php'
    },
    pollution: {
        title: 'Air Quality & Pollution Monitoring (AI-Based)',
        description: 'AI models analyze PollutionData table to predict pollution levels, identify root causes, and issue real-time alerts',
        endpoint: 'pollution.php'
    },
    emergency: {
        title: 'Emergency Response & Public Safety System (AI + Database)',
        description: 'AI analyzes Incidents, EmergencyVehicles, and ResponseTimes tables to predict high-risk zones and optimize response routes',
        endpoint: 'emergency.php'
    }
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    loadFeature('traffic');
    setupMobileMenu();
});

// Navigation setup
function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const feature = e.currentTarget.getAttribute('data-feature');
            switchFeature(feature);
        });
    });
}

// Mobile menu toggle
function setupMobileMenu() {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.querySelector('.nav-menu');
    if (toggle) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('active');
        });
    }
}

// Switch feature
function switchFeature(feature) {
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-feature') === feature) {
            link.classList.add('active');
        }
    });

    // Update header
    const config = features[feature];
    document.getElementById('feature-title').textContent = config.title;
    document.getElementById('feature-description').textContent = config.description;

    // Show/hide sections
    document.querySelectorAll('.feature-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${feature}-section`).classList.add('active');

    // Load data
    loadFeature(feature);
}

// Load feature data
function loadFeature(feature) {
    switch (feature) {
        case 'traffic':
            loadTrafficData();
            break;
        case 'parking':
            loadParkingSpots();
            loadReservations();
            break;
        case 'waste':
            loadCollections();
            loadWasteTypes();
            loadPlants();
            loadTransport();
            break;
        case 'energy':
            loadEnergyData();
            break;
        case 'pollution':
            loadPollutionData();
            break;
        case 'emergency':
            loadIncidents();
            loadVehicles();
            loadResponses();
            break;
    }
}

// API Helper Functions
async function apiCall(endpoint, method = 'GET', data = null) {
    showLoading();
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_BASE}/${endpoint}`, options);
        const result = await response.json();
        hideLoading();
        return result;
    } catch (error) {
        hideLoading();
        showAlert('Error: ' + error.message, 'error');
        return { success: false, message: error.message };
    }
}

function showLoading() {
    document.getElementById('loading').classList.add('active');
}

function hideLoading() {
    document.getElementById('loading').classList.remove('active');
}

function showAlert(message, type = 'info') {
    // Simple alert - can be enhanced with a toast notification
    alert(message);
}

// ============================================
// TRAFFIC MANAGEMENT
// ============================================

async function loadTrafficData() {
    const result = await apiCall('traffic.php');
    if (result.success) {
        renderTrafficTable(result.data || []);
    }
}

function renderTrafficTable(data) {
    const tbody = document.getElementById('traffic-tbody');
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No traffic data available</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(item => `
        <tr>
            <td>${item.traffic_id}</td>
            <td>${item.location || '-'}</td>
            <td>${item.vehicle_count || 0}</td>
            <td><span class="badge badge-${getCongestionBadge(item.congestion_level)}">${item.congestion_level || 'Low'}</span></td>
            <td>${item.accident_reported == 1 ? '<span class="badge badge-danger">Yes</span>' : '<span class="badge badge-success">No</span>'}</td>
            <td>${item.route_name || '-'}</td>
            <td>${formatDateTime(item.timestamp)}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-secondary" onclick="editTraffic(${item.traffic_id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteTraffic(${item.traffic_id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function getCongestionBadge(level) {
    const badges = {
        'Low': 'success',
        'Medium': 'warning',
        'High': 'warning',
        'Severe': 'danger'
    };
    return badges[level] || 'info';
}

async function deleteTraffic(id) {
    if (confirm('Are you sure you want to delete this traffic data?')) {
        const result = await apiCall('traffic.php', 'DELETE', { id });
        if (result.success) {
            loadTrafficData();
        }
    }
}

// ============================================
// PARKING SYSTEM
// ============================================

async function loadParkingSpots() {
    const result = await apiCall('parking.php?action=spots');
    if (result.success) {
        renderParkingSpotsTable(result.data || []);
    }
}

function renderParkingSpotsTable(data) {
    const tbody = document.getElementById('parking-spots-tbody');
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No parking spots available</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(item => `
        <tr>
            <td>${item.spot_id}</td>
            <td>${item.location || '-'}</td>
            <td>${item.spot_number || '-'}</td>
            <td>${item.zone || '-'}</td>
            <td>${item.spot_type || 'Standard'}</td>
            <td>$${parseFloat(item.hourly_rate || 0).toFixed(2)}</td>
            <td>${item.is_available == 1 ? '<span class="badge badge-success">Available</span>' : '<span class="badge badge-danger">Occupied</span>'}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-secondary" onclick="editParkingSpot(${item.spot_id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteParkingSpot(${item.spot_id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

async function loadReservations() {
    const result = await apiCall('parking.php?action=reservations');
    if (result.success) {
        renderReservationsTable(result.data || []);
    }
}

function renderReservationsTable(data) {
    const tbody = document.getElementById('reservations-tbody');
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No reservations available</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(item => `
        <tr>
            <td>${item.reservation_id}</td>
            <td>${item.spot_number || '-'} (${item.location || '-'})</td>
            <td>${item.user_name || '-'}</td>
            <td>${formatDateTime(item.start_time)}</td>
            <td>${formatDateTime(item.end_time)}</td>
            <td><span class="badge badge-${getStatusBadge(item.status)}">${item.status || 'Pending'}</span></td>
            <td>$${parseFloat(item.total_amount || 0).toFixed(2)}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-secondary" onclick="editReservation(${item.reservation_id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteReservation(${item.reservation_id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function switchParkingTab(tab) {
    document.querySelectorAll('#parking-section .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#parking-section .tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(`parking-${tab}-tab`).classList.add('active');
}

// ============================================
// WASTE MANAGEMENT
// ============================================

async function loadCollections() {
    const result = await apiCall('waste.php?action=collection');
    if (result.success) {
        renderCollectionsTable(result.data || []);
    }
}

function renderCollectionsTable(data) {
    const tbody = document.getElementById('collection-tbody');
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No collections available</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(item => `
        <tr>
            <td>${item.collection_id}</td>
            <td>${item.location || '-'}</td>
            <td>${item.type_name || '-'} (${item.category || '-'})</td>
            <td>${item.fill_level || 0}%</td>
            <td><span class="badge badge-${getStatusBadge(item.collection_status)}">${item.collection_status || 'Scheduled'}</span></td>
            <td>${formatDateTime(item.scheduled_date)}</td>
            <td>${item.weight_kg ? parseFloat(item.weight_kg).toFixed(2) + ' kg' : '-'}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-secondary" onclick="editCollection(${item.collection_id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteCollection(${item.collection_id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

async function loadWasteTypes() {
    const result = await apiCall('waste.php?action=waste-types');
    if (result.success) {
        renderWasteTypesTable(result.data || []);
    }
}

function renderWasteTypesTable(data) {
    const tbody = document.getElementById('waste-types-tbody');
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No waste types available</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(item => `
        <tr>
            <td>${item.waste_type_id}</td>
            <td>${item.type_name || '-'}</td>
            <td>${item.category || '-'}</td>
            <td>${parseFloat(item.recycling_rate || 0).toFixed(2)}%</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-secondary" onclick="editWasteType(${item.waste_type_id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteWasteType(${item.waste_type_id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

async function loadPlants() {
    const result = await apiCall('waste.php?action=plants');
    if (result.success) {
        renderPlantsTable(result.data || []);
    }
}

function renderPlantsTable(data) {
    const tbody = document.getElementById('plants-tbody');
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No recycling plants available</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(item => `
        <tr>
            <td>${item.plant_id}</td>
            <td>${item.plant_name || '-'}</td>
            <td>${item.location || '-'}</td>
            <td>${parseFloat(item.capacity_tons || 0).toFixed(2)}</td>
            <td><span class="badge badge-${getStatusBadge(item.operational_status)}">${item.operational_status || 'Active'}</span></td>
            <td>${item.contact_person || '-'}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-secondary" onclick="editPlant(${item.plant_id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deletePlant(${item.plant_id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

async function loadTransport() {
    const result = await apiCall('waste.php?action=transportation');
    if (result.success) {
        renderTransportTable(result.data || []);
    }
}

function renderTransportTable(data) {
    const tbody = document.getElementById('transport-tbody');
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No transportation records available</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(item => `
        <tr>
            <td>${item.transport_id}</td>
            <td>${item.collection_location || '-'}</td>
            <td>${item.vehicle_id || '-'}</td>
            <td>${item.driver_name || '-'}</td>
            <td><span class="badge badge-${getStatusBadge(item.status)}">${item.status || 'Scheduled'}</span></td>
            <td>${item.distance_km ? parseFloat(item.distance_km).toFixed(2) + ' km' : '-'}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-secondary" onclick="editTransport(${item.transport_id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteTransport(${item.transport_id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function switchWasteTab(tab) {
    document.querySelectorAll('#waste-section .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#waste-section .tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(`waste-${tab}-tab`).classList.add('active');
}

// ============================================
// ENERGY MONITORING
// ============================================

async function loadEnergyData() {
    const result = await apiCall('energy.php');
    if (result.success) {
        renderEnergyTable(result.data || []);
    }
}

function renderEnergyTable(data) {
    const tbody = document.getElementById('energy-tbody');
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="empty-state">No energy data available</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(item => `
        <tr>
            <td>${item.usage_id}</td>
            <td>${item.location || '-'}</td>
            <td>${item.consumer_type || '-'}</td>
            <td>${item.meter_id || '-'}</td>
            <td>${parseFloat(item.energy_kwh || 0).toFixed(2)}</td>
            <td>${parseFloat(item.water_liters || 0).toFixed(2)}</td>
            <td>${parseFloat(item.gas_m3 || 0).toFixed(2)}</td>
            <td>$${parseFloat(item.cost_usd || 0).toFixed(2)}</td>
            <td>${item.anomaly_detected == 1 ? '<span class="badge badge-danger">Yes</span>' : '<span class="badge badge-success">No</span>'}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-secondary" onclick="editEnergy(${item.usage_id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteEnergy(${item.usage_id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// ============================================
// POLLUTION MONITORING
// ============================================

async function loadPollutionData() {
    const result = await apiCall('pollution.php');
    if (result.success) {
        renderPollutionTable(result.data || []);
    }
}

function renderPollutionTable(data) {
    const tbody = document.getElementById('pollution-tbody');
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="empty-state">No pollution data available</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(item => `
        <tr>
            <td>${item.pollution_id}</td>
            <td>${item.location || '-'}</td>
            <td>${item.pm25 ? parseFloat(item.pm25).toFixed(2) : '-'}</td>
            <td>${item.pm10 ? parseFloat(item.pm10).toFixed(2) : '-'}</td>
            <td>${item.co2_ppm ? parseFloat(item.co2_ppm).toFixed(2) : '-'}</td>
            <td>${item.air_quality_index || '-'}</td>
            <td><span class="badge badge-${getQualityBadge(item.quality_status)}">${item.quality_status || 'Good'}</span></td>
            <td>${item.alert_issued == 1 ? '<span class="badge badge-danger">Alert</span>' : '<span class="badge badge-success">Normal</span>'}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-secondary" onclick="editPollution(${item.pollution_id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deletePollution(${item.pollution_id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function getQualityBadge(status) {
    const badges = {
        'Good': 'success',
        'Moderate': 'warning',
        'Unhealthy for Sensitive': 'warning',
        'Unhealthy': 'danger',
        'Very Unhealthy': 'danger',
        'Hazardous': 'danger'
    };
    return badges[status] || 'info';
}

// ============================================
// EMERGENCY RESPONSE
// ============================================

async function loadIncidents() {
    const result = await apiCall('emergency.php?action=incidents');
    if (result.success) {
        renderIncidentsTable(result.data || []);
    }
}

function renderIncidentsTable(data) {
    const tbody = document.getElementById('incidents-tbody');
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No incidents available</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(item => `
        <tr>
            <td>${item.incident_id}</td>
            <td>${item.incident_type || '-'}</td>
            <td>${item.location || '-'}</td>
            <td><span class="badge badge-${getSeverityBadge(item.severity)}">${item.severity || 'Medium'}</span></td>
            <td><span class="badge badge-${getStatusBadge(item.status)}">${item.status || 'Reported'}</span></td>
            <td>${formatDateTime(item.reported_at)}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-secondary" onclick="editIncident(${item.incident_id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteIncident(${item.incident_id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

async function loadVehicles() {
    const result = await apiCall('emergency.php?action=vehicles');
    if (result.success) {
        renderVehiclesTable(result.data || []);
    }
}

function renderVehiclesTable(data) {
    const tbody = document.getElementById('vehicles-tbody');
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No vehicles available</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(item => `
        <tr>
            <td>${item.vehicle_id}</td>
            <td>${item.vehicle_type || '-'}</td>
            <td>${item.vehicle_number || '-'}</td>
            <td>${item.current_location || '-'}</td>
            <td><span class="badge badge-${getStatusBadge(item.status)}">${item.status || 'Available'}</span></td>
            <td>${item.incident_type || 'None'}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-secondary" onclick="editVehicle(${item.vehicle_id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteVehicle(${item.vehicle_id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

async function loadResponses() {
    const result = await apiCall('emergency.php?action=responses');
    if (result.success) {
        renderResponsesTable(result.data || []);
    }
}

function renderResponsesTable(data) {
    const tbody = document.getElementById('responses-tbody');
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No response times available</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(item => `
        <tr>
            <td>${item.response_id}</td>
            <td>${item.incident_type || '-'}</td>
            <td>${item.vehicle_number || '-'} (${item.vehicle_type || '-'})</td>
            <td>${formatDateTime(item.dispatch_time)}</td>
            <td>${item.arrival_time ? formatDateTime(item.arrival_time) : '-'}</td>
            <td>${item.response_time_minutes ? item.response_time_minutes + ' min' : '-'}</td>
            <td><span class="badge badge-${getRatingBadge(item.performance_rating)}">${item.performance_rating || 'Good'}</span></td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-secondary" onclick="editResponse(${item.response_id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteResponse(${item.response_id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function switchEmergencyTab(tab) {
    document.querySelectorAll('#emergency-section .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#emergency-section .tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(`emergency-${tab}-tab`).classList.add('active');
}

// Helper functions
function getStatusBadge(status) {
    const badges = {
        'Available': 'success',
        'Pending': 'warning',
        'Confirmed': 'info',
        'Active': 'info',
        'Completed': 'success',
        'Scheduled': 'info',
        'In Progress': 'info',
        'Resolved': 'success',
        'Reported': 'warning',
        'Assigned': 'info',
        'Closed': 'success',
        'Cancelled': 'danger',
        'Dispatched': 'warning',
        'On Scene': 'info',
        'Returning': 'warning',
        'Maintenance': 'danger'
    };
    return badges[status] || 'info';
}

function getSeverityBadge(severity) {
    const badges = {
        'Low': 'success',
        'Medium': 'warning',
        'High': 'warning',
        'Critical': 'danger'
    };
    return badges[severity] || 'info';
}

function getRatingBadge(rating) {
    const badges = {
        'Excellent': 'success',
        'Good': 'info',
        'Average': 'warning',
        'Poor': 'danger'
    };
    return badges[rating] || 'info';
}

function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString();
}

// Modal functions
let currentModalType = null;
let currentEditId = null;

function openModal(type, id = null) {
    currentModalType = type;
    currentEditId = id;
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = getFormHTML(type, id);
    modal.classList.add('active');
    
    if (id) {
        loadEditData(type, id);
    }
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
    currentModalType = null;
    currentEditId = null;
}

// Close modal on outside click
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
}

// Get form HTML based on type
function getFormHTML(type, id) {
    const forms = {
        'traffic': getTrafficForm(),
        'parking-spot': getParkingSpotForm(),
        'reservation': getReservationForm(),
        'collection': getCollectionForm(),
        'waste-type': getWasteTypeForm(),
        'plant': getPlantForm(),
        'transport': getTransportForm(),
        'energy': getEnergyForm(),
        'pollution': getPollutionForm(),
        'incident': getIncidentForm(),
        'vehicle': getVehicleForm(),
        'response': getResponseForm()
    };
    return forms[type] || '<p>Form not found</p>';
}

// Form HTML generators (simplified - you can expand these)
function getTrafficForm() {
    return `
        <h2>${currentEditId ? 'Edit' : 'Record'} Traffic Data</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.9rem;">
            <i class="fas fa-info-circle"></i> Record traffic data from IoT sensors, CCTV cameras, or GPS systems
        </p>
        <form onsubmit="saveTraffic(event)">
            <div class="form-group">
                <label>Location *</label>
                <input type="text" name="location" required>
            </div>
            <div class="form-group">
                <label>Vehicle Count</label>
                <input type="number" name="vehicle_count" value="0">
            </div>
            <div class="form-group">
                <label>Congestion Level</label>
                <select name="congestion_level">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Severe">Severe</option>
                </select>
            </div>
            <div class="form-group">
                <label>Accident Reported</label>
                <select name="accident_reported">
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                </select>
            </div>
            <div class="form-group">
                <label>Accident Details</label>
                <textarea name="accident_details"></textarea>
            </div>
            <div class="form-group">
                <label>Route Name</label>
                <input type="text" name="route_name">
            </div>
            <div class="form-group">
                <label>Sensor ID</label>
                <input type="text" name="sensor_id">
            </div>
            <div class="form-group">
                <label>Average Speed (km/h)</label>
                <input type="number" step="0.01" name="speed_avg">
            </div>
            <div class="form-group">
                <label>Timestamp</label>
                <input type="datetime-local" name="timestamp">
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>
    `;
}

// Save functions (simplified - implement for all types)
async function saveTraffic(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    if (data.accident_reported === 'true') data.accident_reported = true;
    else data.accident_reported = false;
    
    if (currentEditId) {
        data.traffic_id = currentEditId;
        const result = await apiCall('traffic.php', 'PUT', data);
        if (result.success) {
            closeModal();
            loadTrafficData();
        }
    } else {
        const result = await apiCall('traffic.php', 'POST', data);
        if (result.success) {
            closeModal();
            loadTrafficData();
        }
    }
}

// Add similar form generators and save functions for all other features
// For brevity, I'll add key ones - you can expand the rest similarly

function getParkingSpotForm() {
    return `
        <h2>${currentEditId ? 'Edit' : 'Register'} Parking Spot</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.9rem;">
            <i class="fas fa-info-circle"></i> Register a new parking space in the system
        </p>
        <form onsubmit="saveParkingSpot(event)">
            <div class="form-group">
                <label>Location *</label>
                <input type="text" name="location" required>
            </div>
            <div class="form-group">
                <label>Spot Number *</label>
                <input type="text" name="spot_number" required>
            </div>
            <div class="form-group">
                <label>Zone</label>
                <input type="text" name="zone">
            </div>
            <div class="form-group">
                <label>Spot Type</label>
                <select name="spot_type">
                    <option value="Standard">Standard</option>
                    <option value="Handicap">Handicap</option>
                    <option value="Electric">Electric</option>
                    <option value="Premium">Premium</option>
                </select>
            </div>
            <div class="form-group">
                <label>Hourly Rate ($)</label>
                <input type="number" step="0.01" name="hourly_rate" value="0">
            </div>
            <div class="form-group">
                <label>Available</label>
                <select name="is_available">
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>
    `;
}

async function saveParkingSpot(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    data.is_available = data.is_available === 'true';
    
    if (currentEditId) {
        data.spot_id = currentEditId;
        const result = await apiCall('parking.php?action=spots', 'PUT', data);
        if (result.success) {
            closeModal();
            loadParkingSpots();
        }
    } else {
        const result = await apiCall('parking.php?action=spots', 'POST', data);
        if (result.success) {
            closeModal();
            loadParkingSpots();
        }
    }
}

// Add delete functions for all entities
async function deleteParkingSpot(id) {
    if (confirm('Are you sure you want to delete this parking spot?')) {
        const result = await apiCall('parking.php?action=spots', 'DELETE', { id });
        if (result.success) {
            loadParkingSpots();
        }
    }
}

async function deleteReservation(id) {
    if (confirm('Are you sure you want to delete this reservation?')) {
        const result = await apiCall('parking.php?action=reservations', 'DELETE', { id });
        if (result.success) {
            loadReservations();
        }
    }
}

async function deleteCollection(id) {
    if (confirm('Are you sure you want to delete this collection?')) {
        const result = await apiCall('waste.php?action=collection', 'DELETE', { id });
        if (result.success) {
            loadCollections();
        }
    }
}

async function deleteWasteType(id) {
    if (confirm('Are you sure you want to delete this waste type?')) {
        const result = await apiCall('waste.php?action=waste-types', 'DELETE', { id });
        if (result.success) {
            loadWasteTypes();
        }
    }
}

async function deletePlant(id) {
    if (confirm('Are you sure you want to delete this plant?')) {
        const result = await apiCall('waste.php?action=plants', 'DELETE', { id });
        if (result.success) {
            loadPlants();
        }
    }
}

async function deleteTransport(id) {
    if (confirm('Are you sure you want to delete this transport record?')) {
        const result = await apiCall('waste.php?action=transportation', 'DELETE', { id });
        if (result.success) {
            loadTransport();
        }
    }
}

async function deleteEnergy(id) {
    if (confirm('Are you sure you want to delete this energy data?')) {
        const result = await apiCall('energy.php', 'DELETE', { id });
        if (result.success) {
            loadEnergyData();
        }
    }
}

async function deletePollution(id) {
    if (confirm('Are you sure you want to delete this pollution data?')) {
        const result = await apiCall('pollution.php', 'DELETE', { id });
        if (result.success) {
            loadPollutionData();
        }
    }
}

async function deleteIncident(id) {
    if (confirm('Are you sure you want to delete this incident?')) {
        const result = await apiCall('emergency.php?action=incidents', 'DELETE', { id });
        if (result.success) {
            loadIncidents();
        }
    }
}

async function deleteVehicle(id) {
    if (confirm('Are you sure you want to delete this vehicle?')) {
        const result = await apiCall('emergency.php?action=vehicles', 'DELETE', { id });
        if (result.success) {
            loadVehicles();
        }
    }
}

async function deleteResponse(id) {
    if (confirm('Are you sure you want to delete this response time?')) {
        const result = await apiCall('emergency.php?action=responses', 'DELETE', { id });
        if (result.success) {
            loadResponses();
        }
    }
}

// Edit functions - load data and open modal
async function editTraffic(id) {
    openModal('traffic', id);
    await loadEditData('traffic', id);
}

// ============================================
// FORM GENERATORS - All Features
// ============================================

function getReservationForm() {
    return `
        <h2>${currentEditId ? 'Edit' : 'Create'} Parking Reservation</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.9rem;">
            <i class="fas fa-info-circle"></i> Create a new parking reservation for a user
        </p>
        <form onsubmit="saveReservation(event)">
            <div class="form-group">
                <label>Parking Spot *</label>
                <select name="spot_id" id="reservation-spot-select" required></select>
            </div>
            <div class="form-group">
                <label>User Name *</label>
                <input type="text" name="user_name" required>
            </div>
            <div class="form-group">
                <label>User Email *</label>
                <input type="email" name="user_email" required>
            </div>
            <div class="form-group">
                <label>User Phone</label>
                <input type="text" name="user_phone">
            </div>
            <div class="form-group">
                <label>Start Time *</label>
                <input type="datetime-local" name="start_time" required>
            </div>
            <div class="form-group">
                <label>End Time *</label>
                <input type="datetime-local" name="end_time" required>
            </div>
            <div class="form-group">
                <label>Vehicle Plate</label>
                <input type="text" name="vehicle_plate">
            </div>
            <div class="form-group">
                <label>Status</label>
                <select name="status">
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>
    `;
}

function getCollectionForm() {
    return `
        <h2>${currentEditId ? 'Edit' : 'Schedule'} Waste Collection</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.9rem;">
            <i class="fas fa-info-circle"></i> Schedule waste collection from IoT-enabled smart bins
        </p>
        <form onsubmit="saveCollection(event)">
            <div class="form-group">
                <label>Waste Type *</label>
                <select name="waste_type_id" id="collection-waste-select" required></select>
            </div>
            <div class="form-group">
                <label>Location *</label>
                <input type="text" name="location" required>
            </div>
            <div class="form-group">
                <label>Bin ID</label>
                <input type="text" name="bin_id">
            </div>
            <div class="form-group">
                <label>Fill Level (%)</label>
                <input type="number" name="fill_level" min="0" max="100" value="0">
            </div>
            <div class="form-group">
                <label>Status</label>
                <select name="collection_status">
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>
            <div class="form-group">
                <label>Scheduled Date *</label>
                <input type="datetime-local" name="scheduled_date" required>
            </div>
            <div class="form-group">
                <label>Weight (kg)</label>
                <input type="number" step="0.01" name="weight_kg">
            </div>
            <div class="form-group">
                <label>Collector Name</label>
                <input type="text" name="collector_name">
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>
    `;
}

function getWasteTypeForm() {
    return `
        <h2>${currentEditId ? 'Edit' : 'Classify'} Waste Type</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.9rem;">
            <i class="fas fa-info-circle"></i> Add a new waste type classification to the system
        </p>
        <form onsubmit="saveWasteType(event)">
            <div class="form-group">
                <label>Type Name *</label>
                <input type="text" name="type_name" required>
            </div>
            <div class="form-group">
                <label>Category *</label>
                <select name="category" required>
                    <option value="Organic">Organic</option>
                    <option value="Plastic">Plastic</option>
                    <option value="Electronic">Electronic</option>
                    <option value="Metal">Metal</option>
                    <option value="Paper">Paper</option>
                    <option value="Glass">Glass</option>
                    <option value="Hazardous">Hazardous</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea name="description"></textarea>
            </div>
            <div class="form-group">
                <label>Recycling Rate (%)</label>
                <input type="number" step="0.01" name="recycling_rate" value="0">
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>
    `;
}

function getPlantForm() {
    return `
        <h2>${currentEditId ? 'Edit' : 'Register'} Recycling Plant</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.9rem;">
            <i class="fas fa-info-circle"></i> Register a new recycling plant facility
        </p>
        <form onsubmit="savePlant(event)">
            <div class="form-group">
                <label>Plant Name *</label>
                <input type="text" name="plant_name" required>
            </div>
            <div class="form-group">
                <label>Location *</label>
                <input type="text" name="location" required>
            </div>
            <div class="form-group">
                <label>Capacity (tons)</label>
                <input type="number" step="0.01" name="capacity_tons" value="0">
            </div>
            <div class="form-group">
                <label>Waste Types Accepted</label>
                <textarea name="waste_types_accepted"></textarea>
            </div>
            <div class="form-group">
                <label>Contact Person</label>
                <input type="text" name="contact_person">
            </div>
            <div class="form-group">
                <label>Contact Phone</label>
                <input type="text" name="contact_phone">
            </div>
            <div class="form-group">
                <label>Contact Email</label>
                <input type="email" name="contact_email">
            </div>
            <div class="form-group">
                <label>Operational Status</label>
                <select name="operational_status">
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Closed">Closed</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>
    `;
}

function getTransportForm() {
    return `
        <h2>${currentEditId ? 'Edit' : 'Record'} Waste Transportation</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.9rem;">
            <i class="fas fa-info-circle"></i> Record waste transportation from collection point to recycling plant
        </p>
        <form onsubmit="saveTransport(event)">
            <div class="form-group">
                <label>Collection *</label>
                <select name="collection_id" id="transport-collection-select" required></select>
            </div>
            <div class="form-group">
                <label>Recycling Plant</label>
                <select name="plant_id" id="transport-plant-select"></select>
            </div>
            <div class="form-group">
                <label>Vehicle ID *</label>
                <input type="text" name="vehicle_id" required>
            </div>
            <div class="form-group">
                <label>Driver Name</label>
                <input type="text" name="driver_name">
            </div>
            <div class="form-group">
                <label>Route Description</label>
                <textarea name="route_description"></textarea>
            </div>
            <div class="form-group">
                <label>Departure Time</label>
                <input type="datetime-local" name="departure_time">
            </div>
            <div class="form-group">
                <label>Distance (km)</label>
                <input type="number" step="0.01" name="distance_km">
            </div>
            <div class="form-group">
                <label>Status</label>
                <select name="status">
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>
    `;
}

function getEnergyForm() {
    return `
        <h2>${currentEditId ? 'Edit' : 'Record'} Energy Usage</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.9rem;">
            <i class="fas fa-info-circle"></i> Record energy, water, and gas consumption from smart meters
        </p>
        <form onsubmit="saveEnergy(event)">
            <div class="form-group">
                <label>Location *</label>
                <input type="text" name="location" required>
            </div>
            <div class="form-group">
                <label>Consumer Type *</label>
                <select name="consumer_type" required>
                    <option value="Household">Household</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Public">Public</option>
                </select>
            </div>
            <div class="form-group">
                <label>Meter ID *</label>
                <input type="text" name="meter_id" required>
            </div>
            <div class="form-group">
                <label>Energy (kWh)</label>
                <input type="number" step="0.01" name="energy_kwh" value="0">
            </div>
            <div class="form-group">
                <label>Water (Liters)</label>
                <input type="number" step="0.01" name="water_liters" value="0">
            </div>
            <div class="form-group">
                <label>Gas (m³)</label>
                <input type="number" step="0.01" name="gas_m3" value="0">
            </div>
            <div class="form-group">
                <label>Reading Date *</label>
                <input type="datetime-local" name="reading_date" required>
            </div>
            <div class="form-group">
                <label>Cost (USD)</label>
                <input type="number" step="0.01" name="cost_usd" value="0">
            </div>
            <div class="form-group">
                <label>Anomaly Detected</label>
                <select name="anomaly_detected">
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                </select>
            </div>
            <div class="form-group">
                <label>Anomaly Details</label>
                <textarea name="anomaly_details"></textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>
    `;
}

function getPollutionForm() {
    return `
        <h2>${currentEditId ? 'Edit' : 'Record'} Pollution Data</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.9rem;">
            <i class="fas fa-brain"></i> AI-Powered: Analyzes PollutionData table to predict pollution levels and identify causes
        </p>
        <form onsubmit="savePollution(event)">
            <div class="form-group">
                <label>Location *</label>
                <input type="text" name="location" required>
            </div>
            <div class="form-group">
                <label>Sensor ID</label>
                <input type="text" name="sensor_id">
            </div>
            <div class="form-group">
                <label>PM2.5 (μg/m³)</label>
                <input type="number" step="0.01" name="pm25">
            </div>
            <div class="form-group">
                <label>PM10 (μg/m³)</label>
                <input type="number" step="0.01" name="pm10">
            </div>
            <div class="form-group">
                <label>CO₂ (ppm)</label>
                <input type="number" step="0.01" name="co2_ppm">
            </div>
            <div class="form-group">
                <label>NO₂ (ppb)</label>
                <input type="number" step="0.01" name="no2_ppb">
            </div>
            <div class="form-group">
                <label>O₃ (ppb)</label>
                <input type="number" step="0.01" name="o3_ppb">
            </div>
            <div class="form-group">
                <label>Noise Level (dB)</label>
                <input type="number" step="0.01" name="noise_level_db">
            </div>
            <div class="form-group">
                <label>Reading Date *</label>
                <input type="datetime-local" name="reading_date" required>
            </div>
            <div class="form-group">
                <label>Air Quality Index</label>
                <input type="number" name="air_quality_index" min="0" max="500">
            </div>
            <div class="form-group">
                <label>Quality Status</label>
                <select name="quality_status">
                    <option value="Good">Good</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Unhealthy for Sensitive">Unhealthy for Sensitive</option>
                    <option value="Unhealthy">Unhealthy</option>
                    <option value="Very Unhealthy">Very Unhealthy</option>
                    <option value="Hazardous">Hazardous</option>
                </select>
            </div>
            <div class="form-group">
                <label>Predicted Level (AI)</label>
                <input type="number" step="0.01" name="predicted_level" readonly style="background: #2d3748;">
                <small style="color: #94a3b8;">Use AI Predict button to calculate</small>
            </div>
            <div class="form-group">
                <label>Cause Identified</label>
                <input type="text" name="cause_identified" placeholder="e.g., Traffic congestion, Industrial emissions">
            </div>
            <div class="form-group">
                <label>Alert Issued</label>
                <select name="alert_issued">
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="button" class="btn btn-secondary" onclick="predictPollution()"><i class="fas fa-brain"></i> AI Predict</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>
    `;
}

function getIncidentForm() {
    return `
        <h2>${currentEditId ? 'Edit' : 'Report'} Emergency Incident</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.9rem;">
            <i class="fas fa-brain"></i> AI-Powered: Analyzes Incidents, EmergencyVehicles, and ResponseTimes tables to predict high-risk zones
        </p>
        <form onsubmit="saveIncident(event)">
            <div class="form-group">
                <label>Incident Type *</label>
                <select name="incident_type" required>
                    <option value="Accident">Accident</option>
                    <option value="Fire">Fire</option>
                    <option value="Medical">Medical</option>
                    <option value="Crime">Crime</option>
                    <option value="Natural Disaster">Natural Disaster</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Location *</label>
                <input type="text" name="location" required>
            </div>
            <div class="form-group">
                <label>Description *</label>
                <textarea name="description" required></textarea>
            </div>
            <div class="form-group">
                <label>Severity</label>
                <select name="severity">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                </select>
            </div>
            <div class="form-group">
                <label>Reported By</label>
                <input type="text" name="reported_by">
            </div>
            <div class="form-group">
                <label>Reporter Phone</label>
                <input type="text" name="reporter_phone">
            </div>
            <div class="form-group">
                <label>Status</label>
                <select name="status">
                    <option value="Reported">Reported</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="button" class="btn btn-secondary" onclick="predictRisk()"><i class="fas fa-brain"></i> AI Risk Analysis</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>
    `;
}

function getVehicleForm() {
    return `
        <h2>${currentEditId ? 'Edit' : 'Register'} Emergency Vehicle</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.9rem;">
            <i class="fas fa-info-circle"></i> Register a new emergency vehicle in the fleet
        </p>
        <form onsubmit="saveVehicle(event)">
            <div class="form-group">
                <label>Vehicle Type *</label>
                <select name="vehicle_type" required>
                    <option value="Police">Police</option>
                    <option value="Fire">Fire</option>
                    <option value="Ambulance">Ambulance</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Vehicle Number *</label>
                <input type="text" name="vehicle_number" required>
            </div>
            <div class="form-group">
                <label>Current Location</label>
                <input type="text" name="current_location">
            </div>
            <div class="form-group">
                <label>Status</label>
                <select name="status">
                    <option value="Available">Available</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="On Scene">On Scene</option>
                    <option value="Returning">Returning</option>
                    <option value="Maintenance">Maintenance</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>
    `;
}

function getResponseForm() {
    return `
        <h2>${currentEditId ? 'Edit' : 'Record'} Response Time</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.9rem;">
            <i class="fas fa-info-circle"></i> Record emergency response time for performance evaluation
        </p>
        <form onsubmit="saveResponse(event)">
            <div class="form-group">
                <label>Incident *</label>
                <select name="incident_id" id="response-incident-select" required></select>
            </div>
            <div class="form-group">
                <label>Vehicle *</label>
                <select name="vehicle_id" id="response-vehicle-select" required></select>
            </div>
            <div class="form-group">
                <label>Dispatch Time *</label>
                <input type="datetime-local" name="dispatch_time" required>
            </div>
            <div class="form-group">
                <label>Arrival Time</label>
                <input type="datetime-local" name="arrival_time">
            </div>
            <div class="form-group">
                <label>Resolution Time</label>
                <input type="datetime-local" name="resolution_time">
            </div>
            <div class="form-group">
                <label>Travel Distance (km)</label>
                <input type="number" step="0.01" name="travel_distance_km">
            </div>
            <div class="form-group">
                <label>Performance Rating</label>
                <select name="performance_rating">
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                    <option value="Poor">Poor</option>
                </select>
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea name="notes"></textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>
    `;
}

// ============================================
// SAVE FUNCTIONS - All Features
// ============================================

async function saveReservation(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    if (currentEditId) {
        data.reservation_id = currentEditId;
        const result = await apiCall('parking.php?action=reservations', 'PUT', data);
        if (result.success) {
            closeModal();
            loadReservations();
        }
    } else {
        const result = await apiCall('parking.php?action=reservations', 'POST', data);
        if (result.success) {
            closeModal();
            loadReservations();
        }
    }
}

async function saveCollection(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    data.fill_level = parseInt(data.fill_level) || 0;
    data.weight_kg = data.weight_kg ? parseFloat(data.weight_kg) : null;
    
    if (currentEditId) {
        data.collection_id = currentEditId;
        const result = await apiCall('waste.php?action=collection', 'PUT', data);
        if (result.success) {
            closeModal();
            loadCollections();
        }
    } else {
        const result = await apiCall('waste.php?action=collection', 'POST', data);
        if (result.success) {
            closeModal();
            loadCollections();
        }
    }
}

async function saveWasteType(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    data.recycling_rate = parseFloat(data.recycling_rate) || 0;
    
    if (currentEditId) {
        data.waste_type_id = currentEditId;
        const result = await apiCall('waste.php?action=waste-types', 'PUT', data);
        if (result.success) {
            closeModal();
            loadWasteTypes();
        }
    } else {
        const result = await apiCall('waste.php?action=waste-types', 'POST', data);
        if (result.success) {
            closeModal();
            loadWasteTypes();
        }
    }
}

async function savePlant(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    data.capacity_tons = parseFloat(data.capacity_tons) || 0;
    
    if (currentEditId) {
        data.plant_id = currentEditId;
        const result = await apiCall('waste.php?action=plants', 'PUT', data);
        if (result.success) {
            closeModal();
            loadPlants();
        }
    } else {
        const result = await apiCall('waste.php?action=plants', 'POST', data);
        if (result.success) {
            closeModal();
            loadPlants();
        }
    }
}

async function saveTransport(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    data.collection_id = parseInt(data.collection_id);
    data.plant_id = data.plant_id ? parseInt(data.plant_id) : null;
    data.distance_km = data.distance_km ? parseFloat(data.distance_km) : null;
    
    if (currentEditId) {
        data.transport_id = currentEditId;
        const result = await apiCall('waste.php?action=transportation', 'PUT', data);
        if (result.success) {
            closeModal();
            loadTransport();
        }
    } else {
        const result = await apiCall('waste.php?action=transportation', 'POST', data);
        if (result.success) {
            closeModal();
            loadTransport();
        }
    }
}

async function saveEnergy(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    data.energy_kwh = parseFloat(data.energy_kwh) || 0;
    data.water_liters = parseFloat(data.water_liters) || 0;
    data.gas_m3 = parseFloat(data.gas_m3) || 0;
    data.cost_usd = parseFloat(data.cost_usd) || 0;
    data.anomaly_detected = data.anomaly_detected === 'true';
    
    if (currentEditId) {
        data.usage_id = currentEditId;
        const result = await apiCall('energy.php', 'PUT', data);
        if (result.success) {
            closeModal();
            loadEnergyData();
        }
    } else {
        const result = await apiCall('energy.php', 'POST', data);
        if (result.success) {
            closeModal();
            loadEnergyData();
        }
    }
}

async function savePollution(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    data.pm25 = data.pm25 ? parseFloat(data.pm25) : null;
    data.pm10 = data.pm10 ? parseFloat(data.pm10) : null;
    data.co2_ppm = data.co2_ppm ? parseFloat(data.co2_ppm) : null;
    data.no2_ppb = data.no2_ppb ? parseFloat(data.no2_ppb) : null;
    data.o3_ppb = data.o3_ppb ? parseFloat(data.o3_ppb) : null;
    data.noise_level_db = data.noise_level_db ? parseFloat(data.noise_level_db) : null;
    data.alert_issued = data.alert_issued === 'true';
    
    if (currentEditId) {
        data.pollution_id = currentEditId;
        const result = await apiCall('pollution.php', 'PUT', data);
        if (result.success) {
            closeModal();
            loadPollutionData();
        }
    } else {
        const result = await apiCall('pollution.php', 'POST', data);
        if (result.success) {
            closeModal();
            loadPollutionData();
        }
    }
}

async function saveIncident(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    if (currentEditId) {
        data.incident_id = currentEditId;
        const result = await apiCall('emergency.php?action=incidents', 'PUT', data);
        if (result.success) {
            closeModal();
            loadIncidents();
        }
    } else {
        const result = await apiCall('emergency.php?action=incidents', 'POST', data);
        if (result.success) {
            closeModal();
            loadIncidents();
        }
    }
}

async function saveVehicle(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    if (currentEditId) {
        data.vehicle_id = currentEditId;
        const result = await apiCall('emergency.php?action=vehicles', 'PUT', data);
        if (result.success) {
            closeModal();
            loadVehicles();
        }
    } else {
        const result = await apiCall('emergency.php?action=vehicles', 'POST', data);
        if (result.success) {
            closeModal();
            loadVehicles();
        }
    }
}

async function saveResponse(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    data.incident_id = parseInt(data.incident_id);
    data.vehicle_id = parseInt(data.vehicle_id);
    data.travel_distance_km = data.travel_distance_km ? parseFloat(data.travel_distance_km) : null;
    
    if (currentEditId) {
        data.response_id = currentEditId;
        const result = await apiCall('emergency.php?action=responses', 'PUT', data);
        if (result.success) {
            closeModal();
            loadResponses();
        }
    } else {
        const result = await apiCall('emergency.php?action=responses', 'POST', data);
        if (result.success) {
            closeModal();
            loadResponses();
        }
    }
}

// ============================================
// EDIT FUNCTIONS - Load Data
// ============================================

async function loadEditData(type, id) {
    let endpoint = '';
    switch(type) {
        case 'traffic':
            endpoint = `traffic.php?id=${id}`;
            break;
        case 'parking-spot':
            endpoint = `parking.php?action=spots&id=${id}`;
            break;
        case 'reservation':
            endpoint = `parking.php?action=reservations&id=${id}`;
            break;
        case 'collection':
            endpoint = `waste.php?action=collection&id=${id}`;
            break;
        case 'waste-type':
            endpoint = `waste.php?action=waste-types&id=${id}`;
            break;
        case 'plant':
            endpoint = `waste.php?action=plants&id=${id}`;
            break;
        case 'transport':
            endpoint = `waste.php?action=transportation&id=${id}`;
            break;
        case 'energy':
            endpoint = `energy.php?id=${id}`;
            break;
        case 'pollution':
            endpoint = `pollution.php?id=${id}`;
            break;
        case 'incident':
            endpoint = `emergency.php?action=incidents&id=${id}`;
            break;
        case 'vehicle':
            endpoint = `emergency.php?action=vehicles&id=${id}`;
            break;
        case 'response':
            endpoint = `emergency.php?action=responses&id=${id}`;
            break;
    }
    
    const result = await apiCall(endpoint);
    if (result.success && result.data) {
        setTimeout(() => {
            const form = document.querySelector('#modal form');
            if (form) {
                populateForm(form, result.data, type);
            }
        }, 100);
    }
}

function populateForm(form, data, type) {
    Object.keys(data).forEach(key => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = data[key] == 1;
            } else if (input.type === 'datetime-local') {
                if (data[key]) {
                    const dateStr = data[key].toString();
                    input.value = dateStr.replace(' ', 'T').substring(0, 16);
                }
            } else if (input.tagName === 'SELECT') {
                const value = data[key] || '';
                input.value = value;
                // Also check for boolean values
                if (value === 1 || value === '1' || value === true || value === 'true') {
                    input.value = 'true';
                } else if (value === 0 || value === '0' || value === false || value === 'false') {
                    input.value = 'false';
                }
            } else if (input.type === 'number') {
                input.value = data[key] || '';
            } else {
                input.value = data[key] || '';
            }
        }
    });
    
    // Special handling for boolean fields
    if (data.is_available !== undefined) {
        const availInput = form.querySelector('[name="is_available"]');
        if (availInput) {
            availInput.value = (data.is_available == 1 || data.is_available === true) ? 'true' : 'false';
        }
    }
    if (data.accident_reported !== undefined) {
        const accidentInput = form.querySelector('[name="accident_reported"]');
        if (accidentInput) {
            accidentInput.value = (data.accident_reported == 1 || data.accident_reported === true) ? 'true' : 'false';
        }
    }
    if (data.anomaly_detected !== undefined) {
        const anomalyInput = form.querySelector('[name="anomaly_detected"]');
        if (anomalyInput) {
            anomalyInput.value = (data.anomaly_detected == 1 || data.anomaly_detected === true) ? 'true' : 'false';
        }
    }
    if (data.alert_issued !== undefined) {
        const alertInput = form.querySelector('[name="alert_issued"]');
        if (alertInput) {
            alertInput.value = (data.alert_issued == 1 || data.alert_issued === true) ? 'true' : 'false';
        }
    }
}

async function editParkingSpot(id) {
    openModal('parking-spot', id);
    await loadEditData('parking-spot', id);
}

async function editReservation(id) {
    openModal('reservation', id);
    await loadEditData('reservation', id);
    // Load parking spots for dropdown
    const spotsResult = await apiCall('parking.php?action=spots');
    if (spotsResult.success) {
        const select = document.getElementById('reservation-spot-select');
        if (select) {
            select.innerHTML = '<option value="">Select Spot</option>' + 
                spotsResult.data.map(s => `<option value="${s.spot_id}">${s.spot_number} - ${s.location}</option>`).join('');
        }
    }
}

async function editCollection(id) {
    openModal('collection', id);
    await loadEditData('collection', id);
    // Load waste types
    const typesResult = await apiCall('waste.php?action=waste-types');
    if (typesResult.success) {
        const select = document.getElementById('collection-waste-select');
        if (select) {
            select.innerHTML = '<option value="">Select Waste Type</option>' + 
                typesResult.data.map(t => `<option value="${t.waste_type_id}">${t.type_name}</option>`).join('');
        }
    }
}

async function editWasteType(id) {
    openModal('waste-type', id);
    await loadEditData('waste-type', id);
}

async function editPlant(id) {
    openModal('plant', id);
    await loadEditData('plant', id);
}

async function editTransport(id) {
    openModal('transport', id);
    await loadEditData('transport', id);
    // Load collections and plants
    const [collections, plants] = await Promise.all([
        apiCall('waste.php?action=collection'),
        apiCall('waste.php?action=plants')
    ]);
    if (collections.success) {
        const select = document.getElementById('transport-collection-select');
        if (select) {
            select.innerHTML = '<option value="">Select Collection</option>' + 
                collections.data.map(c => `<option value="${c.collection_id}">Collection #${c.collection_id} - ${c.location}</option>`).join('');
        }
    }
    if (plants.success) {
        const select = document.getElementById('transport-plant-select');
        if (select) {
            select.innerHTML = '<option value="">Select Plant</option>' + 
                plants.data.map(p => `<option value="${p.plant_id}">${p.plant_name}</option>`).join('');
        }
    }
}

async function editEnergy(id) {
    openModal('energy', id);
    await loadEditData('energy', id);
}

async function editPollution(id) {
    openModal('pollution', id);
    await loadEditData('pollution', id);
}

async function editIncident(id) {
    openModal('incident', id);
    await loadEditData('incident', id);
}

async function editVehicle(id) {
    openModal('vehicle', id);
    await loadEditData('vehicle', id);
}

async function editResponse(id) {
    openModal('response', id);
    await loadEditData('response', id);
    // Load incidents and vehicles
    const [incidents, vehicles] = await Promise.all([
        apiCall('emergency.php?action=incidents'),
        apiCall('emergency.php?action=vehicles')
    ]);
    if (incidents.success) {
        const select = document.getElementById('response-incident-select');
        if (select) {
            select.innerHTML = '<option value="">Select Incident</option>' + 
                incidents.data.map(i => `<option value="${i.incident_id}">#${i.incident_id} - ${i.incident_type} at ${i.location}</option>`).join('');
        }
    }
    if (vehicles.success) {
        const select = document.getElementById('response-vehicle-select');
        if (select) {
            select.innerHTML = '<option value="">Select Vehicle</option>' + 
                vehicles.data.map(v => `<option value="${v.vehicle_id}">${v.vehicle_number} - ${v.vehicle_type}</option>`).join('');
        }
    }
}

// ============================================
// AI FUNCTIONS
// ============================================

// AI Pollution Prediction
async function predictPollution() {
    const form = document.querySelector('#modal form');
    if (!form) return;
    
    const location = form.querySelector('[name="location"]').value;
    const pm25 = parseFloat(form.querySelector('[name="pm25"]').value) || 0;
    const pm10 = parseFloat(form.querySelector('[name="pm10"]').value) || 0;
    const co2 = parseFloat(form.querySelector('[name="co2_ppm"]').value) || 0;
    
    if (!location) {
        alert('Please enter a location first');
        return;
    }
    
    showLoading();
    
    // AI Prediction Algorithm (simplified - can be enhanced with ML model)
    // Based on historical patterns and current readings
    const basePrediction = (pm25 * 1.2) + (pm10 * 0.8) + (co2 / 10);
    const timeFactor = new Date().getHours() >= 8 && new Date().getHours() <= 18 ? 1.15 : 0.9;
    const predictedLevel = Math.round(basePrediction * timeFactor);
    
    // Determine quality status
    let qualityStatus = 'Good';
    let alertIssued = false;
    if (predictedLevel > 200) {
        qualityStatus = 'Hazardous';
        alertIssued = true;
    } else if (predictedLevel > 150) {
        qualityStatus = 'Very Unhealthy';
        alertIssued = true;
    } else if (predictedLevel > 100) {
        qualityStatus = 'Unhealthy';
        alertIssued = true;
    } else if (predictedLevel > 50) {
        qualityStatus = 'Unhealthy for Sensitive';
    } else if (predictedLevel > 25) {
        qualityStatus = 'Moderate';
    }
    
    // Identify cause
    let cause = 'Normal conditions';
    if (pm25 > 50 || pm10 > 100) {
        cause = 'High particulate matter - Possible traffic congestion or industrial activity';
    } else if (co2 > 450) {
        cause = 'Elevated CO₂ levels - Industrial emissions or high vehicle density';
    }
    
    // Update form fields
    const predictedInput = form.querySelector('[name="predicted_level"]');
    const aqiInput = form.querySelector('[name="air_quality_index"]');
    const statusSelect = form.querySelector('[name="quality_status"]');
    const alertSelect = form.querySelector('[name="alert_issued"]');
    const causeInput = form.querySelector('[name="cause_identified"]');
    
    if (predictedInput) predictedInput.value = predictedLevel;
    if (aqiInput) aqiInput.value = predictedLevel;
    if (statusSelect) statusSelect.value = qualityStatus;
    if (alertSelect) alertSelect.value = alertIssued ? 'true' : 'false';
    if (causeInput) causeInput.value = cause;
    
    hideLoading();
    
    alert(`AI Prediction Complete!\n\nPredicted AQI: ${predictedLevel}\nQuality Status: ${qualityStatus}\nCause: ${cause}\n${alertIssued ? '⚠️ Alert will be issued!' : ''}`);
}

// AI Risk Prediction for Emergency Response
async function predictRisk() {
    const form = document.querySelector('#modal form');
    if (!form) return;
    
    const incidentType = form.querySelector('[name="incident_type"]').value;
    const location = form.querySelector('[name="location"]').value;
    const description = form.querySelector('[name="description"]').value.toLowerCase();
    
    if (!incidentType || !location) {
        alert('Please enter incident type and location first');
        return;
    }
    
    showLoading();
    
    // AI Risk Assessment Algorithm
    let riskScore = 0;
    let severity = 'Medium';
    let recommendations = [];
    
    // Analyze incident type
    const typeWeights = {
        'Fire': 85,
        'Medical': 75,
        'Crime': 70,
        'Accident': 65,
        'Natural Disaster': 90,
        'Other': 50
    };
    riskScore += typeWeights[incidentType] || 50;
    
    // Analyze description keywords
    const highRiskKeywords = ['fire', 'explosion', 'critical', 'urgent', 'multiple', 'trapped', 'unconscious', 'bleeding'];
    const mediumRiskKeywords = ['injury', 'accident', 'smoke', 'damage', 'stolen', 'assault'];
    
    highRiskKeywords.forEach(keyword => {
        if (description.includes(keyword)) {
            riskScore += 15;
            recommendations.push(`High-risk keyword detected: "${keyword}"`);
        }
    });
    
    mediumRiskKeywords.forEach(keyword => {
        if (description.includes(keyword)) {
            riskScore += 8;
        }
    });
    
    // Time-based risk (night time = higher risk)
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 6) {
        riskScore += 10;
        recommendations.push('Night-time incident - increased response priority');
    }
    
    // Determine severity
    if (riskScore >= 90) {
        severity = 'Critical';
        recommendations.push('CRITICAL: Immediate response required');
        recommendations.push('Consider multiple vehicle dispatch');
    } else if (riskScore >= 75) {
        severity = 'High';
        recommendations.push('HIGH PRIORITY: Rapid response needed');
    } else if (riskScore >= 60) {
        severity = 'Medium';
    } else {
        severity = 'Low';
    }
    
    // Update form
    form.querySelector('[name="severity"]').value = severity;
    
    hideLoading();
    
    const message = `AI Risk Analysis Complete!\n\nRisk Score: ${riskScore}/100\nRecommended Severity: ${severity}\n\nRecommendations:\n${recommendations.join('\n') || 'Standard response protocol'}`;
    alert(message);
}

// Load dropdown options when modal opens
function openModal(type, id = null) {
    currentModalType = type;
    currentEditId = id;
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = getFormHTML(type, id);
    modal.classList.add('active');
    
    // Load dropdown options
    loadDropdownOptions(type);
    
    if (id) {
        loadEditData(type, id);
    }
}

async function loadDropdownOptions(type) {
    switch(type) {
        case 'reservation':
            const spots = await apiCall('parking.php?action=spots&available=true');
            if (spots.success) {
                const select = document.getElementById('reservation-spot-select');
                if (select) {
                    select.innerHTML = '<option value="">Select Parking Spot</option>' + 
                        spots.data.map(s => `<option value="${s.spot_id}">${s.spot_number} - ${s.location} ($${s.hourly_rate}/hr)</option>`).join('');
                }
            }
            break;
        case 'collection':
            const wasteTypes = await apiCall('waste.php?action=waste-types');
            if (wasteTypes.success) {
                const select = document.getElementById('collection-waste-select');
                if (select) {
                    select.innerHTML = '<option value="">Select Waste Type</option>' + 
                        wasteTypes.data.map(t => `<option value="${t.waste_type_id}">${t.type_name} (${t.category})</option>`).join('');
                }
            }
            break;
        case 'transport':
            const [collections, plants] = await Promise.all([
                apiCall('waste.php?action=collection'),
                apiCall('waste.php?action=plants')
            ]);
            if (collections.success) {
                const select = document.getElementById('transport-collection-select');
                if (select) {
                    select.innerHTML = '<option value="">Select Collection</option>' + 
                        collections.data.map(c => `<option value="${c.collection_id}">#${c.collection_id} - ${c.location}</option>`).join('');
                }
            }
            if (plants.success) {
                const select = document.getElementById('transport-plant-select');
                if (select) {
                    select.innerHTML = '<option value="">Select Plant (Optional)</option>' + 
                        plants.data.map(p => `<option value="${p.plant_id}">${p.plant_name}</option>`).join('');
                }
            }
            break;
        case 'response':
            const [incidents, vehicles] = await Promise.all([
                apiCall('emergency.php?action=incidents'),
                apiCall('emergency.php?action=vehicles')
            ]);
            if (incidents.success) {
                const select = document.getElementById('response-incident-select');
                if (select) {
                    select.innerHTML = '<option value="">Select Incident</option>' + 
                        incidents.data.map(i => `<option value="${i.incident_id}">#${i.incident_id} - ${i.incident_type} at ${i.location}</option>`).join('');
                }
            }
            if (vehicles.success) {
                const select = document.getElementById('response-vehicle-select');
                if (select) {
                    select.innerHTML = '<option value="">Select Vehicle</option>' + 
                        vehicles.data.map(v => `<option value="${v.vehicle_id}">${v.vehicle_number} - ${v.vehicle_type}</option>`).join('');
                }
            }
            break;
    }
}


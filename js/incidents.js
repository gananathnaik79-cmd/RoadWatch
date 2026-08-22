// RoadWatch Incident Explorer Module

let allExplorerIncidents = [];
let currentPage = 1;
const itemsPerPage = 12;

// Load incidents
async function loadIncidents() {
    try {
        const { data: incidents, error } = await supabase
            .from('roadwatch_incidents')
            .select('*')
            .order('incident_date', { ascending: false });
        
        if (error) {
            throw error;
        }
        
        allExplorerIncidents = incidents || [];
        
        // Check if there's a specific incident to view
        const urlParams = new URLSearchParams(window.location.search);
        const incidentId = urlParams.get('incident');
        
        if (incidentId) {
            const incident = allExplorerIncidents.find(i => i.incident_id === incidentId);
            if (incident) {
                openIncidentModal(incident);
            }
        }
        
        // Display incidents
        displayIncidents();
        
    } catch (error) {
        console.error('Incidents load error:', error);
        document.getElementById('incidentsList').innerHTML = 
            '<p>Error loading incidents. Please try again.</p>';
    }
}

// Display incidents with pagination
function displayIncidents() {
    const container = document.getElementById('incidentsList');
    const paginationContainer = document.getElementById('pagination');
    
    // Calculate pagination
    const totalPages = Math.ceil(allExplorerIncidents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentIncidents = allExplorerIncidents.slice(startIndex, endIndex);
    
    // Render incidents
    if (currentIncidents.length === 0) {
        container.innerHTML = '<p>No incidents found.</p>';
    } else {
        let html = '';
        
        currentIncidents.forEach(incident => {
            const severityClass = getSeverityClass(incident.incident_severity);
            const statusClass = getStatusClass(incident.verification_status);
            
            html += `
                <div class="incident-card" onclick="openIncidentById('${incident.incident_id}')">
                    <div class="incident-card-header">
                        <span class="incident-badge badge-${severityClass}">${incident.incident_severity || 'N/A'}</span>
                        <span class="incident-badge badge-${statusClass}">${incident.verification_status || 'N/A'}</span>
                    </div>
                    <h3>${incident.crime_type || 'Unknown Incident'}</h3>
                    <p><strong>Date:</strong> ${formatDate(incident.incident_date)}</p>
                    <p><strong>Location:</strong> ${incident.suburb || 'N/A'}</p>
                    <p><strong>Vehicle:</strong> ${incident.car_make || 'N/A'} ${incident.car_model || ''} ${incident.car_year || ''}</p>
                    <p><strong>Council:</strong> ${incident.council_area || 'N/A'}</p>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    // Render pagination
    renderPagination(totalPages);
}

// Render pagination
function renderPagination(totalPages) {
    const paginationContainer = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Previous button
    html += `<button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>`;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        html += `<button onclick="changePage(${i})" class="${i === currentPage ? 'active' : ''}">${i}</button>`;
    }
    
    // Next button
    html += `<button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`;
    
    paginationContainer.innerHTML = html;
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(allExplorerIncidents.length / itemsPerPage);
    
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    displayIncidents();
    
    // Scroll to top of list
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Filter incidents (called from search input)
function filterIncidents() {
    const searchText = document.getElementById('explorerSearch').value.toLowerCase();
    
    if (!searchText) {
        // Reset to all incidents
        loadIncidents();
        return;
    }
    
    // Filter locally
    const filtered = allExplorerIncidents.filter(incident => {
        const searchableText = JSON.stringify(incident).toLowerCase();
        return searchableText.includes(searchText);
    });
    
    // Temporarily update incidents list
    const originalIncidents = allExplorerIncidents;
    allExplorerIncidents = filtered;
    currentPage = 1;
    displayIncidents();
    allExplorerIncidents = originalIncidents;
}

// Sort incidents
function sortIncidents() {
    const sortBy = document.getElementById('explorerSort').value;
    
    switch(sortBy) {
        case 'date_desc':
            allExplorerIncidents.sort((a, b) => new Date(b.incident_date) - new Date(a.incident_date));
            break;
        case 'date_asc':
            allExplorerIncidents.sort((a, b) => new Date(a.incident_date) - new Date(b.incident_date));
            break;
        case 'severity':
            const severityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
            allExplorerIncidents.sort((a, b) => 
                (severityOrder[a.incident_severity] || 4) - (severityOrder[b.incident_severity] || 4)
            );
            break;
        case 'crime_type':
            allExplorerIncidents.sort((a, b) => 
                (a.crime_type || '').localeCompare(b.crime_type || '')
            );
            break;
    }
    
    currentPage = 1;
    displayIncidents();
}

// Open incident by ID
function openIncidentById(incidentId) {
    const incident = allExplorerIncidents.find(i => i.incident_id === incidentId);
    if (incident) {
        openIncidentModal(incident);
    }
}

// Open incident modal
function openIncidentModal(incident) {
    const modal = document.getElementById('incidentModal');
    const detailContainer = document.getElementById('incidentDetail');
    
    let html = `
        <h2>${incident.crime_type || 'Unknown Incident'}</h2>
        
        <div class="incident-detail-grid">
            <div class="detail-section">
                <h3>Basic Information</h3>
                <p><strong>Incident ID:</strong> ${incident.incident_id || 'N/A'}</p>
                <p><strong>Date:</strong> ${formatDate(incident.incident_date)}</p>
                <p><strong>Crime Type:</strong> ${incident.crime_type || 'N/A'}</p>
                <p><strong>Category:</strong> ${incident.vehicle_crime_category || 'N/A'}</p>
                <p><strong>Severity:</strong> ${incident.incident_severity || 'N/A'}</p>
            </div>
            
            <div class="detail-section">
                <h3>Location Information</h3>
                <p><strong>Council Area:</strong> ${incident.council_area || 'N/A'}</p>
                <p><strong>Suburb:</strong> ${incident.suburb || 'N/A'}</p>
                <p><strong>Postcode:</strong> ${incident.postcode || 'N/A'}</p>
                <p><strong>Location:</strong> ${incident.location_name || 'N/A'}</p>
                <p><strong>Coordinates:</strong> ${incident.latitude ? incident.latitude.toFixed(4) : 'N/A'}, ${incident.longitude ? incident.longitude.toFixed(4) : 'N/A'}</p>
            </div>
            
            <div class="detail-section">
                <h3>Vehicle Information</h3>
                <p><strong>Make:</strong> ${incident.car_make || 'N/A'}</p>
                <p><strong>Model:</strong> ${incident.car_model || 'N/A'}</p>
                <p><strong>Year:</strong> ${incident.car_year || 'N/A'}</p>
            </div>
            
            <div class="detail-section">
                <h3>Additional Details</h3>
                <p><strong>Verification Status:</strong> ${incident.verification_status || 'N/A'}</p>
                <p><strong>Source Type:</strong> ${incident.source_type || 'N/A'}</p>
                <p><strong>Evidence Level:</strong> ${incident.evidence_level || 'N/A'}</p>
                <p><strong>Last Verified:</strong> ${formatDate(incident.last_verified)}</p>
            </div>
        </div>
        
        <div class="detail-description">
            <h3>Description</h3>
            <p>${incident.description || 'No description provided.'}</p>
        </div>
        
        <div class="detail-description">
            <h3>Notes</h3>
            <p>${incident.notes || 'No notes provided.'}</p>
        </div>
    `;
    
    // Add mini map if coordinates exist
    if (incident.latitude && incident.longitude) {
        html += `
            <div class="detail-map">
                <h3>Location Map</h3>
                <div id="incidentMap" style="height: 300px;"></div>
            </div>
        `;
    }
    
    detailContainer.innerHTML = html;
    modal.style.display = 'block';
    
    // Initialize mini map if coordinates exist
    if (incident.latitude && incident.longitude) {
        setTimeout(() => {
            const miniMap = L.map('incidentMap').setView([incident.latitude, incident.longitude], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(miniMap);
            
            L.marker([incident.latitude, incident.longitude]).addTo(miniMap);
        }, 100);
    }
}

// Close incident modal
function closeIncidentModal() {
    const modal = document.getElementById('incidentModal');
    modal.style.display = 'none';
}

// Helper functions
function getSeverityClass(severity) {
    if (!severity) return 'low';
    
    switch(severity.toLowerCase()) {
        case 'high':
            return 'high';
        case 'medium':
            return 'medium';
        default:
            return 'low';
    }
}

function getStatusClass(status) {
    if (!status) return 'pending';
    
    switch(status.toLowerCase()) {
        case 'verified':
            return 'verified';
        case 'rejected':
            return 'high';
        default:
            return 'pending';
    }
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('incidentModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

// Load incidents on page load
document.addEventListener('DOMContentLoaded', loadIncidents);
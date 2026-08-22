// RoadWatch Crime Map Module

let map;
let mapMarkers = [];
let allMapIncidents = [];

// Initialize map
function initMap() {
  // Create map centered on a default location
  map = L.map('map').setView([-25.2744, 133.7751], 5); // Center on Australia
  
  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
  }).addTo(map);
  
  // Load incidents
  loadMapIncidents();
}

// Load incidents for map
async function loadMapIncidents() {
  try {
    const { data: incidents, error } = await supabase
      .from('roadwatch_incidents')
      .select('*')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);
    
    if (error) {
      throw error;
    }
    
    allMapIncidents = incidents || [];
    
    // Populate crime type filter
    populateCrimeTypeFilter(allMapIncidents);
    
    // Add markers to map
    addMarkersToMap(allMapIncidents);
    
    // If there are incidents, center on them
    if (allMapIncidents.length > 0) {
      const bounds = L.latLngBounds(
        allMapIncidents
        .filter(i => i.latitude && i.longitude)
        .map(i => [i.latitude, i.longitude])
      );
      
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
    
  } catch (error) {
    console.error('Map load error:', error);
    alert('Error loading map data. Please try again.');
  }
}

// Populate crime type filter
function populateCrimeTypeFilter(incidents) {
  const filter = document.getElementById('crimeTypeFilter');
  const crimeTypes = new Set(incidents.map(i => i.crime_type).filter(Boolean));
  
  crimeTypes.forEach(type => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type;
    filter.appendChild(option);
  });
}

// Add markers to map
function addMarkersToMap(incidents) {
  // Clear existing markers
  mapMarkers.forEach(marker => marker.remove());
  mapMarkers = [];
  
  incidents.forEach(incident => {
    if (!incident.latitude || !incident.longitude) return;
    
    const marker = createMarker(incident);
    marker.addTo(map);
    mapMarkers.push(marker);
  });
}

// Create marker for incident
function createMarker(incident) {
  const severity = incident.incident_severity || 'low';
  const iconColor = getSeverityColor(severity);
  
  const icon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${iconColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
  
  const marker = L.marker([incident.latitude, incident.longitude], { icon });
  
  // Create popup content
  const popupContent = `
        <div class="popup-content">
            <h4>${incident.crime_type || 'Unknown Incident'}</h4>
            <p><strong>Date:</strong> ${formatDate(incident.incident_date)}</p>
            <p><strong>Suburb:</strong> ${incident.suburb || 'N/A'}</p>
            <p><strong>Location:</strong> ${incident.location_name || 'Unknown'}</p>
            <p><strong>Vehicle:</strong> ${incident.car_make || 'N/A'} ${incident.car_model || ''}</p>
            <p><strong>Severity:</strong> ${incident.incident_severity || 'N/A'}</p>
            <p><strong>Status:</strong> ${incident.verification_status || 'N/A'}</p>
            <button onclick="viewIncidentDetails('${incident.incident_id}')" class="btn btn-sm btn-primary">View Details</button>
        </div>
    `;
  
  marker.bindPopup(popupContent);
  
  return marker;
}

// Get color for severity
function getSeverityColor(severity) {
  if (!severity) return '#4caf50';
  
  switch (severity.toLowerCase()) {
    case 'high':
      return '#f44336';
    case 'medium':
      return '#ff9800';
    default:
      return '#4caf50';
  }
}

// Format date
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Apply filters
function applyMapFilters() {
  const severityFilter = document.getElementById('severityFilter').value;
  const crimeTypeFilter = document.getElementById('crimeTypeFilter').value;
  
  let filteredIncidents = allMapIncidents;
  
  if (severityFilter) {
    filteredIncidents = filteredIncidents.filter(i =>
      i.incident_severity === severityFilter
    );
  }
  
  if (crimeTypeFilter) {
    filteredIncidents = filteredIncidents.filter(i =>
      i.crime_type === crimeTypeFilter
    );
  }
  
  addMarkersToMap(filteredIncidents);
}

// View incident details
function viewIncidentDetails(incidentId) {
  window.location.href = `incidents.html?incident=${incidentId}`;
}

// Add event listeners to filters
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  
  document.getElementById('severityFilter').addEventListener('change', applyMapFilters);
  document.getElementById('crimeTypeFilter').addEventListener('change', applyMapFilters);
});
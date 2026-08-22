// RoadWatch Search & Filters Module

let allSearchIncidents = [];

// Load unique values for filters
async function loadFilterOptions() {
  try {
    const { data: incidents, error } = await supabase
      .from('roadwatch_incidents')
      .select('crime_type, council_area, verification_status')
      .limit(1000);
    
    if (error) {
      throw error;
    }
    
    allSearchIncidents = incidents || [];
    
    // Populate crime type filter
    const crimeTypeSelect = document.getElementById('crimeType');
    const crimeTypes = new Set(incidents.map(i => i.crime_type).filter(Boolean));
    crimeTypes.forEach(type => {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = type;
      crimeTypeSelect.appendChild(option);
    });
    
    // Populate council area filter
    const councilAreaSelect = document.getElementById('councilArea');
    const councilAreas = new Set(incidents.map(i => i.council_area).filter(Boolean));
    councilAreas.forEach(area => {
      const option = document.createElement('option');
      option.value = area;
      option.textContent = area;
      councilAreaSelect.appendChild(option);
    });
    
  } catch (error) {
    console.error('Load filters error:', error);
  }
}

// Search incidents
async function searchIncidents() {
  const resultsContainer = document.getElementById('searchResults');
  const resultsCount = document.getElementById('resultsCount');
  
  // Get filter values
  const searchText = document.getElementById('searchText').value.toLowerCase();
  const crimeType = document.getElementById('crimeType').value;
  const severity = document.getElementById('severity').value;
  const councilArea = document.getElementById('councilArea').value;
  const suburb = document.getElementById('suburb').value.toLowerCase();
  const vehicleMake = document.getElementById('vehicleMake').value.toLowerCase();
  const verificationStatus = document.getElementById('verificationStatus').value;
  const dateFrom = document.getElementById('dateFrom').value;
  const dateTo = document.getElementById('dateTo').value;
  
  // Build query
  let query = supabase
    .from('roadwatch_incidents')
    .select('*')
    .order('incident_date', { ascending: false });
  
  // Apply filters
  if (crimeType) {
    query = query.eq('crime_type', crimeType);
  }
  
  if (severity) {
    query = query.eq('incident_severity', severity);
  }
  
  if (councilArea) {
    query = query.eq('council_area', councilArea);
  }
  
  if (verificationStatus) {
    query = query.eq('verification_status', verificationStatus);
  }
  
  if (dateFrom) {
    query = query.gte('incident_date', dateFrom);
  }
  
  if (dateTo) {
    query = query.lte('incident_date', dateTo);
  }
  
  try {
    const { data: incidents, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Filter locally for text-based searches
    let filteredResults = incidents || [];
    
    if (searchText) {
      filteredResults = filteredResults.filter(incident => {
        const searchableText = JSON.stringify(incident).toLowerCase();
        return searchableText.includes(searchText);
      });
    }
    
    if (suburb) {
      filteredResults = filteredResults.filter(incident =>
        incident.suburb && incident.suburb.toLowerCase().includes(suburb)
      );
    }
    
    if (vehicleMake) {
      filteredResults = filteredResults.filter(incident =>
        incident.car_make && incident.car_make.toLowerCase().includes(vehicleMake)
      );
    }
    
    // Display results
    displaySearchResults(filteredResults);
    
  } catch (error) {
    console.error('Search error:', error);
    resultsContainer.innerHTML = '<p>Error searching incidents. Please try again.</p>';
    resultsCount.style.display = 'none';
  }
}

// Display search results
function displaySearchResults(incidents) {
  const resultsContainer = document.getElementById('searchResults');
  const resultsCount = document.getElementById('resultsCount');
  
  // Show results count
  resultsCount.style.display = 'block';
  resultsCount.textContent = `${incidents.length} incident${incidents.length !== 1 ? 's' : ''} found`;
  
  if (incidents.length === 0) {
    resultsContainer.innerHTML = '<p>No incidents found matching your criteria.</p>';
    return;
  }
  
  let html = '';
  
  incidents.forEach(incident => {
    const severityClass = getSeverityClass(incident.incident_severity);
    const statusClass = getStatusClass(incident.verification_status);
    
    html += `
            <div class="result-card" onclick="viewIncident('${incident.incident_id}')">
                <h3>${incident.crime_type || 'Unknown'}</h3>
                <p><strong>Date:</strong> ${formatDate(incident.incident_date)}</p>
                <p><strong>Location:</strong> ${incident.suburb || 'N/A'}, ${incident.council_area || 'N/A'}</p>
                <p><strong>Vehicle:</strong> ${incident.car_make || 'N/A'} ${incident.car_model || ''}</p>
                <div class="incident-badges">
                    <span class="incident-badge badge-${severityClass}">${incident.incident_severity || 'N/A'}</span>
                    <span class="incident-badge badge-${statusClass}">${incident.verification_status || 'N/A'}</span>
                </div>
            </div>
        `;
  });
  
  resultsContainer.innerHTML = html;
}

// Clear filters
function clearFilters() {
  document.getElementById('searchText').value = '';
  document.getElementById('crimeType').value = '';
  document.getElementById('severity').value = '';
  document.getElementById('councilArea').value = '';
  document.getElementById('suburb').value = '';
  document.getElementById('vehicleMake').value = '';
  document.getElementById('verificationStatus').value = '';
  document.getElementById('dateFrom').value = '';
  document.getElementById('dateTo').value = '';
  
  // Clear results
  document.getElementById('searchResults').innerHTML = '';
  document.getElementById('resultsCount').style.display = 'none';
}

// View incident
function viewIncident(incidentId) {
  window.location.href = `incidents.html?incident=${incidentId}`;
}

// Helper functions
function getSeverityClass(severity) {
  if (!severity) return 'low';
  
  switch (severity.toLowerCase()) {
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
  
  switch (status.toLowerCase()) {
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

// Load filter options on page load
document.addEventListener('DOMContentLoaded', loadFilterOptions);
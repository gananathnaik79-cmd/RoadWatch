// RoadWatch Report Incident Module

// Generate unique incident ID
function generateIncidentId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  return `RW-${year}${month}${day}-${random}`;
}

// Submit incident report
async function submitIncidentReport(event) {
  event.preventDefault();
  
  const submitButton = document.getElementById('submitButton');
  const errorMessage = document.getElementById('error-message');
  const successMessage = document.getElementById('success-message');
  
  // Reset messages
  errorMessage.style.display = 'none';
  errorMessage.textContent = '';
  successMessage.style.display = 'none';
  successMessage.textContent = '';
  
  // Get form values
  const formData = {
    incident_date: document.getElementById('incidentDate').value,
    crime_type: document.getElementById('crimeType').value,
    vehicle_crime_category: document.getElementById('vehicleCategory').value,
    incident_severity: document.getElementById('severity').value,
    council_area: document.getElementById('councilArea').value.trim(),
    suburb: document.getElementById('suburb').value.trim(),
    postcode: document.getElementById('postcode').value ? parseInt(document.getElementById('postcode').value) : null,
    car_make: document.getElementById('carMake').value.trim() || null,
    car_model: document.getElementById('carModel').value.trim() || null,
    car_year: document.getElementById('carYear').value ? document.getElementById('carYear').value : null,
    location_name: document.getElementById('locationName').value.trim() || null,
    latitude: document.getElementById('latitude').value ? parseFloat(document.getElementById('latitude').value) : null,
    longitude: document.getElementById('longitude').value ? parseFloat(document.getElementById('longitude').value) : null,
    description: document.getElementById('description').value.trim() || null,
    notes: document.getElementById('notes').value.trim() || null
  };
  
  // Validate required fields
  const requiredFields = [
    { field: 'incident_date', label: 'Incident Date' },
    { field: 'crime_type', label: 'Crime Type' },
    { field: 'vehicle_crime_category', label: 'Vehicle Crime Category' },
    { field: 'incident_severity', label: 'Incident Severity' },
    { field: 'council_area', label: 'Council Area' },
    { field: 'suburb', label: 'Suburb' }
  ];
  
  for (const required of requiredFields) {
    if (!formData[required.field]) {
      errorMessage.textContent = `Please enter the ${required.label.toLowerCase()}.`;
      errorMessage.style.display = 'block';
      return;
    }
  }
  
  // Validate coordinates
  if (formData.latitude && (formData.latitude < -90 || formData.latitude > 90)) {
    errorMessage.textContent = 'Please enter a valid latitude (between -90 and 90).';
    errorMessage.style.display = 'block';
    return;
  }
  
  if (formData.longitude && (formData.longitude < -180 || formData.longitude > 180)) {
    errorMessage.textContent = 'Please enter a valid longitude (between -180 and 180).';
    errorMessage.style.display = 'block';
    return;
  }
  
  // Disable button and show loading
  submitButton.disabled = true;
  submitButton.textContent = 'Submitting report...';
  
  try {
    // Prepare incident data with defaults
    const incidentData = {
      ...formData,
      incident_id: generateIncidentId(),
      location_accuracy: 'user-reported',
      pin_role: 'user',
      source_type: 'User Report',
      evidence_level: 0,
      source_name: 'RoadWatch User',
      source_url: null,
      verification_status: 'Pending',
      last_verified: null
    };
    
    // Insert incident into database
    const { data, error } = await supabase
      .from('roadwatch_incidents')
      .insert([incidentData]);
    
    if (error) {
      throw error;
    }
    
    // Success
    successMessage.textContent = 'Incident reported successfully.';
    successMessage.style.display = 'block';
    
    // Clear form
    document.getElementById('reportForm').reset();
    
    // Re-enable button
    submitButton.disabled = false;
    submitButton.textContent = 'Submit Report';
    
    // Scroll to success message
    successMessage.scrollIntoView({ behavior: 'smooth' });
    
  } catch (error) {
    console.error('Report submission error:', error);
    
    errorMessage.textContent = 'Error submitting incident. Please try again.';
    errorMessage.style.display = 'block';
    
    // Re-enable button
    submitButton.disabled = false;
    submitButton.textContent = 'Submit Report';
  }
}

// Set default date to today
function setDefaultDate() {
  const dateInput = document.getElementById('incidentDate');
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];
  dateInput.value = formattedDate;
  dateInput.max = formattedDate;
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
  setDefaultDate();
  document.getElementById('reportForm').addEventListener('submit', submitIncidentReport);
});
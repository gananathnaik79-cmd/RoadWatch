// RoadWatch Statistics Module

let allStatsIncidents = [];
let statsCharts = {};

// Load statistics
async function loadStatistics() {
  const loadingIndicator = document.getElementById('loadingIndicator');
  const statsContent = document.getElementById('statsContent');
  
  try {
    const { data: incidents, error } = await supabase
      .from('roadwatch_incidents')
      .select('*')
      .order('incident_date', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    allStatsIncidents = incidents || [];
    
    // Hide loading
    loadingIndicator.style.display = 'none';
    statsContent.style.display = 'block';
    
    // Render statistics
    renderSummaryNumbers(allStatsIncidents);
    renderCrimeTypeChart(allStatsIncidents);
    renderSeverityChart(allStatsIncidents);
    renderSuburbChart(allStatsIncidents);
    renderVehicleMakeChart(allStatsIncidents);
    renderTimeChart(allStatsIncidents);
    
  } catch (error) {
    console.error('Statistics load error:', error);
    loadingIndicator.innerHTML = '<p>Error loading statistics. Please try again.</p>';
  }
}

// Render summary numbers
function renderSummaryNumbers(incidents) {
  const summaryContainer = document.getElementById('statsSummary');
  
  const totalIncidents = incidents.length;
  const highSeverity = incidents.filter(i => i.incident_severity === 'High').length;
  const verifiedIncidents = incidents.filter(i => i.verification_status === 'Verified').length;
  const uniqueSuburbs = new Set(incidents.map(i => i.suburb).filter(Boolean)).size;
  
  summaryContainer.innerHTML = `
        <div class="summary-card">
            <h3>Total Incidents</h3>
            <p>${totalIncidents}</p>
        </div>
        <div class="summary-card summary-card-danger">
            <h3>High Severity</h3>
            <p>${highSeverity}</p>
        </div>
        <div class="summary-card summary-card-success">
            <h3>Verified Incidents</h3>
            <p>${verifiedIncidents}</p>
        </div>
        <div class="summary-card summary-card-warning">
            <h3>Suburbs Affected</h3>
            <p>${uniqueSuburbs}</p>
        </div>
    `;
}

// Render crime type chart
function renderCrimeTypeChart(incidents) {
  const ctx = document.getElementById('crimeTypeChart').getContext('2d');
  
  const crimeTypeCounts = {};
  incidents.forEach(incident => {
    const type = incident.crime_type || 'Unknown';
    crimeTypeCounts[type] = (crimeTypeCounts[type] || 0) + 1;
  });
  
  const sortedTypes = Object.entries(crimeTypeCounts)
    .sort((a, b) => b[1] - a[1]);
  
  statsCharts.crimeType = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: sortedTypes.map(item => item[0]),
      datasets: [{
        data: sortedTypes.map(item => item[1]),
        backgroundColor: [
          '#e94560', '#ff6b6b', '#ffa502', '#ffd93d',
          '#6c5ce7', '#a29bfe', '#00b894', '#55efc4',
          '#fd79a8', '#fdcb6e'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// Render severity chart
function renderSeverityChart(incidents) {
  const ctx = document.getElementById('severityChart').getContext('2d');
  
  const severityCounts = {
    'High': 0,
    'Medium': 0,
    'Low': 0
  };
  
  incidents.forEach(incident => {
    const severity = incident.incident_severity;
    if (severity && severityCounts.hasOwnProperty(severity)) {
      severityCounts[severity]++;
    }
  });
  
  statsCharts.severity = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(severityCounts),
      datasets: [{
        label: 'Number of Incidents',
        data: Object.values(severityCounts),
        backgroundColor: ['#f44336', '#ff9800', '#4caf50'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
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

// Render suburb chart
function renderSuburbChart(incidents) {
  const ctx = document.getElementById('suburbChart').getContext('2d');
  
  const suburbCounts = {};
  incidents.forEach(incident => {
    const suburb = incident.suburb || 'Unknown';
    suburbCounts[suburb] = (suburbCounts[suburb] || 0) + 1;
  });
  
  const sortedSuburbs = Object.entries(suburbCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  statsCharts.suburb = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sortedSuburbs.map(item => item[0]),
      datasets: [{
        label: 'Number of Incidents',
        data: sortedSuburbs.map(item => item[1]),
        backgroundColor: '#6c5ce7',
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

// Render vehicle make chart
function renderVehicleMakeChart(incidents) {
  const ctx = document.getElementById('vehicleMakeChart').getContext('2d');
  
  const makeCounts = {};
  incidents.forEach(incident => {
    const make = incident.car_make || 'Unknown';
    makeCounts[make] = (makeCounts[make] || 0) + 1;
  });
  
  const sortedMakes = Object.entries(makeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  statsCharts.vehicleMake = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sortedMakes.map(item => item[0]),
      datasets: [{
        label: 'Number of Incidents',
        data: sortedMakes.map(item => item[1]),
        backgroundColor: '#00b894',
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

// Render time chart
function renderTimeChart(incidents) {
  const ctx = document.getElementById('timeChart').getContext('2d');
  
  // Group incidents by month
  const monthlyCounts = {};
  incidents.forEach(incident => {
    if (incident.incident_date) {
      const date = new Date(incident.incident_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
    }
  });
  
  const sortedMonths = Object.entries(monthlyCounts).sort();
  
  statsCharts.time = new Chart(ctx, {
    type: 'line',
    data: {
      labels: sortedMonths.map(item => item[0]),
      datasets: [{
        label: 'Number of Incidents',
        data: sortedMonths.map(item => item[1]),
        borderColor: '#e94560',
        backgroundColor: 'rgba(233, 69, 96, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
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

// Load statistics on page load
document.addEventListener('DOMContentLoaded', loadStatistics);
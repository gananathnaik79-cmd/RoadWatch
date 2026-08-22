// RoadWatch Dashboard Module

let allIncidents = [];

async function loadDashboard() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    if (!window.supabaseClient) {
        loadingIndicator.innerHTML = '<p>Error: Supabase not initialized. Check config.js.</p>';
        return;
    }
    
    try {
        loadingIndicator.style.display = 'block';
        
        const { data: incidents, error } = await window.supabaseClient
            .from('roadwatch_incidents')
            .select('*')
            .order('incident_date', { ascending: false });
        
        if (error) throw error;
        
        allIncidents = incidents || [];
        
        loadingIndicator.style.display = 'none';
        
        document.getElementById('summaryCards').style.display = 'grid';
        document.getElementById('crimeTypesSection').style.display = 'block';
        document.getElementById('recentIncidentsSection').style.display = 'block';
        
        updateSummaryCards(allIncidents);
        renderCrimeTypesChart(allIncidents);
        renderRecentIncidents(allIncidents.slice(0, 10));
        
    } catch (error) {
        console.error('Dashboard error:', error);
        loadingIndicator.innerHTML = '<p>Error loading dashboard.</p>';
    }
}

function updateSummaryCards(incidents) {
    document.getElementById('totalIncidents').textContent = incidents.length;
    
    const highSeverity = incidents.filter(i =>
        i.incident_severity && i.incident_severity.toLowerCase() === 'high'
    ).length;
    document.getElementById('highSeverity').textContent = highSeverity;
    
    const thefts = incidents.filter(i =>
        i.crime_type && i.crime_type.toLowerCase().includes('theft')
    ).length;
    document.getElementById('vehicleThefts').textContent = thefts;
    
    const suburbs = new Set(incidents.map(i => i.suburb).filter(Boolean));
    document.getElementById('suburbsAffected').textContent = suburbs.size;
}

function renderCrimeTypesChart(incidents) {
    const container = document.getElementById('crimeTypesChart');
    
    const counts = {};
    incidents.forEach(i => {
        const type = i.crime_type || 'Unknown';
        counts[type] = (counts[type] || 0) + 1;
    });
    
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
    
    container.innerHTML = '<canvas id="crimeTypesCanvas"></canvas>';
    const ctx = document.getElementById('crimeTypesCanvas').getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sorted.map(item => item[0]),
            datasets: [{
                label: 'Incidents',
                data: sorted.map(item => item[1]),
                backgroundColor: '#e94560'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    });
}

function renderRecentIncidents(incidents) {
    const container = document.getElementById('recentIncidents');
    
    if (incidents.length === 0) {
        container.innerHTML = '<p>No incidents found.</p>';
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Crime Type</th>
                    <th>Suburb</th>
                    <th>Vehicle</th>
                    <th>Severity</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    incidents.forEach(i => {
        html += `
            <tr>
                <td>${formatDate(i.incident_date)}</td>
                <td>${i.crime_type || 'N/A'}</td>
                <td>${i.suburb || 'N/A'}</td>
                <td>${i.car_make || 'N/A'}</td>
                <td>${i.incident_severity || 'N/A'}</td>
                <td>${i.verification_status || 'N/A'}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' });
}

window.addEventListener('load', loadDashboard);
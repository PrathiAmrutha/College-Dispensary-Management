function loadDashboard() {
    const role = sessionStorage.getItem('userRole') || 'doctor';
    const username = sessionStorage.getItem('username') || 'Doctor';

    document.getElementById('welcomeName').textContent = role === 'doctor' ? `Dr. ${username}` : username;
    document.getElementById('roleBadge').textContent = role === 'doctor' ? 'Doctor' : 'Student';

    let url = '/dashboardData';
    if (role === 'doctor') {
        url += '?doctor=' + encodeURIComponent(username);
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('dashboardSummary').innerHTML = '<p class="msg">Unable to load dashboard right now.</p>';
                return;
            }

            document.getElementById('totalStudents').textContent = data.totalStudents;
            document.getElementById('totalVisits').textContent = data.totalVisits;
            document.getElementById('todayPatients').textContent = data.todayPatients;
            document.getElementById('frequentVisitors').innerHTML = data.frequentVisitors.map(item => `<li>${item.name} (${item.visits} visits)</li>`).join('');
            document.getElementById('commonComplaints').innerHTML = data.commonComplaints.map(item => `<li>${item.symptoms} (${item.count})</li>`).join('');
            document.getElementById('recentRecords').innerHTML = data.recentRecords.map(item => `<li>${item.name} • ${item.symptoms} • ${item.date_visit}</li>`).join('');
        })
        .catch(() => {
            document.getElementById('dashboardSummary').innerHTML = '<p class="msg">Dashboard data unavailable.</p>';
        });
}

window.addEventListener('load', loadDashboard);


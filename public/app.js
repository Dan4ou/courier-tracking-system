async function trackPackage() {
    const trackingNumber = document.getElementById('searchNumber').value.trim();
    if (!trackingNumber) return alert('Моля, въведете номер на пратка!');

    try {
        const response = await fetch(`/api/packages/${trackingNumber}`);
        if (!response.ok) throw new Error('Пратката не е намерена.');
        
        const data = await response.json();
        
        document.getElementById('resSender').innerText = data.package.SenderInfo;
        document.getElementById('resReceiver').innerText = data.package.ReceiverInfo;
        
        const isCompleted = data.package.IsCompleted;
        document.getElementById('resStatus').innerHTML = isCompleted 
            ? '<span class="badge">ДОСТАВЕНА</span>' 
            : '<span class="badge" style="background:#2563eb;">АКТИВНА</span>';

        const timeline = document.getElementById('resTimeline');
        timeline.innerHTML = '';
        
        data.history.forEach((status, index) => {
            const dateStr = new Date(status.EventDateTime).toLocaleString('bg-BG');
            const item = document.createElement('div');
            item.className = `status-item ${index === 0 && isCompleted ? 'status-completed' : ''}`;
            item.innerHTML = `<strong>${status.StatusName}</strong> - ${status.Location}<br><small style="color:#64748b;">${dateStr}</small>`;
            timeline.appendChild(item);
        });

        document.getElementById('trackingResult').style.display = 'block';
    } catch (err) {
        alert(err.message);
    }
}

async function login() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    
    if (user === 'admin' && pass === '123456') {
        document.getElementById('userDisplay').innerText = user;
        switchView('employee');
        
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        
        loadDashboardData();
    } else {
        alert('Невалидни потребителско име или парола!');
    }
}

async function loadDashboardData() {
    try {
        const statsRes = await fetch('/api/stats');
        const stats = await statsRes.json();
        document.getElementById('statTotal').innerText = stats.total;
        document.getElementById('statActive').innerText = stats.active;
        document.getElementById('statCompleted').innerText = stats.completed;

        const pkgsRes = await fetch('/api/packages');
        const packages = await pkgsRes.json();
        
        const tableBody = document.getElementById('recentPackagesTable');
        tableBody.innerHTML = '';
        packages.forEach(p => {
            const sendDate = new Date(p.SendDate).toLocaleDateString('bg-BG');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.Id}</td>
                <td><strong>${p.TrackingNumber}</strong></td>
                <td>${p.ReceiverInfo}</td>
                <td>${sendDate}</td>
            `;
            tableBody.appendChild(tr);
        });
    } catch (err) {
        console.error('Грешка при зареждане на таблото:', err);
    }
}

async function createPackage() {
    const trackingNumber = document.getElementById('trackingNum').value.trim();
    const senderInfo = document.getElementById('sender').value.trim();
    const receiverInfo = document.getElementById('receiver').value.trim();
    const description = document.getElementById('description').value.trim();

    if (!trackingNumber || !senderInfo || !receiverInfo) {
        return alert('Моля, попълнете номер, изпращач и получател!');
    }

    try {
        const response = await fetch('/api/packages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trackingNumber, senderInfo, receiverInfo, description })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Грешка при регистрация!');

        alert('Пратката е регистрирана успешно!');
        document.getElementById('trackingNum').value = '';
        document.getElementById('sender').value = '';
        document.getElementById('receiver').value = '';
        document.getElementById('description').value = '';
        
        loadDashboardData();
    } catch (err) {
        alert(err.message);
    }
}

async function addStatus() {
    const packageId = document.getElementById('statusPackageId').value.trim();
    const statusName = document.getElementById('statusName').value;
    const location = document.getElementById('location').value.trim();
    const eventDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

    if (!packageId || !location) {
        return alert('Моля, въведете ID на пратката и местоположение!');
    }

    try {
        const response = await fetch(`/api/packages/${packageId}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ statusName, location, eventDateTime })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Грешка!');
        
        alert('Статусът бе записан успешно чрез транзакция!');
        document.getElementById('statusPackageId').value = '';
        document.getElementById('location').value = '';
        loadDashboardData();
    } catch (err) {
        alert(err.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('searchNumber').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') trackPackage();
    });

    ['username', 'password'].forEach(id => {
        document.getElementById(id).addEventListener('keypress', (e) => {
            if (e.key === 'Enter') login();
        });
    });

    ['trackingNum', 'sender', 'receiver'].forEach(id => {
        document.getElementById(id).addEventListener('keypress', (e) => {
            if (e.key === 'Enter') createPackage();
        });
    });

    ['statusPackageId', 'location'].forEach(id => {
        document.getElementById(id).addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addStatus();
        });
    });
});
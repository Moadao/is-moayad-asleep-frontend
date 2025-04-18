const statusBox = document.getElementById('statusBox');
const markAsleep = document.getElementById('markAsleep');
const markAwake = document.getElementById('markAwake');
const loginBtn = document.getElementById('loginBtn');
const passwordInput = document.getElementById('passwordInput');
const controls = document.getElementById('controls');
const loginSection = document.getElementById('loginSection');

const API_URL = 'http://localhost:3000';
let ownerPassword = "1312000";

const API_URL = 'https://sleep-status-api.onrender.com';  // Replace with your actual backend URL
const statusBox = document.getElementById('statusBox');

async function updateStatus() {
  const res = await fetch(`${API_URL}/status`);
  const data = await res.json();

  const { status, lastUpdated } = data;

  const lastUpdateDate = new Date(lastUpdated);
  const now = new Date();
  const hoursSinceUpdate = (now - lastUpdateDate) / (1000 * 60 * 60);

  if (hoursSinceUpdate > 24) {
    // If outdated, show "Expired" label
    statusBox.innerHTML = `❓ Status unknown (Expired)<br><span class="text-sm text-gray-500">Last update was more than 24 hours ago (${formatDate(lastUpdated)})</span>`;
    statusBox.className = 'text-xl font-semibold p-4 rounded-xl bg-gray-100 text-gray-700';
  } else {
    // If recent, show awake/asleep status
    if (status === 'asleep') {
      statusBox.innerHTML = `💤 I am asleep<br><span class="text-sm text-gray-500">Updated: ${formatDate(lastUpdated)}</span>`;
      statusBox.className = 'text-xl font-semibold p-4 rounded-xl bg-blue-100 text-blue-700';
    } else {
      statusBox.innerHTML = `☀️ I am awake<br><span class="text-sm text-gray-500">Updated: ${formatDate(lastUpdated)}</span>`;
      statusBox.className = 'text-xl font-semibold p-4 rounded-xl bg-yellow-100 text-yellow-700';
    }
  }
}

function formatDate(isoString) {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = String(date.getFullYear()).slice(-2); // Get last 2 digits of the year

  return `${day}/${month}/${year}`;
}

async function setStatus(status) {
  if (!ownerPassword) return;

  await fetch(`${API_URL}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, password: ownerPassword })
  });

  updateStatus();
}

loginBtn.addEventListener('click', () => {
  const pw = passwordInput.value;
  if (pw === '') return;

  // Test login by sending a harmless status check
  fetch(`${API_URL}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'awake', password: pw })
  }).then(res => {
    if (res.ok) {
      ownerPassword = pw;
      controls.classList.remove('hidden');
      loginSection.classList.add('hidden');
    } else {
      alert('Incorrect password');
    }
    updateStatus();
  });
});

markAsleep.addEventListener('click', () => setStatus('asleep'));
markAwake.addEventListener('click', () => setStatus('awake'));

// Fetch and update status on load
updateStatus();
setInterval(updateStatus, 5000); // auto-refresh

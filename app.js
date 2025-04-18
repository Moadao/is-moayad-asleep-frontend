const statusBox = document.getElementById('statusBox');
const markAsleep = document.getElementById('markAsleep');
const markAwake = document.getElementById('markAwake');
const loginBtn = document.getElementById('loginBtn');
const passwordInput = document.getElementById('passwordInput');
const controls = document.getElementById('controls');
const loginSection = document.getElementById('loginSection');

// Single API_URL declaration - use your deployed backend URL
const API_URL = 'https://is-moayad-asleep.onrender.com';
let ownerPassword = null;

// Doctor image URLs - replace these with your preferred images
const DOCTOR_ASLEEP_IMAGE = "https://cdn-icons-png.flaticon.com/512/3588/3588495.png"; // Sleeping doctor
const DOCTOR_AWAKE_IMAGE = "https://cdn-icons-png.flaticon.com/512/3588/3588658.png";  // Awake doctor
const DOCTOR_UNKNOWN_IMAGE = "https://cdn-icons-png.flaticon.com/512/3588/3588621.png"; // Uncertain doctor

async function updateStatus() {
  try {
    const res = await fetch(`${API_URL}/status`);
    const data = await res.json();

    const { status, lastUpdated } = data;

    const lastUpdateDate = new Date(lastUpdated);
    const now = new Date();
    const hoursSinceUpdate = (now - lastUpdateDate) / (1000 * 60 * 60);

    let doctorImage, statusText, bgColor, textColor;

    if (hoursSinceUpdate > 24) {
      // If outdated, show uncertain doctor
      doctorImage = DOCTOR_UNKNOWN_IMAGE;
      statusText = `Status unknown (Expired)<br><span class="text-sm text-gray-500">Last update was more than 24 hours ago (${formatDate(lastUpdated)})</span>`;
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-700';
    } else {
      // If recent, show awake/asleep doctor
      if (status === 'asleep') {
        doctorImage = DOCTOR_ASLEEP_IMAGE;
        statusText = `I am asleep<br><span class="text-sm text-gray-500">Updated: ${formatDate(lastUpdated)}</span>`;
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-700';
      } else {
        doctorImage = DOCTOR_AWAKE_IMAGE;
        statusText = `I am awake<br><span class="text-sm text-gray-500">Updated: ${formatDate(lastUpdated)}</span>`;
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-700';
      }
    }

    // Update the status box with the doctor image and status text
    statusBox.innerHTML = `
      <div class="flex flex-col items-center">
        <img src="${doctorImage}" alt="Doctor status" class="w-32 h-32 mb-3">
        <div>${statusText}</div>
      </div>
    `;
    statusBox.className = `text-xl font-semibold p-4 rounded-xl ${bgColor} ${textColor}`;
  } catch (error) {
    console.error('Error fetching status:', error);
    statusBox.innerHTML = '⚠️ Error connecting to the server';
    statusBox.className = 'text-xl font-semibold p-4 rounded-xl bg-red-100 text-red-700';
  }
}

function formatDate(isoString) {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = String(date.getFullYear()).slice(-2); // Get last 2 digits of the year
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

async function setStatus(status) {
  if (!ownerPassword) return;

  try {
    const response = await fetch(`${API_URL}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, password: ownerPassword })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update status');
    }
    
    updateStatus();
  } catch (error) {
    console.error('Error updating status:', error);
    alert('Failed to update status: ' + error.message);
  }
}

loginBtn.addEventListener('click', async () => {
  const pw = passwordInput.value;
  if (pw === '') return;

  try {
    // Test login by trying to update with the current status
    // This verifies the password works without changing anything
    const currentStatus = await fetch(`${API_URL}/status`).then(res => res.json());
    
    const response = await fetch(`${API_URL}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: currentStatus.status, password: pw })
    });

    if (response.ok) {
      ownerPassword = pw;
      controls.classList.remove('hidden');
      loginSection.classList.add('hidden');
    } else {
      alert('Incorrect password');
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed: ' + error.message);
  }
  
  updateStatus();
});

markAsleep.addEventListener('click', () => setStatus('asleep'));
markAwake.addEventListener('click', () => setStatus('awake'));

// Fetch and update status on load
updateStatus();
setInterval(updateStatus, 5000); // auto-refresh every 5 seconds
// State management
let skills = [];
let totalUpdates = parseInt(localStorage.getItem('stTotalUpdates')) || 0;
let lastUpdateTimestamp = localStorage.getItem('stLastUpdateTimestamp') || null;

// Load data from LocalStorage if it exists, otherwise use default
const saved = localStorage.getItem('ninaSkills');
if (saved) {
    skills = JSON.parse(saved);
} else {
    skills = [{ id: Date.now(), name: "JavaScript", current: 42, goal: 1000 }];
}

function updateUI() {
    const list = document.getElementById('skillsList');
    const select = document.getElementById('skillSelect');
    
    // Save current state
    localStorage.setItem('ninaSkills', JSON.stringify(skills));

    list.innerHTML = '';
    select.innerHTML = '';

    // If no goals remain, show a helpful message
    if (skills.length === 0) {
        list.innerHTML = `<p style="text-align:center; color:var(--text-dim); margin-top:20px;">No active goals. Create a new one above! 🎯</p>`;
    }

    skills.forEach(skill => {
        const isCompleted = skill.current >= skill.goal;
        const percent = Math.min((skill.current / skill.goal) * 100, 100).toFixed(1);
        const hoursLeft = Math.max(0, skill.goal - skill.current).toFixed(0);
        
        // Update Dropdown (Only show uncompleted goals in log hours dropdown to keep it clean)
        if (!isCompleted) {
            const opt = document.createElement('option');
            opt.value = skill.id;
            opt.textContent = skill.name;
            select.appendChild(opt);
        }

        // Update Skill Cards with dynamic classes and Delete Action Buttons
        list.innerHTML += `
            <div class="skill-card ${isCompleted ? 'completed' : ''}">
                <div class="card-header">
                    <div class="card-header-left">
                        <h3>${skill.name} ${isCompleted ? '✅' : ''}</h3>
                    </div>
                    <div class="card-header-right">
                        <span class="highlight" style="color: ${isCompleted ? 'var(--success)' : 'var(--accent)'}">${percent}%</span>
                        <button class="btn-delete" onclick="deleteSkill(${skill.id})" title="Remove Goal">❌</button>
                    </div>
                </div>
                <div class="progress-container">
                    <div class="progress-fill" style="width: ${percent}%; background: ${isCompleted ? 'var(--success)' : 'linear-gradient(90deg, #38bdf8, #818cf8)'}"></div>
                </div>
                <div class="stats">
                    <span>Logged: <b>${skill.current}h</b></span>
                    <span>Goal: ${skill.goal}h</span>
                    <span>${isCompleted ? '<b style="color:var(--success)">Goal Met!</b>' : `Left: ${hoursLeft}h`}</span>
                </div>
            </div>
        `;
    });

    // If all current goals are completed, fallback message for dropdown selection panel
    if (select.innerHTML === '') {
        const opt = document.createElement('option');
        opt.textContent = "-- All goals finished! --";
        opt.disabled = true;
        select.appendChild(opt);
    }

    renderConsistencyStats();
}

// NEW: Function to remove individual skill tracking cards securely
function deleteSkill(id) {
    if (confirm("Are you sure you want to remove this goal?")) {
        skills = skills.filter(skill => skill.id !== id);
        recordMetricUpdate(); // Count removing/cleaning lists as a dashboard update
        updateUI();
    }
}

// Increments frequency and stores the exact timestamp 
function recordMetricUpdate() {
    totalUpdates++;
    lastUpdateTimestamp = new Date().toISOString();
    
    localStorage.setItem('stTotalUpdates', totalUpdates);
    localStorage.setItem('stLastUpdateTimestamp', lastUpdateTimestamp);
    
    renderConsistencyStats();
}

// Computes human-readable relative time string
function renderConsistencyStats() {
    const updateCountEl = document.getElementById('updateCount');
    if (updateCountEl) updateCountEl.innerText = totalUpdates;
    
    const timeAgoEl = document.getElementById('timeAgo');
    const exactDateEl = document.getElementById('exactDate');

    if (!timeAgoEl || !exactDateEl) return;

    if (!lastUpdateTimestamp) {
        timeAgoEl.innerText = "Never";
        exactDateEl.innerText = "";
        return;
    }

    const lastDate = new Date(lastUpdateTimestamp);
    exactDateEl.innerText = lastDate.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    const now = new Date();
    const diffMs = now - lastDate;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);

    if (diffSec < 60) {
        timeAgoEl.innerText = "Just now";
    } else if (diffMin < 60) {
        timeAgoEl.innerText = `${diffMin}m ago`;
    } else if (diffHr < 24) {
        timeAgoEl.innerText = `${diffHr}h ago`;
    } else {
        timeAgoEl.innerText = `${Math.floor(diffHr / 24)}d ago`;
    }
}

function addSession() {
    const id = document.getElementById('skillSelect').value;
    const hours = parseFloat(document.getElementById('hoursInput').value);
    
    if (!hours || hours <= 0 || !id) return;

    const skill = skills.find(s => s.id == id);
    if (skill) {
        skill.current += hours;
        document.getElementById('hoursInput').value = '';
        recordMetricUpdate();
        updateUI();
    }
}

function addNewSkill() {
    const name = document.getElementById('newSkillName').value;
    const goal = parseFloat(document.getElementById('newSkillGoal').value);

    if (!name || !goal) return;

    skills.push({
        id: Date.now(),
        name: name,
        current: 0,
        goal: goal
    });

    document.getElementById('newSkillName').value = '';
    document.getElementById('newSkillGoal').value = '';
    recordMetricUpdate();
    updateUI();
}

// Automatically update time ago counters strings representation text descriptions contextually every 30 seconds
setInterval(renderConsistencyStats, 30000);

// Initial Render
updateUI();
// State management
let skills = [];

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

    skills.forEach(skill => {
        const percent = Math.min((skill.current / skill.goal) * 100, 100).toFixed(1);
        
        // Update Dropdown
        const opt = document.createElement('option');
        opt.value = skill.id;
        opt.textContent = skill.name;
        select.appendChild(opt);

        // Update Skill Cards
        list.innerHTML += `
            <div class="skill-card">
                <div class="card-header">
                    <h3>${skill.name}</h3>
                    <span class="highlight">${percent}%</span>
                </div>
                <div class="progress-container">
                    <div class="progress-fill" style="width: ${percent}%"></div>
                </div>
                <div class="stats">
                    <span>Logged: <b>${skill.current}h</b></span>
                    <span>Goal: ${skill.goal}h</span>
                    <span>Left: ${(skill.goal - skill.current).toFixed(0)}h</span>
                </div>
            </div>
        `;
    });
}

function addSession() {
    const id = document.getElementById('skillSelect').value;
    const hours = parseFloat(document.getElementById('hoursInput').value);
    
    if (!hours || hours <= 0) return;

    const skill = skills.find(s => s.id == id);
    if (skill) {
        skill.current += hours;
        document.getElementById('hoursInput').value = '';
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
    updateUI();
}

// Initial Render
updateUI();

const MOODS = [
    { id: 'motivated', label: 'Motivated', emoji: '🔥' },
    { id: 'stressed', label: 'Stressed', emoji: '😰' },
    { id: 'tired', label: 'Tired', emoji: '🥱' },
    { id: 'focused', label: 'Focused', emoji: '🎯' },
    { id: 'happy', label: 'Happy', emoji: '😊' }
];

const DEFAULT_SCHEDULES = {
    motivated: [
        { id: 'm1', time: '09:00 AM', task: 'Advanced Calculus', desc: 'Complex problem solving.', completed: false },
        { id: 'm2', time: '11:00 AM', task: 'ML Architecture', desc: 'Neural networks deep dive.', completed: false },
        { id: 'm3', time: '02:00 PM', task: 'Project Sprint', desc: 'Active coding.', completed: false }
    ],
    stressed: [
        { id: 's1', time: '09:00 AM', task: 'Light Review', desc: 'Summarizing previous notes only.', completed: false },
        { id: 's2', time: '10:30 AM', task: 'Meditation & Break', desc: '15 min de-stress session.', completed: false },
        { id: 's3', time: '11:00 AM', task: 'Organization', desc: 'Structure your week, no heavy lifting.', completed: false }
    ],
    tired: [
        { id: 't1', time: '09:00 AM', task: 'Video Lectures', desc: 'Passive learning.', completed: false },
        { id: 't2', time: '10:00 AM', task: 'Short Session', desc: 'Flashcards for 20 mins.', completed: false },
        { id: 't3', time: '11:00 AM', task: 'Power Nap', desc: 'Refresh for the next block.', completed: false }
    ],
    focused: [
        { id: 'f1', time: '09:00 AM', task: 'Thesis Writing', desc: 'Uninterrupted deep work.', completed: false },
        { id: 'f2', time: '12:00 PM', task: 'Algorithm Research', desc: 'Reading academic papers.', completed: false },
        { id: 'f3', time: '03:00 PM', task: 'Peer Review', desc: 'Critical analysis.', completed: false }
    ],
    happy: [
        { id: 'h1', time: '09:00 AM', task: 'Core Subject', desc: 'Standard curriculum progression.', completed: false },
        { id: 'h2', time: '11:00 AM', task: 'Group Study', desc: 'Collaborative learning session.', completed: false },
        { id: 'h3', time: '02:00 PM', task: 'Creative Project', desc: 'Work on personal portfolio.', completed: false }
    ]
};

// Application State
let appState = {
    currentMood: 'happy',
    schedules: JSON.parse(JSON.stringify(DEFAULT_SCHEDULES)) // Deep copy
};

// DOM Elements
const moodSelector = document.getElementById('mood-selector');
const moodIndicator = document.getElementById('user-mood-indicator');
const scheduleContainer = document.getElementById('schedule-container');
const aiStatus = document.getElementById('ai-status');
const focusProgress = document.getElementById('focus-progress');
const knowledgeProgress = document.getElementById('knowledge-progress');
const focusPercentage = document.getElementById('focus-percentage');
const knowledgePercentage = document.getElementById('knowledge-percentage');
const clearBtn = document.getElementById('clear-data-btn');

// Form Elements
const addTaskForm = document.getElementById('add-task-form');
const inputTime = document.getElementById('input-time');
const inputTask = document.getElementById('input-task');
const inputDesc = document.getElementById('input-desc');

/**
 * Initialize App
 */
function init() {
    loadState();
    renderMoodButtons();
    updateApp(appState.currentMood, true);

    // Event Listeners
    addTaskForm.addEventListener('submit', handleAddTask);
    clearBtn.addEventListener('click', clearData);
}

/**
 * Local Storage Management
 */
function loadState() {
    const saved = localStorage.getItem('moodPlannerState');
    if (saved) {
        appState = JSON.parse(saved);
    }
}

function saveState() {
    localStorage.setItem('moodPlannerState', JSON.stringify(appState));
}

function clearData() {
    if(confirm("Are you sure you want to reset all tasks and progress to defaults?")) {
        appState = {
            currentMood: 'happy',
            schedules: JSON.parse(JSON.stringify(DEFAULT_SCHEDULES))
        };
        saveState();
        updateApp('happy', true);
    }
}

/**
 * Render Components
 */
function renderMoodButtons() {
    moodSelector.innerHTML = '';
    MOODS.forEach(mood => {
        const btn = document.createElement('button');
        btn.className = `mood-btn ${appState.currentMood === mood.id ? 'active' : ''}`;
        btn.id = `btn-${mood.id}`;
        btn.innerHTML = `
            <span>${mood.emoji}</span>
            <span>${mood.label}</span>
        `;
        btn.onclick = () => updateApp(mood.id);
        moodSelector.appendChild(btn);
    });
}

/**
 * Main Update Function
 */
function updateApp(moodId, isInit = false) {
    appState.currentMood = moodId;
    saveState();
    const moodData = MOODS.find(m => m.id === moodId);
    
    // Update Buttons
    document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${moodId}`).classList.add('active');

    // Update Header Indicator
    moodIndicator.innerHTML = `<span>${moodData.emoji}</span> Feeling ${moodData.label}`;
    
    if(!isInit) {
        // AI Status Blink Simulation
        aiStatus.textContent = "AI Re-Calculating...";
        aiStatus.style.background = "rgba(255, 159, 67, 0.2)";
        aiStatus.style.borderColor = "rgba(255, 159, 67, 0.4)";
        aiStatus.style.color = "#ffb142";
        
        setTimeout(() => {
            aiStatus.textContent = "Schedule Optimized";
            aiStatus.style.background = "rgba(16, 185, 129, 0.15)";
            aiStatus.style.borderColor = "rgba(16, 185, 129, 0.3)";
            aiStatus.style.color = "var(--success)";
            renderSchedule(moodId);
            updateStats();
        }, 500);
    } else {
        renderSchedule(moodId);
        updateStats();
    }
}

function renderSchedule(moodId) {
    const tasks = appState.schedules[moodId] || [];
    scheduleContainer.innerHTML = '';

    if (tasks.length === 0) {
        scheduleContainer.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No tasks scheduled for this mood. Add one below!</p>`;
        return;
    }

    tasks.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = `schedule-item ${item.completed ? 'completed' : ''}`;
        div.style.animationDelay = `${index * 0.05}s`;
        
        div.innerHTML = `
            <div class="checkbox-wrapper">
                <input type="checkbox" ${item.completed ? 'checked' : ''} onchange="toggleTask('${moodId}', '${item.id}')">
                <div class="checkbox-custom"></div>
            </div>
            <div class="time">${item.time}</div>
            <div class="task-info">
                <h4>${item.task}</h4>
                <p>${item.desc}</p>
            </div>
            <button class="delete-btn" onclick="deleteTask('${moodId}', '${item.id}')" title="Delete Task">✕</button>
        `;
        scheduleContainer.appendChild(div);
    });
}

/**
 * Task Interactions
 */
window.toggleTask = function(moodId, taskId) {
    const tasks = appState.schedules[moodId];
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveState();
        renderSchedule(moodId);
        updateStats();
    }
};

window.deleteTask = function(moodId, taskId) {
    appState.schedules[moodId] = appState.schedules[moodId].filter(t => t.id !== taskId);
    saveState();
    renderSchedule(moodId);
    updateStats();
};

function handleAddTask(e) {
    e.preventDefault();
    const moody = appState.currentMood;
    
    // Check if input times/text exist
    if(!inputTime.value || !inputTask.value) return;

    // Convert time to 12h format simply for visual
    let timeStr = inputTime.value; 
    const [h, m] = timeStr.split(':');
    let hours = parseInt(h);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    const niceTime = `${hours.toString().padStart(2, '0')}:${m} ${ampm}`;

    const newTask = {
        id: `u-${Date.now()}`,
        time: niceTime,
        task: inputTask.value,
        desc: inputDesc.value || 'No description provided.',
        completed: false
    };

    if(!appState.schedules[moody]) {
        appState.schedules[moody] = [];
    }

    appState.schedules[moody].push(newTask);
    
    // Sort tasks by time technically? For simplicity, we just append.
    
    saveState();
    renderSchedule(moody);
    updateStats();
    
    addTaskForm.reset();
}

/**
 * Real Stats Calculation
 */
function updateStats() {
    const tasks = appState.schedules[appState.currentMood] || [];
    
    if (tasks.length === 0) {
        setBars(0, 0);
        return;
    }

    const completedTasks = tasks.filter(t => t.completed).length;
    const percentage = Math.round((completedTasks / tasks.length) * 100);
    
    // Focus score directly maps to exact tasks of current mood
    // Knowledge maps globally relative to all completed tasks
    
    let totalAll = 0;
    let completedAll = 0;
    Object.values(appState.schedules).forEach(list => {
        totalAll += list.length;
        completedAll += list.filter(t => t.completed).length;
    });

    const globalPercentage = totalAll === 0 ? 0 : Math.round((completedAll / totalAll) * 100);

    setBars(percentage, globalPercentage);
}

function setBars(focus, knowledge) {
    focusProgress.style.width = `${focus}%`;
    focusPercentage.textContent = `${focus}%`;
    
    knowledgeProgress.style.width = `${knowledge}%`;
    knowledgePercentage.textContent = `${knowledge}%`;
}

// Start
init();

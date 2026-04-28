/**
 * Syncora Mood-Adaptive Study Planner
 * Core Application Logic - Robust Debug Version
 */

const MOODS = [
    { id: 'motivated', label: 'Motivated', emoji: '🔥' },
    { id: 'stressed', label: 'Stressed', emoji: '😰' },
    { id: 'tired', label: 'Tired', emoji: '🥱' },
    { id: 'focused', label: 'Focused', emoji: '🎯' },
    { id: 'happy', label: 'Happy', emoji: '😊' }
];

const TIMER_CONFIGS = {
    motivated: { focus: 50, break: 10, label: 'Deep Work (50/10)' },
    focused: { focus: 45, break: 5, label: 'Standard Deep (45/5)' },
    happy: { focus: 25, break: 5, label: 'Standard (25/5)' },
    stressed: { focus: 15, break: 5, label: 'Micro-Sprint (15/5)' },
    tired: { focus: 10, break: 10, label: 'Gentle (10/10)' }
};

const AMBIENCE_TRACKS = {
    motivated: { name: 'Cinematic Focus', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    focused: { name: 'Deep Binaural', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    happy: { name: 'Lofi Vibes', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    stressed: { name: 'Soft Rain', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    tired: { name: 'Brown Noise', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' }
};

const BUDDY_MESSAGES = {
    motivated: "Your energy is high! This is the perfect time for 'Deep Work'. Tackle your hardest calculus or coding problems now.",
    focused: "You're in the zone. I suggest the Pomodoro 45/5 technique to maintain this flow state for hours.",
    happy: "Great vibe! Why not try a group study session or a creative review of your notes? Learning is better when you're positive.",
    stressed: "Take a breath. I've simplified your schedule. Focus on just one light task, then take a longer break. You've got this.",
    tired: "Low energy detected. Let's stick to passive learning—watch videos or use flashcards. Don't push too hard."
};

// Global State
let appState = {
    currentMood: 'happy',
    subjects: [],
    schedules: {},
    history: {},
    syllabi: {}, // { subject: [ { title, hardness, completed } ] }
    examMode: {
        active: false,
        date: null
    },
    isLoggedIn: false
};

let timerState = {
    minutes: 25,
    seconds: 0,
    isActive: false,
    isBreak: false,
    interval: null
};

let currentAudio = null;

/**
 * Robust Initialization
 */
function init() {
    console.log("Syncora: Initializing components...");
    const bootStatus = document.getElementById('boot-status');
    
    try {
        loadState();
        
        // Login Logic
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
            if (!appState.isLoggedIn) {
                loginModal.classList.remove('hidden');
            } else {
                loginModal.classList.add('hidden');
            }
        }

        // Setup Wizard logic
        const setupWizard = document.getElementById('setup-wizard');
        if (setupWizard) {
            if (appState.isLoggedIn && (!appState.subjects || appState.subjects.length === 0)) {
                setupWizard.classList.remove('hidden');
            } else {
                setupWizard.classList.add('hidden');
            }
        }

        renderMoodButtons();
        renderHeatmap();
        detectTimeBasedMood();
        checkForQuickWin();
        updateApp(appState.currentMood, true);

        attachEventListeners();

        if (bootStatus) bootStatus.textContent = "System Ready";
        console.log("Syncora: System Ready");

    } catch (error) {
        console.error("Syncora: Critical Initialization Error", error);
        if (bootStatus) bootStatus.textContent = "System Error - Check Console";
    }
}

/**
 * Event Listeners
 */
function attachEventListeners() {
    const clearBtn = document.getElementById('clear-data-btn');
    const addTaskForm = document.getElementById('add-task-form');
    const vibeTextInput = document.getElementById('vibe-text-input');
    const syncHealthBtn = document.getElementById('sync-health-btn');
    const mobileAddBtn = document.getElementById('mobile-add-btn');
    const closeFormBtn = document.getElementById('close-form-btn');
    const taskFormOverlay = document.getElementById('task-form-overlay');
    const timerStart = document.getElementById('timer-start');
    const timerPause = document.getElementById('timer-pause');
    const timerReset = document.getElementById('timer-reset');
    const ambienceToggle = document.getElementById('ambience-toggle');
    const ambienceVolume = document.getElementById('ambience-volume');
    const loginForm = document.getElementById('login-form');

    if (loginForm) loginForm.onsubmit = handleLogin;
    if (clearBtn) clearBtn.onclick = clearData;
    if (addTaskForm) addTaskForm.onsubmit = handleAddTask;
    
    if (vibeTextInput) {
        vibeTextInput.onkeypress = (e) => {
            if (e.key === 'Enter') analyzeVibe(e.target.value);
        };
    }

    if (syncHealthBtn) syncHealthBtn.onclick = simulateHealthSync;

    if (mobileAddBtn && taskFormOverlay) {
        mobileAddBtn.onclick = () => taskFormOverlay.classList.add('active');
    }

    if (closeFormBtn && taskFormOverlay) {
        closeFormBtn.onclick = () => taskFormOverlay.classList.remove('active');
    }

    if (taskFormOverlay) {
        taskFormOverlay.onclick = (e) => {
            if (e.target === taskFormOverlay) taskFormOverlay.classList.remove('active');
        };
    }

    if (timerStart) timerStart.onclick = startTimer;
    if (timerPause) timerPause.onclick = pauseTimer;
    if (timerReset) timerReset.onclick = resetTimer;

    // Ask Me Listeners
    const askDoubtBtn = document.getElementById('ask-doubt-btn');
    const doubtInputContainer = document.getElementById('doubt-input-container');
    const sendDoubtBtn = document.getElementById('send-doubt-btn');
    const doubtInput = document.getElementById('doubt-input');

    if (askDoubtBtn && doubtInputContainer) {
        askDoubtBtn.onclick = () => {
            doubtInputContainer.classList.toggle('hidden');
            if (!doubtInputContainer.classList.contains('hidden')) {
                doubtInput.focus();
            }
        };
    }

    if (sendDoubtBtn) sendDoubtBtn.onclick = handleDoubt;
    if (doubtInput) {
        doubtInput.onkeypress = (e) => {
            if (e.key === 'Enter') handleDoubt();
        };
    }

    if (ambienceToggle) ambienceToggle.onclick = toggleAmbience;

    // Syllabus & Exam Listeners
    const openSyllabusBtn = document.getElementById('open-syllabus-btn');
    const closeSyllabusBtn = document.getElementById('close-syllabus-btn');
    const syllabusModal = document.getElementById('syllabus-modal');
    const analyzeBtn = document.getElementById('analyze-syllabus-btn');
    const examToggle = document.getElementById('exam-mode-checkbox');
    const subjectSelect = document.getElementById('syllabus-subject-select');

    if (openSyllabusBtn) {
        openSyllabusBtn.onclick = () => {
            populateSubjectSelect();
            syllabusModal.classList.remove('hidden');
        };
    }

    if (closeSyllabusBtn) {
        closeSyllabusBtn.onclick = () => syllabusModal.classList.add('hidden');
    }

    if (analyzeBtn) analyzeBtn.onclick = handleSyllabusAnalysis;

    const addSubjectSidebarBtn = document.getElementById('add-subject-sidebar-btn');
    if (addSubjectSidebarBtn) {
        addSubjectSidebarBtn.onclick = () => {
            const name = prompt("Enter the name of the new subject:");
            if (name && name.trim()) {
                const subject = name.trim();
                if (!appState.subjects.includes(subject)) {
                    appState.subjects.push(subject);
                    saveState();
                    generateDynamicSchedules(appState.subjects);
                    updateApp(appState.currentMood, true);
                    alert(`'${subject}' added successfully!`);
                } else {
                    alert("Subject already exists!");
                }
            }
        };
    }

    if (examToggle) {
        examToggle.onchange = (e) => {
            appState.examMode.active = e.target.checked;
            document.getElementById('exam-date-group').classList.toggle('hidden', !e.target.checked);
            if (e.target.checked) {
                document.getElementById('modal-title').textContent = "Exam Preparation Mode";
                document.getElementById('modal-desc').textContent = "Set your exam date and confirm your syllabus to create a countdown-based study plan.";
                syllabusModal.classList.remove('hidden');
            }
            saveState();
            generateDynamicSchedules(appState.subjects);
            updateApp(appState.currentMood, true);
        };
    }
    if (ambienceVolume) {
        ambienceVolume.oninput = (e) => {
            if (currentAudio) currentAudio.volume = e.target.value;
        };
    }

    // Refresh every minute
    setInterval(() => renderSchedule(appState.currentMood), 60000);
}

/**
 * Data Persistence
 */
function loadState() {
    try {
        const saved = localStorage.getItem('moodPlannerState');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Deep merge defaults with saved data
            appState = { ...appState, ...parsed };
            console.log("Syncora: State loaded from storage");
        }
    } catch (e) {
        console.warn("Syncora: Failed to load state", e);
    }
}

function saveState() {
    try {
        localStorage.setItem('moodPlannerState', JSON.stringify(appState));
    } catch (e) {
        console.error("Syncora: Failed to save state", e);
    }
}

function clearData() {
    if (confirm("Reset everything? This cannot be undone.")) {
        forceReset();
    }
}

window.forceReset = function() {
    localStorage.removeItem('moodPlannerState');
    location.reload();
};

window.logout = function() {
    appState.isLoggedIn = false;
    saveState();
    location.reload();
};

/**
 * Login Logic
 */
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    const loginModal = document.getElementById('login-modal');
    const setupWizard = document.getElementById('setup-wizard');

    // Specified Credentials: user@gmail.com / user1234
    if (email === 'user@gmail.com' && password === 'user1234') {
        appState.isLoggedIn = true;
        saveState();
        
        if (loginModal) loginModal.classList.add('hidden');
        
        // Show wizard if no subjects yet
        if (!appState.subjects || appState.subjects.length === 0) {
            if (setupWizard) setupWizard.classList.remove('hidden');
        }
        
        if (errorEl) errorEl.style.display = 'none';
        console.log("Syncora: Login Successful");
    } else {
        if (errorEl) errorEl.style.display = 'block';
        console.warn("Syncora: Login Failed - Invalid Credentials");
    }
}

/**
 * Setup Wizard
 */
window.finishSetup = function() {
    const subjectsEl = document.getElementById('setup-subjects');
    const startBtn = document.getElementById('start-journey-btn');
    const wizard = document.getElementById('setup-wizard');

    if (!subjectsEl || !startBtn) return;

    const text = subjectsEl.value.trim();
    if (!text) {
        alert("Please enter at least one subject!");
        return;
    }

    startBtn.textContent = "Optimizing Plan...";
    startBtn.disabled = true;

    setTimeout(() => {
        try {
            const subjects = text.split('\n').map(s => s.trim()).filter(s => s.length > 0);
            appState.subjects = subjects;
            appState.currentMood = 'happy';
            
            generateDynamicSchedules(subjects);
            saveState();
            
            if (wizard) wizard.classList.add('hidden');
            
            renderMoodButtons();
            updateApp('happy', true);
            
            console.log("Syncora: Setup Complete");
        } catch (err) {
            console.error("Syncora: Setup Error", err);
            alert("Oops! Plan generation failed. Please refresh and try again.");
            startBtn.textContent = "Generate My Plan";
            startBtn.disabled = false;
        }
    }, 800);
};

function generateDynamicSchedules(subjects) {
    const moods = ['motivated', 'stressed', 'tired', 'focused', 'happy'];
    const times = {
        motivated: ['09:00', '11:00', '14:00'],
        focused: ['09:00', '13:00', '16:00'],
        happy: ['10:00', '14:00', '16:00'],
        stressed: ['10:00', '15:00'],
        tired: ['11:00', '19:00']
    };

    appState.schedules = {};

    // Exam Mode Calculations
    let chaptersPerDay = 0;
    if (appState.examMode.active && appState.examMode.date) {
        const today = new Date();
        const examDate = new Date(appState.examMode.date);
        const daysLeft = Math.max(1, Math.ceil((examDate - today) / (1000 * 60 * 60 * 24)));
        
        let totalRemainingChapters = 0;
        Object.values(appState.syllabi).forEach(chapters => {
            totalRemainingChapters += chapters.filter(c => !c.completed).length;
        });
        
        chaptersPerDay = Math.ceil(totalRemainingChapters / daysLeft);
        console.log(`Exam Mode: ${daysLeft} days left. Chapters/day: ${chaptersPerDay}`);
    }

    moods.forEach(mood => {
        appState.schedules[mood] = [];
        const moodTimes = times[mood];
        
        moodTimes.forEach((time, index) => {
            const subject = subjects[index % subjects.length];
            const syllabus = appState.syllabi[subject] || [];
            
            // Try to find a real chapter from the syllabus
            let chapter = null;
            if (syllabus.length > 0) {
                // If in exam mode, prioritize incomplete hard chapters for motivated/focused
                if (appState.examMode.active) {
                    const priority = (mood === 'motivated' || mood === 'focused') ? 'hard' : 'easy';
                    chapter = syllabus.find(c => !c.completed && c.hardness === priority) || syllabus.find(c => !c.completed);
                } else {
                    chapter = syllabus[index % syllabus.length];
                }
            }

            let task = "";
            let desc = "";
            const taskLabel = chapter ? `Chapter: ${chapter.title}` : subject;

            switch(mood) {
                case 'motivated': 
                    task = `Hard ${taskLabel} Session`; 
                    desc = chapter ? `Deep dive into the complexity of ${chapter.title}.` : "Solve complex problems and advance mastery."; 
                    break;
                case 'focused': 
                    task = `Deep Dive: ${taskLabel}`; 
                    desc = "Uninterrupted focus session. High output expected."; 
                    break;
                case 'stressed': 
                    task = `Light ${taskLabel} Review`; 
                    desc = "Just read the summary or look at diagrams."; 
                    break;
                case 'tired': 
                    task = `${taskLabel} Video/Podcast`; 
                    desc = "Passive learning while you recover energy."; 
                    break;
                case 'happy': 
                    task = `${taskLabel} Exploration`; 
                    desc = "Creative work or collaborative learning."; 
                    break;
            }

            appState.schedules[mood].push({
                id: `d-${mood}-${index}-${Date.now()}`,
                time: time,
                task: task,
                desc: desc,
                completed: false,
                chapterId: chapter ? chapter.title : null // Track for completion sync
            });
        });
    });
}

function populateSubjectSelect() {
    const select = document.getElementById('syllabus-subject-select');
    if (!select) return;
    select.innerHTML = appState.subjects.map(s => `<option value="${s}">${s}</option>`).join('');
}

function handleSyllabusAnalysis() {
    const subject = document.getElementById('syllabus-subject-select').value;
    const text = document.getElementById('syllabus-text-input').value.trim();
    const examDate = document.getElementById('exam-date-input').value;

    if (!text) {
        alert("Please paste some syllabus content first!");
        return;
    }

    if (appState.examMode.active && !examDate) {
        alert("Please select your Exam Date!");
        return;
    }

    if (examDate) appState.examMode.date = examDate;

    // AI Analysis Simulation
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);
    const hardKeywords = ['principle', 'quantum', 'analysis', 'theory', 'mechanics', 'derivation', 'advanced', 'complex', 'calculus'];
    const easyKeywords = ['intro', 'history', 'summary', 'basics', 'overview', 'simple', 'definition'];

    const chapters = lines.map(line => {
        let hardness = 'medium';
        const lower = line.toLowerCase();
        if (hardKeywords.some(k => lower.includes(k))) hardness = 'hard';
        else if (easyKeywords.some(k => lower.includes(k))) hardness = 'easy';

        return {
            title: line.replace(/chapter\s*\d*[:.-]?/i, '').trim(),
            hardness: hardness,
            completed: false
        };
    });

    appState.syllabi[subject] = chapters;
    saveState();
    
    alert(`AI Analysis Complete: Found ${chapters.length} chapters for ${subject}. Your schedule has been updated with real chapters!`);
    
    document.getElementById('syllabus-modal').classList.add('hidden');
    generateDynamicSchedules(appState.subjects);
    updateApp(appState.currentMood, true);
}

/**
 * UI Rendering
 */
function renderMoodButtons() {
    const selector = document.getElementById('mood-selector');
    if (!selector) return;

    selector.innerHTML = '';
    MOODS.forEach(mood => {
        const btn = document.createElement('button');
        btn.className = `mood-btn ${appState.currentMood === mood.id ? 'active' : ''}`;
        btn.id = `btn-${mood.id}`;
        btn.innerHTML = `<span>${mood.emoji}</span><span>${mood.label}</span>`;
        btn.onclick = () => updateApp(mood.id);
        selector.appendChild(btn);
    });
}

function updateApp(moodId, isInit = false) {
    const moodData = MOODS.find(m => m.id === moodId);
    if (!moodData) return;

    appState.currentMood = moodId;
    saveState();
    
    // Update Active Buttons
    document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`btn-${moodId}`);
    if (activeBtn) activeBtn.classList.add('active');

    // Update Header Indicator
    const indicator = document.getElementById('user-mood-indicator');
    if (indicator) indicator.innerHTML = `<span>${moodData.emoji}</span> Feeling ${moodData.label}`;
    
    const aiStatus = document.getElementById('ai-status');
    if (!isInit && aiStatus) {
        aiStatus.textContent = "AI Re-Calculating...";
        setTimeout(() => {
            aiStatus.textContent = "Schedule Optimized";
            renderSchedule(moodId);
            updateStats();
            updateTimerConfig();
            updateBuddy();
            syncAmbience();
        }, 500);
    } else {
        renderSchedule(moodId);
        updateStats();
        updateTimerConfig();
        updateBuddy();
        syncAmbience();
    }
}

function renderSchedule(moodId) {
    const container = document.getElementById('schedule-container');
    if (!container) return;

    const tasks = appState.schedules[moodId] || [];
    container.innerHTML = '';

    if (tasks.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No tasks scheduled. Add one below!</p>`;
        return;
    }

    tasks.forEach((item, index) => {
        const isActive = isTaskActive(item.time);
        const div = document.createElement('div');
        div.className = `schedule-item ${item.completed ? 'completed' : ''} ${isActive ? 'active-now' : ''}`;
        
        div.innerHTML = `
            <div class="checkbox-wrapper">
                <input type="checkbox" ${item.completed ? 'checked' : ''} onchange="toggleTask('${moodId}', '${item.id}')">
                <div class="checkbox-custom"></div>
            </div>
            <div class="time">${formatTime(item.time)} ${isActive ? '<span class="now-badge">NOW</span>' : ''}</div>
            <div class="task-info">
                <h4>${item.task}</h4>
                <p>${parseLinks(item.desc)}</p>
            </div>
            <button class="delete-btn" onclick="deleteTask('${moodId}', '${item.id}')">✕</button>
        `;
        container.appendChild(div);
    });
}

/**
 * Logic Helpers
 */
function isTaskActive(taskTime) {
    if (taskTime === 'ASAP') return true;
    if (!taskTime.includes(':')) return false;

    const now = new Date();
    const [h, m] = taskTime.split(':');
    const taskDate = new Date();
    taskDate.setHours(parseInt(h), parseInt(m), 0);
    
    const diff = (now - taskDate) / (1000 * 60); 
    return diff >= 0 && diff < 60;
}

function formatTime(time24) {
    if (time24 === 'ASAP') return 'ASAP';
    if (!time24.includes(':')) return time24;
    const [h, m] = time24.split(':');
    let hours = parseInt(h);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours.toString().padStart(2, '0')}:${m} ${ampm}`;
}

function parseLinks(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => `<a href="${url}" target="_blank" class="task-link">${url}</a>`);
}

/**
 * Task Management
 */
window.toggleTask = function(moodId, taskId) {
    const tasks = appState.schedules[moodId];
    if (!tasks) return;
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        updateHistory(task.completed);
        saveState();
        renderSchedule(moodId);
        updateStats();
        renderHeatmap();
    }
};

window.deleteTask = function(moodId, taskId) {
    if (!appState.schedules[moodId]) return;
    appState.schedules[moodId] = appState.schedules[moodId].filter(t => t.id !== taskId);
    saveState();
    renderSchedule(moodId);
    updateStats();
};

function handleAddTask(e) {
    e.preventDefault();
    const moodId = appState.currentMood;
    const timeEl = document.getElementById('input-time');
    const taskEl = document.getElementById('input-task');
    const descEl = document.getElementById('input-desc');

    if (!timeEl.value || !taskEl.value) return;

    const newTask = {
        id: `u-${Date.now()}`,
        time: timeEl.value,
        task: taskEl.value,
        desc: descEl.value || 'No description provided.',
        completed: false
    };

    if (!appState.schedules[moodId]) appState.schedules[moodId] = [];
    appState.schedules[moodId].push(newTask);
    appState.schedules[moodId].sort((a, b) => a.time.localeCompare(b.time));
    
    saveState();
    renderSchedule(moodId);
    updateStats();
    
    e.target.reset();
    const overlay = document.getElementById('task-form-overlay');
    if (overlay) overlay.classList.remove('active');
}

/**
 * Stats & Analytics
 */
function updateHistory(isCompleted) {
    const today = new Date().toISOString().split('T')[0];
    if (!appState.history) appState.history = {};
    if (isCompleted) {
        appState.history[today] = (appState.history[today] || 0) + 1;
    } else {
        appState.history[today] = Math.max(0, (appState.history[today] || 1) - 1);
    }
}

function updateStats() {
    const tasks = appState.schedules[appState.currentMood] || [];
    const completedTasks = tasks.filter(t => t.completed).length;
    const percentage = tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100);
    
    let totalAll = 0, completedAll = 0;
    Object.values(appState.schedules).forEach(list => {
        totalAll += list.length;
        completedAll += list.filter(t => t.completed).length;
    });
    const globalPercentage = totalAll === 0 ? 0 : Math.round((completedAll / totalAll) * 100);

    const focusBar = document.getElementById('focus-progress');
    const focusLabel = document.getElementById('focus-percentage');
    const knowBar = document.getElementById('knowledge-progress');
    const knowLabel = document.getElementById('knowledge-percentage');

    if (focusBar) focusBar.style.width = `${percentage}%`;
    if (focusLabel) focusLabel.textContent = `${percentage}%`;
    if (knowBar) knowBar.style.width = `${globalPercentage}%`;
    if (knowLabel) knowLabel.textContent = `${globalPercentage}%`;

    calculateStreak();
}

function calculateStreak() {
    const el = document.getElementById('streak-count');
    if (!el || !appState.history) return;
    
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dStr = d.toISOString().split('T')[0];
        if (appState.history[dStr] && appState.history[dStr] > 0) streak++;
        else if (i > 0) break;
    }
    el.textContent = streak;
}

function renderHeatmap() {
    const container = document.getElementById('knowledge-heatmap');
    if (!container) return;
    container.innerHTML = '';
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const count = appState.history ? (appState.history[dateStr] || 0) : 0;
        const level = count > 4 ? 4 : count;
        const day = document.createElement('div');
        day.className = `heatmap-day ${level > 0 ? 'level-' + level : ''}`;
        day.title = `${dateStr}: ${count} tasks completed`;
        container.appendChild(day);
    }
}

/**
 * AI & Special Features
 */
function updateBuddy() {
    const el = document.getElementById('ai-buddy-message');
    if (el) el.textContent = BUDDY_MESSAGES[appState.currentMood];
}

function analyzeVibe(text) {
    const input = text.toLowerCase();
    const mappings = {
        motivated: ['crush', 'ready', 'kill', 'power', 'excited', 'grind', 'fire'],
        stressed: ['overwhelmed', 'deadline', 'anxious', 'worried', 'panic'],
        tired: ['sleepy', 'exhausted', 'drain', 'coffee', 'rest', 'bed'],
        focused: ['zone', 'deep', 'quiet', 'concentrate', 'finish'],
        happy: ['good', 'great', 'fine', 'yay', 'fun']
    };
    for (const [mood, keywords] of Object.entries(mappings)) {
        if (keywords.some(k => input.includes(k))) {
            updateApp(mood);
            return;
        }
    }
}

function handleDoubt() {
    const inputEl = document.getElementById('doubt-input');
    const buddyMsg = document.getElementById('ai-buddy-message');
    if (!inputEl || !inputEl.value.trim() || !buddyMsg) return;

    const query = inputEl.value.toLowerCase();
    inputEl.value = '';

    // Simulate AI Thinking
    buddyMsg.textContent = "Syncora AI is analyzing your sentiment and schedule...";
    
    setTimeout(() => {
        // 1. Check for Mood Intent (Auto-Switch)
        const moodMappings = {
            tired: ['tired', 'sleepy', 'exhausted', 'drain', 'low energy', 'rest'],
            stressed: ['stressed', 'anxious', 'overwhelmed', 'too much', 'panic'],
            motivated: ['ready', 'motivated', 'power', 'crush', 'grind'],
            focused: ['focus', 'concentrate', 'zone', 'deep'],
            happy: ['happy', 'good', 'great', 'fine']
        };

        let autoSwitched = false;
        for (const [mood, keywords] of Object.entries(moodMappings)) {
            if (keywords.some(k => query.includes(k))) {
                updateApp(mood);
                buddyMsg.textContent = `Syncora Advisor: I detected you're feeling ${mood}. I've automatically recalculated your schedule for '${mood}' mode. Let's adjust our goals accordingly.`;
                autoSwitched = true;
                break;
            }
        }

        if (autoSwitched) return;

        // 2. Otherwise, give guidance
        const tasks = appState.schedules[appState.currentMood] || [];
        const firstIncomplete = tasks.find(t => !t.completed);
        const moodData = MOODS.find(m => m.id === appState.currentMood);

        if (query.includes('start') || query.includes('what') || query.includes('where')) {
            if (firstIncomplete) {
                buddyMsg.textContent = `Syncora Advisor: Right now, I recommend starting with '${firstIncomplete.task}'. In your current ${moodData.label} state, this will give you the best momentum.`;
            } else {
                buddyMsg.textContent = "Syncora Advisor: You've finished your current plan! Why not take a 15-minute break or add a creative exploration task?";
            }
        } else {
            // Generic but smarter fallback
            const subjectsStr = appState.subjects.join(', ');
            buddyMsg.textContent = `Syncora Advisor: I see you're thinking about your ${subjectsStr} studies. Given it's ${new Date().getHours()}:00, staying in ${moodData.label} mode is my best recommendation. Try focusing on the '${firstIncomplete ? firstIncomplete.task : 'next available goal'}'.`;
        }
    }, 800);
}

function detectTimeBasedMood() {
    const hour = new Date().getHours();
    if (hour >= 23 || hour <= 5) updateApp('tired');
}

function simulateHealthSync() {
    const btn = document.getElementById('sync-health-btn');
    const stats = document.getElementById('health-stats');
    if (!btn || !stats) return;
    btn.textContent = "Connecting...";
    setTimeout(() => {
        const sleep = Math.floor(Math.random() * 40) + 50;
        document.getElementById('sleep-score').textContent = `${sleep}%`;
        document.getElementById('recovery-score').textContent = `${Math.floor(Math.random() * 40) + 50}%`;
        stats.classList.remove('hidden');
        btn.textContent = "Sync Complete";
        if (sleep < 65) updateApp('tired');
    }, 1500);
}

function checkForQuickWin() {
    const today = new Date().toISOString().split('T')[0];
    if (!appState.history[today] || appState.history[today] === 0) {
        Object.keys(appState.schedules).forEach(m => {
            if (appState.schedules[m].length > 0 && !appState.schedules[m][0].task.includes("Quick Win")) {
                appState.schedules[m].unshift({
                    id: `qw-${Date.now()}`,
                    time: 'ASAP',
                    task: "⭐ Quick Win: 5-min Review",
                    desc: "An easy task to boost confidence.",
                    completed: false
                });
            }
        });
    }
}

/**
 * Timer & Ambience
 */
function updateTimerConfig() {
    const config = TIMER_CONFIGS[appState.currentMood];
    const desc = document.getElementById('timer-mode-desc');
    if (desc) desc.textContent = `Mode: ${config.label}`;
    if (!timerState.isActive) {
        timerState.minutes = config.focus;
        timerState.seconds = 0;
        updateTimerDisplay();
    }
}

function updateTimerDisplay() {
    const min = document.getElementById('timer-minutes');
    const sec = document.getElementById('timer-seconds');
    const type = document.getElementById('timer-type');
    if (min) min.textContent = timerState.minutes.toString().padStart(2, '0');
    if (sec) sec.textContent = timerState.seconds.toString().padStart(2, '0');
    if (type) {
        type.textContent = timerState.isBreak ? 'Break Time' : 'Focus Time';
        type.style.color = timerState.isBreak ? 'var(--success)' : 'var(--accent-secondary)';
    }
}

function startTimer() {
    if (timerState.isActive) return;
    timerState.isActive = true;
    timerState.interval = setInterval(() => {
        if (timerState.seconds === 0) {
            if (timerState.minutes === 0) {
                switchTimerMode();
                return;
            }
            timerState.minutes--;
            timerState.seconds = 59;
        } else {
            timerState.seconds--;
        }
        updateTimerDisplay();
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerState.interval);
    timerState.isActive = false;
}

function resetTimer() {
    pauseTimer();
    const config = TIMER_CONFIGS[appState.currentMood];
    timerState.isBreak = false;
    timerState.minutes = config.focus;
    timerState.seconds = 0;
    updateTimerDisplay();
}

function switchTimerMode() {
    timerState.isBreak = !timerState.isBreak;
    const config = TIMER_CONFIGS[appState.currentMood];
    timerState.minutes = timerState.isBreak ? config.break : config.focus;
    timerState.seconds = 0;
    alert(timerState.isBreak ? "Break Time!" : "Back to Work!");
    updateTimerDisplay();
}

function toggleAmbience() {
    if (currentAudio && !currentAudio.paused) {
        currentAudio.pause();
        document.getElementById('ambience-toggle').textContent = "Play Atmosphere";
    } else {
        playTrack();
    }
}

function playTrack() {
    if (currentAudio) currentAudio.pause();
    const track = AMBIENCE_TRACKS[appState.currentMood];
    currentAudio = new Audio(track.url);
    currentAudio.loop = true;
    currentAudio.volume = document.getElementById('ambience-volume').value;
    currentAudio.play();
    document.getElementById('ambience-toggle').textContent = "Stop Atmosphere";
    document.getElementById('ambience-track-name').textContent = `Playing: ${track.name}`;
}

function syncAmbience() {
    if (currentAudio && !currentAudio.paused) playTrack();
    else {
        const name = document.getElementById('ambience-track-name');
        if (name) name.textContent = `Ready: ${AMBIENCE_TRACKS[appState.currentMood].name}`;
    }
}

// Global initialization
document.addEventListener('DOMContentLoaded', init);

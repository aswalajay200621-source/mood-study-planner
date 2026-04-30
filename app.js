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

const ALLOWED_USERS = ["anne@gmail.com", "abijith@gmail.com", "adwaith@gmail.com", "rizwan@gmail.com"];

const OPENAI_API_KEY = "REPLACE_WITH_YOUR_KEY"; // Removed for security during push

const SLOGANS = [
    "Believe in yourself and all that you are.", "Every day is a new beginning.", "Your only limit is you.",
    "Focus on the goal, not the obstacle.", "Success starts with self-discipline.", "Be the change you wish to see in the world.",
    "Dream big, work hard, stay focused.", "Great things never come from comfort zones.", "Don't stop until you're proud.",
    "Every accomplishment starts with the decision to try.", "Stay positive, work hard, make it happen.", "Success is a journey, not a destination.",
    "Your hard work will pay off.", "Keep going, you're getting there.", "Small steps lead to big changes.",
    "Confidence is the key to success.", "Challenge yourself every single day.", "Persistence overrides resistance.",
    "Make today so awesome yesterday gets jealous.", "Discipline is the bridge between goals and accomplishment.",
    "The secret of getting ahead is getting started.", "It always seems impossible until it's done.",
    "Don't watch the clock; do what it does. Keep going.", "The harder you work for something, the greater you'll feel when you achieve it.",
    "Dream it. Wish it. Do it.", "Success doesn't just find you. You have to go out and get it.",
    "The key to success is to focus on goals, not obstacles.", "Wake up with determination. Go to bed with satisfaction.",
    "Do something today that your future self will thank you for.", "Little things make big days.",
    "It's going to be hard, but hard does not mean impossible.", "Don't wait for opportunity. Create it.",
    "Sometimes we're tested not to show our weaknesses, but to discover our strengths.", "The only way to do great work is to love what you do.",
    "Even the greatest was once a beginner. Don't be afraid to take that first step.", "Your time is limited, don't waste it living someone else's life.",
    "Push yourself, because no one else is going to do it for you.", "Great things take time.",
    "Be so good they can't ignore you.", "Success is what happens after you have survived all your mistakes.",
    "Work hard in silence, let your success be your noise.", "A journey of a thousand miles begins with a single step.",
    "Don't let yesterday take up too much of today.", "You learn more from failure than from success.",
    "If you're going through hell, keep going.", "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "I find that the harder I work, the more luck I seem to have.", "All our dreams can come true if we have the courage to pursue them.",
    "Opportunities don't happen. You create them.", "I never dreamed about success, I worked for it.",
    "The way to get started is to quit talking and begin doing.", "Success is not the key to happiness. Happiness is the key to success.",
    "Don't be afraid to give up the good to go for the great.", "I attribute my success to this: I never gave or took any excuse.",
    "The difference between who you are and who you want to be is what you do.", "Setting goals is the first step in turning the invisible into the visible.",
    "You don't have to be great to start, but you have to start to be great.", "Action is the foundational key to all success.",
    "If you want to achieve greatness stop asking for permission.", "Things work out best for those who make the best of how things work out.",
    "To live a creative life, we must lose our fear of being wrong.", "If you are not willing to risk the usual you will have to settle for the ordinary.",
    "Trust because you are willing to accept the risk, not because it's safe or certain.", "All progress takes place outside the comfort zone.",
    "The number one reason people fail in life is because they listen to their friends, family, and neighbors.",
    "In order to succeed, your desire for success should be greater than your fear of failure.",
    "A successful man is one who can lay a firm foundation with the bricks others have thrown at him.",
    "Success is walking from failure to failure with no loss of enthusiasm.",
    "Develop success from failures. Discouragement and failure are two of the surest stepping stones to success.",
    "Failure is the condiment that gives success its flavor.",
    "There are no secrets to success. It is the result of preparation, hard work, and learning from failure.",
    "Success is not just about what you accomplish in your life; it's about what you inspire others to do.",
    "Success is liked by many, but achieved by few who are willing to work for it.",
    "If you really want to do something, you'll find a way. If you don't, you'll find an excuse.",
    "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart.",
    "The only limit to our realization of tomorrow will be our doubts of today.", "The future depends on what you do today.",
    "Keep your face always toward the sunshine—and shadows will fall behind you.", "The best way to predict your future is to create it.",
    "Success is to be measured not so much by the position that one has reached in life as by the obstacles which he has overcome.",
    "Believe you can and you're halfway there.", "Don't let the noise of others' opinions drown out your own inner voice.",
    "If you want to fly, give up everything that weighs you down.",
    "What you get by achieving your goals is not as important as what you become by achieving your goals.",
    "Always do your best. What you plant now, you will harvest later.", "Don't be discouraged. It's often the last key in the bunch that opens the lock.",
    "Hardships often prepare ordinary people for an extraordinary destiny.", "Your passion is waiting for your courage to catch up.",
    "If you can dream it, you can do it.", "Go confidently in the direction of your dreams. Live the life you have imagined.",
    "The only person you are destined to become is the person you decide to be.", "Everything you've ever wanted is on the other side of fear.",
    "Start where you are. Use what you have. Do what you can.", "Fall seven times, stand up eight.",
    "The mind is everything. What you think you become.", "The best time to plant a tree was 20 years ago. The second best time is now.",
    "An unexamined life is not worth living.", "Eighty percent of success is showing up.",
    "Your time is limited, so don't waste it living someone else's life.", "Winning isn't everything, but wanting to win is.",
    "I am not a product of my circumstances. I am a product of my decisions.",
    "Every child is an artist. The problem is how to remain an artist once he grows up.",
    "You can never cross the ocean until you have the courage to lose sight of the shore.",
    "The two most important days in your life are the day you are born and the day you find out why."
];

// Global state template for new users
const DEFAULT_STATE = {
    currentMood: 'happy',
    subjects: [],
    schedules: {},
    history: {},
    syllabi: {},
    examMode: { active: false, date: null },
    isLoggedIn: false, // Default is NOT logged in
    userEmail: null
};

// Global State
let appState = { ...DEFAULT_STATE };

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
        // Legacy Cleanup
        ['moodPlannerState', 'moodPlannerState_user@gmail.com', 'moodPlannerState_null'].forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                console.log(`Syncora: Legacy data '${key}' cleared.`);
            }
        });

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
        showRandomSlogan();

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
    const togglePasswordBtn = document.getElementById('toggle-password');
    const loginEmailInput = document.getElementById('login-email');

    if (loginForm) loginForm.onsubmit = handleLogin;

    if (togglePasswordBtn) {
        togglePasswordBtn.onclick = () => {
            const pwdInput = document.getElementById('login-password');
            const type = pwdInput.getAttribute('type') === 'password' ? 'text' : 'password';
            pwdInput.setAttribute('type', type);
            togglePasswordBtn.innerHTML = type === 'password' ?
                '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="eye-icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>' :
                '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="eye-icon"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
        };
    }

    if (loginEmailInput) {
        loginEmailInput.oninput = (e) => {
            const email = e.target.value.toLowerCase().trim();
            const passwordHint = document.getElementById('password-hint');
            const passwordLabel = document.getElementById('password-label');
            const loginBtn = document.getElementById('login-submit-btn');
            const loginTitle = document.getElementById('login-title');
            const loginSubtitle = document.getElementById('login-subtitle');

            if (ALLOWED_USERS.includes(email)) {
                const users = JSON.parse(localStorage.getItem('moodPlannerUsers') || '{}');
                if (!users[email]) {
                    // Password creation mode
                    if (loginTitle) loginTitle.textContent = "Create Account";
                    if (loginSubtitle) loginSubtitle.textContent = "Welcome! Set a password for your new account.";
                    if (passwordLabel) passwordLabel.textContent = "Set Password";
                    if (passwordHint) passwordHint.style.display = 'block';
                    if (loginBtn) loginBtn.textContent = 'Register & Unlock';
                } else {
                    // Normal login mode
                    if (loginTitle) loginTitle.textContent = "Welcome Back";
                    if (loginSubtitle) loginSubtitle.textContent = "Log in to access your personalized study planner.";
                    if (passwordLabel) passwordLabel.textContent = "Password";
                    if (passwordHint) passwordHint.style.display = 'none';
                    if (loginBtn) loginBtn.textContent = 'Unlock My Planner';
                }
            } else {
                if (passwordHint) passwordHint.style.display = 'none';
                if (passwordLabel) passwordLabel.textContent = 'Password';
                if (loginBtn) loginBtn.textContent = 'Unlock My Planner';
            }
        };
    }

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
        const userEmail = localStorage.getItem('moodPlannerActiveUser');
        if (userEmail) {
            const saved = localStorage.getItem(`moodPlannerState_${userEmail}`);
            if (saved && saved !== "undefined" && saved !== "null") {
                const parsed = JSON.parse(saved);
                if (parsed && typeof parsed === 'object') {
                    appState = { ...DEFAULT_STATE, ...parsed, isLoggedIn: true, userEmail: userEmail };
                    console.log(`Syncora: State loaded for ${userEmail}`);
                    return;
                }
            }
            // If no valid state found, initialize as new logged-in user
            appState = { ...DEFAULT_STATE, userEmail: userEmail, isLoggedIn: true };
            console.log(`Syncora: New user session for ${userEmail}`);
        }
    } catch (e) {
        console.warn("Syncora: Failed to load state", e);
    }
}

function saveState() {
    try {
        if (appState.userEmail) {
            localStorage.setItem('moodPlannerActiveUser', appState.userEmail);
            localStorage.setItem(`moodPlannerState_${appState.userEmail}`, JSON.stringify(appState));
        }
    } catch (e) {
        console.error("Syncora: Failed to save state", e);
    }
}

function clearData() {
    if (confirm("Reset everything? This cannot be undone.")) {
        forceReset();
    }
}

window.forceReset = function () {
    if (confirm("This will clear ALL users and ALL study plans. Are you sure you want to reset the system?")) {
        localStorage.clear();
        location.reload();
    }
};

window.logout = function () {
    localStorage.removeItem('moodPlannerActiveUser');
    appState.isLoggedIn = false;
    appState.userEmail = null;
    location.reload();
};

/**
 * Login Logic
 */
function handleLogin(e) {
    e.preventDefault();
    console.log("Syncora: Login attempt...");
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const errorEl = document.getElementById('login-error');

    if (!emailInput || !passwordInput) {
        console.error("Syncora: Login inputs not found!");
        return;
    }

    const email = emailInput.value.toLowerCase().trim();
    const password = passwordInput.value;

    if (!ALLOWED_USERS.includes(email)) {
        console.warn(`Syncora: Unauthorized email attempt: ${email}`);
        if (errorEl) {
            errorEl.textContent = "This email is not authorized to access Syncora.";
            errorEl.style.display = 'block';
        }
        return;
    }

    try {
        let users = {};
        try {
            const savedUsers = localStorage.getItem('moodPlannerUsers');
            if (savedUsers) users = JSON.parse(savedUsers);
        } catch (err) {
            console.error("Syncora: Failed to parse user database, resetting...", err);
            users = {};
        }

        // Case 1: First-time user (Registration)
        if (!users[email]) {
            console.log(`Syncora: Registering new user: ${email}`);
            if (password.length < 4) {
                if (errorEl) {
                    errorEl.textContent = "Please create a password with at least 4 characters.";
                    errorEl.style.display = 'block';
                }
                return;
            }
            users[email] = password;
            localStorage.setItem('moodPlannerUsers', JSON.stringify(users));
            completeLogin(email);
        }
        // Case 2: Returning user (Verification)
        else {
            console.log(`Syncora: Verifying returning user: ${email}`);
            if (users[email] === password) {
                completeLogin(email);
            } else {
                console.warn("Syncora: Incorrect password");
                if (errorEl) {
                    errorEl.innerHTML = "Incorrect password. <br><span style='font-size: 0.8rem; opacity: 0.8;'>If you forgot it, click 'Reset System' below.</span>";
                    errorEl.style.display = 'block';
                }
            }
        }
    } catch (error) {
        console.error("Syncora: Critical Login Error", error);
        if (errorEl) {
            errorEl.textContent = "System error during login. Please try again.";
            errorEl.style.display = 'block';
        }
    }
}

function completeLogin(email) {
    try {
        console.log(`Syncora: Completing login for ${email}`);
        localStorage.setItem('moodPlannerActiveUser', email);
        // Explicitly update and save state before reload
        appState.userEmail = email;
        appState.isLoggedIn = true;
        saveState();
        
        // Small delay to ensure storage writes complete in all browsers
        setTimeout(() => {
            location.reload();
        }, 100);
    } catch (e) {
        console.error("Syncora: Failed to complete login", e);
        alert("Storage error. Please check if cookies/storage are enabled.");
    }
}

function showRandomSlogan() {
    const sloganEl = document.getElementById('slogan-display');
    if (sloganEl) {
        const randomSlogan = SLOGANS[Math.floor(Math.random() * SLOGANS.length)];
        sloganEl.textContent = `"${randomSlogan}"`;
    }
}

/**
 * Setup Wizard
 */
window.finishSetup = function () {
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

            switch (mood) {
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
window.toggleTask = function (moodId, taskId) {
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

window.deleteTask = function (moodId, taskId) {
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

async function handleDoubt() {
    const inputEl = document.getElementById('doubt-input');
    const buddyMsg = document.getElementById('ai-buddy-message');
    const spinner = document.getElementById('ai-response-spinner');

    if (!inputEl || !inputEl.value.trim() || !buddyMsg) return;

    const query = inputEl.value;
    inputEl.value = '';

    // Show loading state
    buddyMsg.textContent = "Syncora AI is thinking...";
    if (spinner) spinner.classList.remove('hidden');

    try {
        // 1. Mood Detection Logic (Client-side fast path)
        const moodMappings = {
            tired: ['tired', 'sleepy', 'exhausted', 'drain', 'low energy', 'rest'],
            stressed: ['stressed', 'anxious', 'overwhelmed', 'too much', 'panic'],
            motivated: ['ready', 'motivated', 'power', 'crush', 'grind'],
            focused: ['focus', 'concentrate', 'zone', 'deep'],
            happy: ['happy', 'good', 'great', 'fine']
        };

        for (const [mood, keywords] of Object.entries(moodMappings)) {
            if (keywords.some(k => query.toLowerCase().includes(k))) {
                updateApp(mood);
                // We'll still call the AI but with context that we switched mood
                break;
            }
        }

        // 2. Call OpenAI API
        const response = await callChatGPT(query);

        if (response) {
            buddyMsg.textContent = response;
        } else {
            throw new Error("Empty response from AI");
        }

    } catch (error) {
        console.error("AI Error:", error);
        buddyMsg.textContent = "Syncora Advisor: I'm having trouble connecting to my brain right now. Please check your API key or connection.";
    } finally {
        if (spinner) spinner.classList.add('hidden');
    }
}

async function callChatGPT(prompt) {
    if (OPENAI_API_KEY === "YOUR_OPENAI_API_KEY_HERE") {
        return "Please set your OpenAI API Key in app.js to enable real ChatGPT answers! 🧠";
    }

    const API_URL = "https://api.openai.com/v1/chat/completions";

    const systemPrompt = `
        You are Syncora AI, a helpful study assistant. 
        The user is currently studying these subjects: ${appState.subjects.join(', ')}.
        Their current mood is: ${appState.currentMood}.
        Current schedule tasks: ${JSON.stringify(appState.schedules[appState.currentMood])}.
        
        Provide a concise, motivating, and helpful answer. If they ask about what to study, refer to their schedule.
    `;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();
        if (data.choices && data.choices[0].message.content) {
            return data.choices[0].message.content;
        }
        return null;
    } catch (e) {
        console.error("OpenAI API Call Failed", e);
        return null;
    }
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
    // Disabled for a completely fresh/clean app experience as requested
    console.log("Syncora: Quick Win check skipped for clean experience.");
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

// DOM Elements
const timeElement = document.getElementById('time');
const dateElement = document.getElementById('date');
const greetingElement = document.getElementById('greeting');
const themeToggle = document.getElementById('theme-toggle');
const formatToggle = document.getElementById('format-toggle');
const modeToggle = document.getElementById('mode-toggle');
const themePicker = document.querySelector('.theme-picker');
const alarmSound = document.getElementById('alarm-sound');

// Stopwatch elements
const stopwatchElement = document.getElementById('stopwatch');
const stopwatchDisplay = document.getElementById('stopwatch-display');
const startStopwatchBtn = document.getElementById('start-stopwatch');
const lapStopwatchBtn = document.getElementById('lap-stopwatch');
const resetStopwatchBtn = document.getElementById('reset-stopwatch');
const lapsContainer = document.getElementById('laps-container');

// Timer elements
const timerElement = document.getElementById('timer');
const timerDisplay = document.getElementById('timer-display');
const startTimerBtn = document.getElementById('start-timer');
const resetTimerBtn = document.getElementById('reset-timer');
const minutesInput = document.getElementById('minutes-input');
const secondsInput = document.getElementById('seconds-input');

// Alarm elements
const alarmElement = document.getElementById('alarm');
const alarmTimeInput = document.getElementById('alarm-time');
const setAlarmBtn = document.getElementById('set-alarm');
const alarmStatus = document.getElementById('alarm-status');
const activeAlarms = document.getElementById('active-alarms');

// State
let currentMode = 'clock'; // 'clock', 'stopwatch', 'timer', 'alarm'
let is24HourFormat = false;
let isDarkMode = false;
let currentTheme = 'default';
let stopwatchInterval;
let timerInterval;
let stopwatchRunning = false;
let timerRunning = false;
let stopwatchTime = 0;
let timerTime = 0;
let alarms = [];
let lapTimes = [];

// Initialize
function init() {
  loadPreferences();
  updateClock();
  setInterval(updateClock, 1000);
  setupEventListeners();
  updateGreeting();
}

// Load saved preferences
function loadPreferences() {
  // Theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    currentTheme = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
  
  // Time format
  const savedFormat = localStorage.getItem('timeFormat');
  if (savedFormat === '24h') {
    is24HourFormat = true;
    formatToggle.textContent = '24h';
  }
  
  // Alarms
  const savedAlarms = localStorage.getItem('alarms');
  if (savedAlarms) {
    alarms = JSON.parse(savedAlarms);
    renderAlarms();
  }
}

// Save preferences
function savePreferences() {
  localStorage.setItem('theme', currentTheme);
  localStorage.setItem('timeFormat', is24HourFormat ? '24h' : '12h');
  localStorage.setItem('alarms', JSON.stringify(alarms));
}

// Update clock display
function updateClock() {
  const now = new Date();
  
  // Time
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  let amPm = '';

  if (!is24HourFormat) {
    amPm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
  }

  const timeString = is24HourFormat 
    ? `${hours}:${minutes}:${seconds}`
    : `${hours}:${minutes}:${seconds} ${amPm}`;

  timeElement.textContent = timeString;

  // Date
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  dateElement.textContent = now.toLocaleDateString(undefined, options);
  
  // Check alarms
  checkAlarms(now);
}

// Update greeting based on time of day
function updateGreeting() {
  const hour = new Date().getHours();
  let greeting;
  
  if (hour < 12) greeting = "Good Morning!";
  else if (hour < 18) greeting = "Good Afternoon!";
  else greeting = "Good Evening!";
  
  greetingElement.textContent = greeting;
}

// Setup event listeners
function setupEventListeners() {
  // Theme toggle
  themeToggle.addEventListener('click', toggleThemePicker);
  
  // Theme options
  document.querySelectorAll('.theme-option').forEach(option => {
    option.addEventListener('click', () => {
      const theme = option.getAttribute('data-theme');
      setTheme(theme);
    });
  });
  
  // Time format toggle
  formatToggle.addEventListener('click', toggleTimeFormat);
  
  // Mode toggle
  modeToggle.addEventListener('click', toggleMode);
  
  // Stopwatch controls
  startStopwatchBtn.addEventListener('click', toggleStopwatch);
  lapStopwatchBtn.addEventListener('click', recordLap);
  resetStopwatchBtn.addEventListener('click', resetStopwatch);
  
  // Timer controls
  startTimerBtn.addEventListener('click', toggleTimer);
  resetTimerBtn.addEventListener('click', resetTimer);
  
  // Alarm controls
  setAlarmBtn.addEventListener('click', setAlarm);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') toggleThemePicker();
    if (e.code === 'KeyF') toggleTimeFormat();
  });
}

// Toggle theme picker visibility
function toggleThemePicker() {
  themePicker.classList.toggle('hidden');
}

// Set theme
function setTheme(theme) {
  currentTheme = theme;
  if (theme === 'default') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
  savePreferences();
  themePicker.classList.add('hidden');
}

// Toggle time format
function toggleTimeFormat() {
  is24HourFormat = !is24HourFormat;
  formatToggle.textContent = is24HourFormat ? '24h' : '12h';
  savePreferences();
}

// Toggle between clock modes
function toggleMode() {
  // Hide all modes first
  stopwatchElement.classList.add('hidden');
  timerElement.classList.add('hidden');
  alarmElement.classList.add('hidden');
  
  // Determine next mode
  const modes = ['clock', 'stopwatch', 'timer', 'alarm'];
  const currentIndex = modes.indexOf(currentMode);
  currentMode = modes[(currentIndex + 1) % modes.length];
  modeToggle.textContent = currentMode.charAt(0).toUpperCase() + currentMode.slice(1);
  
  // Show current mode
  if (currentMode === 'stopwatch') {
    stopwatchElement.classList.remove('hidden');
    resetStopwatch();
  } else if (currentMode === 'timer') {
    timerElement.classList.remove('hidden');
    resetTimer();
  } else if (currentMode === 'alarm') {
    alarmElement.classList.remove('hidden');
  }
}

/* Stopwatch Functions */
function toggleStopwatch() {
  if (stopwatchRunning) {
    clearInterval(stopwatchInterval);
    startStopwatchBtn.textContent = 'Start';
    stopwatchRunning = false;
  } else {
    stopwatchInterval = setInterval(updateStopwatch, 10);
    startStopwatchBtn.textContent = 'Stop';
    stopwatchRunning = true;
  }
}

function updateStopwatch() {
  stopwatchTime += 10;
  const formattedTime = formatTime(stopwatchTime);
  stopwatchDisplay.textContent = formattedTime;
}

function recordLap() {
  if (stopwatchRunning) {
    lapTimes.push(stopwatchTime);
    renderLaps();
  }
}

function resetStopwatch() {
  clearInterval(stopwatchInterval);
  stopwatchTime = 0;
  stopwatchDisplay.textContent = '00:00:00';
  startStopwatchBtn.textContent = 'Start';
  stopwatchRunning = false;
  lapTimes = [];
  lapsContainer.innerHTML = '';
}

function renderLaps() {
  lapsContainer.innerHTML = '';
  lapTimes.forEach((lap, index) => {
    const lapItem = document.createElement('div');
    lapItem.className = 'lap-item';
    lapItem.textContent = `Lap ${index + 1}: ${formatTime(lap)}`;
    lapsContainer.appendChild(lapItem);
  });
}

/* Timer Functions */
function toggleTimer() {
  if (timerRunning) {
    clearInterval(timerInterval);
    startTimerBtn.textContent = 'Start';
    timerRunning = false;
  } else {
    const minutes = parseInt(minutesInput.value) || 0;
    const seconds = parseInt(secondsInput.value) || 0;
    timerTime = (minutes * 60 + seconds) * 1000;
    
    if (timerTime <= 0) return;
    
    updateTimerDisplay();
    timerInterval = setInterval(updateTimer, 10);
    startTimerBtn.textContent = 'Stop';
    timerRunning = true;
  }
}

function updateTimer() {
  timerTime -= 10;
  updateTimerDisplay();
  
  if (timerTime <= 0) {
    clearInterval(timerInterval);
    timerRunning = false;
    startTimerBtn.textContent = 'Start';
    timerDisplay.classList.add('pulse');
    setTimeout(() => timerDisplay.classList.remove('pulse'), 2000);
  }
}

function updateTimerDisplay() {
  const seconds = Math.ceil(timerTime / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  startTimerBtn.textContent = 'Start';
  minutesInput.value = '5';
  secondsInput.value = '0';
  timerDisplay.textContent = '05:00';
  timerDisplay.classList.remove('pulse');
}

/* Alarm Functions */
function setAlarm() {
  const alarmTime = alarmTimeInput.value;
  if (!alarmTime) return;
  
  const [hours, minutes] = alarmTime.split(':').map(Number);
  const alarm = { hours, minutes, active: true };
  
  alarms.push(alarm);
  savePreferences();
  renderAlarms();
  
  alarmStatus.textContent = `Alarm set for ${formatAlarmTime(hours, minutes)}`;
  alarmTimeInput.value = '';
  
  // Add visual feedback
  alarmStatus.classList.add('pulse');
  setTimeout(() => alarmStatus.classList.remove('pulse'), 1000);
}

function checkAlarms(now) {
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  
  alarms.forEach((alarm, index) => {
    if (alarm.active && alarm.hours === currentHours && alarm.minutes === currentMinutes) {
      triggerAlarm(index);
    }
  });
}

function triggerAlarm(index) {
  alarmSound.play();
  alarms[index].active = false;
  savePreferences();
  renderAlarms();
  
  // Show notification
  const alarm = alarms[index];
  const notification = document.createElement('div');
  notification.className = 'alarm-item pulse';
  notification.innerHTML = `
    <span>Alarm! ${formatAlarmTime(alarm.hours, alarm.minutes)}</span>
    <button class="delete-alarm" data-index="${index}">Dismiss</button>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    notification.remove();
  }, 10000);
  
  // Dismiss button
  notification.querySelector('.delete-alarm').addEventListener('click', () => {
    notification.remove();
    alarmSound.pause();
    alarmSound.currentTime = 0;
  });
}

function renderAlarms() {
  activeAlarms.innerHTML = '';
  
  if (alarms.length === 0) {
    activeAlarms.innerHTML = '<p>No alarms set</p>';
    return;
  }
  
  alarms.forEach((alarm, index) => {
    if (!alarm.active) return;
    
    const alarmItem = document.createElement('div');
    alarmItem.className = 'alarm-item';
    alarmItem.innerHTML = `
      <span>${formatAlarmTime(alarm.hours, alarm.minutes)}</span>
      <button class="delete-alarm" data-index="${index}">Delete</button>
    `;
    
    activeAlarms.appendChild(alarmItem);
    
    // Delete button
    alarmItem.querySelector('.delete-alarm').addEventListener('click', (e) => {
      e.stopPropagation();
      alarms.splice(index, 1);
      savePreferences();
      renderAlarms();
    });
  });
}

// Helper function to format time (ms to HH:MM:SS)
function formatTime(ms) {
  const date = new Date(ms);
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  const milliseconds = String(Math.floor(date.getUTCMilliseconds() / 10)).padStart(2, '0');
  
  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

// Helper function to format alarm time
function formatAlarmTime(hours, minutes) {
  if (is24HourFormat) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  } else {
    const amPm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${amPm}`;
  }
}

// Initialize the app
init();
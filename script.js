
        // Global variables
        let animationPhase = 0;
        let tasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
        let taskIdCounter = parseInt(localStorage.getItem('taskIdCounter')) || 1;
        let selectedPriority = 'medium';
        let selectedDuration = 25;
        let currentTheme = localStorage.getItem('theme') || 'dark';
        
        // Timer variables
        let timerInterval = null;
        let timerState = {
            isRunning: false,
            timeLeft: 25 * 60,
            duration: 25 * 60
        };

        // Task timers - store individual timer states for each task
        let taskTimers = {};

        // Celebration emojis
        const celebrationEmojis = ['🎉', '🎊', '✨', '🌟', '💫', '🎈', '🎁', '🏆', '👏', '🥳', '🎯', '💪', '🔥', '⭐', '🌈'];

        // Achievements system
        const achievements = [
            {
                id: 'first_task',
                title: 'Getting Started',
                description: 'Complete your first task',
                icon: '🎯',
                unlocked: false,
                progress: 0,
                target: 1
            },
            {
                id: 'task_master',
                title: 'Task Master',
                description: 'Complete 10 tasks',
                icon: '👑',
                unlocked: false,
                progress: 0,
                target: 10
            },
            {
                id: 'focus_warrior',
                title: 'Focus Warrior',
                description: 'Focus for 2 hours total',
                icon: '⚡',
                unlocked: false,
                progress: 0,
                target: 120
            },
            {
                id: 'streak_keeper',
                title: 'Streak Keeper',
                description: 'Complete tasks 3 days in a row',
                icon: '🔥',
                unlocked: false,
                progress: 0,
                target: 3
            },
            {
                id: 'early_bird',
                title: 'Early Bird',
                description: 'Complete a task before 9 AM',
                icon: '🌅',
                unlocked: false,
                progress: 0,
                target: 1
            },
            {
                id: 'night_owl',
                title: 'Night Owl',
                description: 'Complete a task after 9 PM',
                icon: '🦉',
                unlocked: false,
                progress: 0,
                target: 1
            }
        ];

        // Utility functions
        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }

        function formatDuration(minutes) {
            if (minutes < 60) return `${minutes}m`;
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
        }

        // Task Timer Functions
        function startTaskTimer(taskId) {
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;

            // Clear any existing timer for this task
            if (taskTimers[taskId]) {
                clearInterval(taskTimers[taskId].interval);
            }

            // Initialize or continue timer
            if (!taskTimers[taskId]) {
                taskTimers[taskId] = {
                    timeLeft: task.estimatedDuration * 60,
                    duration: task.estimatedDuration * 60,
                    isRunning: false
                };
            }

            taskTimers[taskId].isRunning = true;
            taskTimers[taskId].interval = setInterval(() => {
                taskTimers[taskId].timeLeft--;
                updateTaskTimerDisplay(taskId);

                if (taskTimers[taskId].timeLeft <= 0) {
                    taskTimerComplete(taskId);
                }
            }, 1000);

            // Force immediate update of the display
            updateTaskTimerDisplay(taskId);
            renderPendingTasks(); // Re-render to update button states
        }

        function pauseTaskTimer(taskId) {
            if (taskTimers[taskId]) {
                taskTimers[taskId].isRunning = false;
                clearInterval(taskTimers[taskId].interval);
                renderPendingTasks(); // Re-render to update button states
            }
        }

        function resumeTaskTimer(taskId) {
            if (taskTimers[taskId] && !taskTimers[taskId].isRunning) {
                taskTimers[taskId].isRunning = true;
                taskTimers[taskId].interval = setInterval(() => {
                    taskTimers[taskId].timeLeft--;
                    updateTaskTimerDisplay(taskId);

                    if (taskTimers[taskId].timeLeft <= 0) {
                        taskTimerComplete(taskId);
                    }
                }, 1000);
                renderPendingTasks(); // Re-render to update button states
            }
        }

        function stopTaskTimer(taskId) {
            if (taskTimers[taskId]) {
                clearInterval(taskTimers[taskId].interval);
                delete taskTimers[taskId];
                renderPendingTasks(); // Re-render to update button states
            }
        }

        function updateTaskTimerDisplay(taskId) {
            const timerElement = document.getElementById(`taskTimer-${taskId}`);
            if (!timerElement || !taskTimers[taskId]) return;

            const timer = taskTimers[taskId];
            const progress = ((timer.duration - timer.timeLeft) / timer.duration) * 100;

            timerElement.innerHTML = `
                <div class="task-timer-display">
                    <div class="task-progress-bar">
                        <div class="task-progress-fill ${timer.timeLeft === 0 ? 'completed' : ''} ${timer.isRunning ? 'active' : ''}" 
                             style="width: ${progress}%"></div>
                    </div>
                    <span>${formatTime(timer.timeLeft)}</span>
                </div>
            `;
        }

        function taskTimerComplete(taskId) {
            if (taskTimers[taskId]) {
                taskTimers[taskId].isRunning = false;
                clearInterval(taskTimers[taskId].interval);
                updateTaskTimerDisplay(taskId);
                showCelebration();
                renderPendingTasks(); // Re-render to update button states
            }
        }

        // Initialize theme
        function initTheme() {
            document.documentElement.setAttribute('data-theme', currentTheme);
            updateThemeIcon();
        }

        // Toggle theme
        function toggleTheme() {
            currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', currentTheme);
            localStorage.setItem('theme', currentTheme);
            updateThemeIcon();
        }

        // Update theme icon
        function updateThemeIcon() {
            const themeIcon = document.getElementById('themeIcon');
            if (currentTheme === 'dark') {
                themeIcon.innerHTML = `
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                `;
            } else {
                themeIcon.innerHTML = `
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                `;
            }
        }

        // Achievements functions
        function loadAchievements() {
            const savedAchievements = JSON.parse(localStorage.getItem('achievements')) || achievements;
            achievements.forEach((achievement, index) => {
                if (savedAchievements[index]) {
                    achievement.unlocked = savedAchievements[index].unlocked;
                    achievement.progress = savedAchievements[index].progress ?? 0;
                }
            });
        }

        function saveAchievements() {
            localStorage.setItem('achievements', JSON.stringify(achievements));
        }

        function checkAchievements() {
            const completedTasks = tasks.filter(task => task.completed);
            let newUnlocks = [];

            // First task achievement
            achievements[0].progress = Math.min(completedTasks.length, achievements[0].target);
            if (!achievements[0].unlocked && achievements[0].progress >= achievements[0].target) {
                achievements[0].unlocked = true;
                newUnlocks.push(achievements[0]);
            }

            // Task master achievement
            achievements[1].progress = Math.min(completedTasks.length, achievements[1].target);
            if (!achievements[1].unlocked && achievements[1].progress >= achievements[1].target) {
                achievements[1].unlocked = true;
                newUnlocks.push(achievements[1]);
            }

            // Focus warrior achievement
            const totalFocusTime = getTotalFocusTime();
            achievements[2].progress = Math.min(totalFocusTime, achievements[2].target);
            if (!achievements[2].unlocked && achievements[2].progress >= achievements[2].target) {
                achievements[2].unlocked = true;
                newUnlocks.push(achievements[2]);
            }

            // Early bird achievement
            const earlyTasks = completedTasks.filter(task => {
                const completedTime = new Date(task.completedAt);
                return completedTime.getHours() < 9;
            });
            achievements[4].progress = Math.min(earlyTasks.length, achievements[4].target);
            if (!achievements[4].unlocked && achievements[4].progress >= achievements[4].target) {
                achievements[4].unlocked = true;
                newUnlocks.push(achievements[4]);
            }

            // Night owl achievement
            const lateTasks = completedTasks.filter(task => {
                const completedTime = new Date(task.completedAt);
                return completedTime.getHours() >= 21;
            });
            achievements[5].progress = Math.min(lateTasks.length, achievements[5].target);
            if (!achievements[5].unlocked && achievements[5].progress >= achievements[5].target) {
                achievements[5].unlocked = true;
                newUnlocks.push(achievements[5]);
            }

            if (newUnlocks.length > 0) {
                saveAchievements();
                showAchievementUnlock(newUnlocks);
            }
        }

        function getTotalFocusTime() {
            return tasks.filter(task => task.completed).reduce((total, task) => {
                return total + (task.estimatedDuration || 0);
            }, 0);
        }

        function showAchievementUnlock(newAchievements) {
            newAchievements.forEach((achievement, index) => {
                setTimeout(() => {
                    const message = document.createElement('div');
                    message.className = 'celebration-message';
                    message.innerHTML = `
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">${achievement.icon}</div>
                        <div>Achievement Unlocked!</div>
                        <div style="font-size: 1rem; margin-top: 0.5rem; opacity: 0.9;">${achievement.title}</div>
                    `;
                    document.getElementById('celebrationOverlay').appendChild(message);

                    setTimeout(() => {
                        if (message.parentNode) {
                            message.parentNode.removeChild(message);
                        }
                    }, 3000);
                }, index * 1000);
            });
        }

        function renderAchievements() {
            const container = document.getElementById('achievementsGrid');
            if (!container) return;

            container.innerHTML = achievements.map(achievement => {
                const progressPercentage = (achievement.progress / achievement.target) * 100;
                return `
                    <div class="achievement-item ${achievement.unlocked ? 'unlocked' : ''}">
                        <div class="achievement-icon ${achievement.unlocked ? 'unlocked' : ''}">
                            ${achievement.icon}
                        </div>
                        <div class="achievement-title">${achievement.title}</div>
                        <div class="achievement-desc">${achievement.description}</div>
                        <div class="achievement-progress">
                            <div class="progress-text">${achievement.progress}/${achievement.target}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Search functionality
        function setupSearch() {
            const searchPending = document.getElementById('searchPending');
            const searchCompleted = document.getElementById('searchCompleted');

            if (searchPending) {
                searchPending.addEventListener('input', (e) => {
                    filterTasks(e.target.value, 'pending');
                });
            }

            if (searchCompleted) {
                searchCompleted.addEventListener('input', (e) => {
                    filterTasks(e.target.value, 'completed');
                });
            }
        }

        function filterTasks(searchTerm, type) {
            const filteredTasks = tasks.filter(task => {
                const matchesType = type === 'pending' ? !task.completed : task.completed;
                const matchesSearch = searchTerm === '' || 
                    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
                return matchesType && matchesSearch;
            });

            if (type === 'pending') {
                renderFilteredPendingTasks(filteredTasks);
            } else {
                renderFilteredCompletedTasks(filteredTasks);
            }
        }

        // Splash screen animation
        setTimeout(() => {
            animationPhase = 1;
            document.getElementById('splashContent').classList.add('animate');
            document.getElementById('logoContainer').classList.add('move-to-side');
        }, 2000);

        setTimeout(() => {
            animationPhase = 2;
            document.getElementById('titleContainer').classList.add('fade-in');
            document.getElementById('clickHint').style.display = 'block';
        }, 2800);

        // Handle splash screen click
        document.getElementById('splashScreen').addEventListener('click', function() {
            if (animationPhase >= 2) {
                animationPhase = 3;
                this.classList.add('exit');
                setTimeout(() => {
                    this.style.display = 'none';
                    document.getElementById('mainApp').style.display = 'block';
                    document.getElementById('floatingTimerBtn').style.display = 'flex';
                    document.getElementById('themeToggle').style.display = 'flex';
                    document.body.style.overflow = 'auto';
                }, 600);
            }
        });

        // Navigation functions
        function showAddTaskPage() {
            document.getElementById('mainApp').style.display = 'none';
            document.getElementById('addTaskPage').style.display = 'block';
            clearAddTaskForm();
        }

        function showViewListPage() {
            document.getElementById('mainApp').style.display = 'none';
            document.getElementById('viewListPage').style.display = 'block';
            renderPendingTasks();
            setupSearch();
        }

        function showPreviousTasksPage() {
            document.getElementById('mainApp').style.display = 'none';
            document.getElementById('previousTasksPage').style.display = 'block';
            renderCompletedTasks();
            setupSearch();
        }

        function showAchievementsPage() {
            document.getElementById('mainApp').style.display = 'none';
            document.getElementById('achievementsPage').style.display = 'block';
            renderAchievements();
        }

        function goBackToMainApp() {
            document.getElementById('addTaskPage').style.display = 'none';
            document.getElementById('viewListPage').style.display = 'none';
            document.getElementById('previousTasksPage').style.display = 'none';
            document.getElementById('achievementsPage').style.display = 'none';
            document.getElementById('mainApp').style.display = 'block';
        }

        // Timer popup functions
        function showTimerPopup() {
            document.getElementById('timerPopup').classList.add('show');
            updateTimerDisplay();
        }

        function hideTimerPopup() {
            document.getElementById('timerPopup').classList.remove('show');
        }

        // Event listeners for form controls
        document.addEventListener('click', function(e) {
            // Priority selection
            if (e.target.classList.contains('priority-btn')) {
                document.querySelectorAll('.priority-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                selectedPriority = e.target.dataset.priority;
            }
            
            // Duration selection
            if (e.target.classList.contains('duration-btn')) {
                document.querySelectorAll('.duration-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                selectedDuration = parseInt(e.target.dataset.duration);
                document.getElementById('customDuration').value = selectedDuration;
            }

            // Timer preset selection
            if (e.target.classList.contains('preset-btn')) {
                document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                const minutes = parseInt(e.target.dataset.minutes);
                updateTimerDuration(minutes);
            }
        });

        // Custom duration input
        document.getElementById('customDuration').addEventListener('input', function() {
            const value = parseInt(this.value) || 25;
            selectedDuration = Math.max(1, Math.min(480, value));
            this.value = selectedDuration;
            
            // Update duration buttons
            document.querySelectorAll('.duration-btn').forEach(btn => btn.classList.remove('active'));
            const matchingBtn = document.querySelector(`[data-duration="${selectedDuration}"]`);
            if (matchingBtn) matchingBtn.classList.add('active');
        });

        // Timer functions
        function updateTimerDuration(minutes) {
            if (!timerState.isRunning) {
                timerState.duration = minutes * 60;
                timerState.timeLeft = minutes * 60;
                updateTimerDisplay();
            }
        }

        function updateTimerDisplay() {
            const timeDisplay = document.getElementById('timerTime');
            const durationDisplay = document.getElementById('timerDuration');
            const progressCircle = document.getElementById('timerProgress');
            
            timeDisplay.textContent = formatTime(timerState.timeLeft);
            durationDisplay.textContent = `/ ${formatTime(timerState.duration)}`;
            
            // Update progress circle
            const progress = ((timerState.duration - timerState.timeLeft) / timerState.duration) * 100;
            const circumference = 2 * Math.PI * 90;
            const offset = circumference - (progress / 100) * circumference;
            progressCircle.style.strokeDashoffset = offset;
            
            // Update color based on completion
            if (timerState.timeLeft === 0 && timerState.duration > 0) {
                progressCircle.classList.add('completed');
            } else {
                progressCircle.classList.remove('completed');
            }
        }

        function startTimer() {
            if (timerState.timeLeft <= 0) {
                timerState.timeLeft = timerState.duration;
            }
            
            timerState.isRunning = true;
            
            document.getElementById('startBtn').style.display = 'none';
            document.getElementById('pauseBtn').style.display = 'inline-flex';
            document.getElementById('stopBtn').style.display = 'inline-flex';
            document.getElementById('resetBtn').style.display = 'inline-flex';
            document.getElementById('timerStatus').textContent = 'Timer running...';
            
            timerInterval = setInterval(() => {
                timerState.timeLeft--;
                updateTimerDisplay();
                
                if (timerState.timeLeft <= 0) {
                    timerComplete();
                }
            }, 1000);
        }

        function pauseTimer() {
            timerState.isRunning = false;
            clearInterval(timerInterval);
            
            document.getElementById('startBtn').style.display = 'inline-flex';
            document.getElementById('pauseBtn').style.display = 'none';
            document.getElementById('timerStatus').textContent = 'Timer paused';
        }

        function stopTimer() {
            timerState.isRunning = false;
            clearInterval(timerInterval);
            timerState.timeLeft = 0;
            
            document.getElementById('startBtn').style.display = 'inline-flex';
            document.getElementById('pauseBtn').style.display = 'none';
            document.getElementById('stopBtn').style.display = 'none';
            document.getElementById('resetBtn').style.display = 'none';
            document.getElementById('timerStatus').textContent = 'Timer stopped';
            
            updateTimerDisplay();
        }

        function resetTimer() {
            timerState.isRunning = false;
            clearInterval(timerInterval);
            timerState.timeLeft = timerState.duration;
            
            document.getElementById('startBtn').style.display = 'inline-flex';
            document.getElementById('pauseBtn').style.display = 'none';
            document.getElementById('stopBtn').style.display = 'none';
            document.getElementById('resetBtn').style.display = 'none';
            document.getElementById('timerStatus').textContent = 'Timer reset';
            
            updateTimerDisplay();
        }

        function timerComplete() {
            timerState.isRunning = false;
            clearInterval(timerInterval);
            
            document.getElementById('startBtn').style.display = 'inline-flex';
            document.getElementById('pauseBtn').style.display = 'none';
            document.getElementById('stopBtn').style.display = 'none';
            document.getElementById('resetBtn').style.display = 'inline-flex';
            document.getElementById('timerStatus').textContent = 'Timer completed! 🎉';
            
            showCelebration();
        }

        // Add task function
        function addTask() {
            const title = document.getElementById('taskTitle').value.trim();
            const description = document.getElementById('taskDescription').value.trim();
            const duration = parseInt(document.getElementById('customDuration').value) || 25;

            if (!title) {
                alert('Please enter a task title');
                return;
            }

            const task = {
                id: taskIdCounter++,
                title: title,
                description: description,
                priority: selectedPriority,
                estimatedDuration: duration,
                completed: false,
                createdAt: new Date().toISOString(),
                completedAt: null
            };

            tasks.push(task);
            saveToLocalStorage();
            clearAddTaskForm();
            
            alert('Task added successfully!');
            goBackToMainApp();
        }

        // Clear form
        function clearAddTaskForm() {
            document.getElementById('taskTitle').value = '';
            document.getElementById('taskDescription').value = '';
            document.getElementById('customDuration').value = '25';
            selectedPriority = 'medium';
            selectedDuration = 25;
            
            document.querySelectorAll('.priority-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelector('[data-priority="medium"]').classList.add('active');
            
            document.querySelectorAll('.duration-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelector('[data-duration="25"]').classList.add('active');
        }

        // Render pending tasks
        function renderPendingTasks() {
            const pendingTasks = tasks.filter(task => !task.completed);
            renderFilteredPendingTasks(pendingTasks);
        }

        function renderFilteredPendingTasks(pendingTasks) {
            const tasksList = document.getElementById('pendingTasksList');

            if (pendingTasks.length === 0) {
                tasksList.innerHTML = `
                    <div class="empty-state">
                        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 6v6l4 2"></path>
                        </svg>
                        <p>No pending tasks</p>
                        <p style="font-size: 0.9rem; margin-top: 0.5rem;">Add a new task to get started!</p>
                    </div>
                `;
                return;
            }

            pendingTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            tasksList.innerHTML = pendingTasks.map(task => {
                const timer = taskTimers[task.id];
                const hasActiveTimer = timer && (timer.isRunning || timer.timeLeft < timer.duration);
                
                return `
                    <div class="task-item" data-task-id="${task.id}">
                        <div class="task-header">
                            <div class="task-title">${task.title}</div>
                            <div class="task-badges">
                                <div class="task-priority priority-${task.priority}">${task.priority.toUpperCase()}</div>
                                ${task.estimatedDuration ? `<div class="task-duration">Est. ${formatDuration(task.estimatedDuration)}</div>` : ''}
                            </div>
                        </div>
                        ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                        
                        <div class="task-timer-section">
                            <div class="task-timer-controls">
                                ${!hasActiveTimer ? 
                                    `<button class="start-timer-btn" onclick="startTaskTimer(${task.id})">Start Timer</button>` :
                                    `${timer.isRunning ? 
                                        `<button class="task-timer-btn pause" onclick="pauseTaskTimer(${task.id})">Pause</button>` :
                                        `<button class="start-timer-btn" onclick="resumeTaskTimer(${task.id})">Resume</button>`
                                    }
                                    <button class="task-timer-btn stop" onclick="stopTaskTimer(${task.id})">Stop</button>`
                                }
                            </div>
                            
                            <div id="taskTimer-${task.id}">
                                ${hasActiveTimer ? 
                                    `<div class="task-timer-display">
                                        <div class="task-progress-bar">
                                            <div class="task-progress-fill ${timer.timeLeft === 0 ? 'completed' : ''} ${timer.isRunning ? 'active' : ''}" 
                                                 style="width: ${((timer.duration - timer.timeLeft) / timer.duration) * 100}%"></div>
                                        </div>
                                        <span>${formatTime(timer.timeLeft)}</span>
                                    </div>` : ''
                                }
                            </div>
                        </div>
                        
                        <div class="task-meta">
                            <div>Created: ${new Date(task.createdAt).toLocaleDateString()}</div>
                            <div class="task-actions">
                                <button class="action-btn complete" onclick="completeTask(${task.id})">Complete</button>
                                <button class="action-btn delete" onclick="deleteTask(${task.id})">Delete</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Render completed tasks
        function renderCompletedTasks() {
            const completedTasks = tasks.filter(task => task.completed);
            renderFilteredCompletedTasks(completedTasks);
        }

        function renderFilteredCompletedTasks(completedTasks) {
            const tasksList = document.getElementById('completedTasksList');

            if (completedTasks.length === 0) {
                tasksList.innerHTML = `
                    <div class="empty-state">
                        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 11l3 3l8-8"></path>
                            <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9s4.03-9 9-9c1.51 0 2.93.37 4.18 1.03"></path>
                        </svg>
                        <p>No completed tasks yet</p>
                        <p style="font-size: 0.9rem; margin-top: 0.5rem;">Complete some tasks to see them here!</p>
                    </div>
                `;
                return;
            }

            completedTasks.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

            tasksList.innerHTML = completedTasks.map(task => `
                <div class="task-item">
                    <div class="task-header">
                        <div class="task-title" style="text-decoration: line-through; opacity: 0.8;">${task.title}</div>
                        <div class="task-badges">
                            <div class="task-priority priority-${task.priority}">${task.priority.toUpperCase()}</div>
                            ${task.estimatedDuration ? `<div class="task-duration">Est. ${formatDuration(task.estimatedDuration)}</div>` : ''}
                        </div>
                    </div>
                    ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                    <div class="task-meta">
                        <div>Completed: ${new Date(task.completedAt).toLocaleDateString()}</div>
                        <div class="task-actions">
                            <button class="action-btn" onclick="uncompleteTask(${task.id})">Undo</button>
                            <button class="action-btn delete" onclick="deleteTask(${task.id})">Delete</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // Complete task with celebration
        function completeTask(id) {
            const task = tasks.find(t => t.id === id);
            if (task) {
                task.completed = true;
                task.completedAt = new Date().toISOString();
                
                // Clear any running timer for this task
                if (taskTimers[id]) {
                    clearInterval(taskTimers[id].interval);
                    delete taskTimers[id];
                }
                
                saveToLocalStorage();
                checkAchievements();
                showCelebration();
                renderPendingTasks();
            }
        }

        // Uncomplete task
        function uncompleteTask(id) {
            const task = tasks.find(t => t.id === id);
            if (task) {
                task.completed = false;
                task.completedAt = null;
                saveToLocalStorage();
                renderCompletedTasks();
            }
        }

        // Delete task
        function deleteTask(id) {
            if (confirm('Are you sure you want to delete this task?')) {
                // Clear any running timer for this task
                if (taskTimers[id]) {
                    clearInterval(taskTimers[id].interval);
                    delete taskTimers[id];
                }
                
                tasks = tasks.filter(t => t.id !== id);
                saveToLocalStorage();
                renderPendingTasks();
                renderCompletedTasks();
            }
        }

        // Show celebration animation
        function showCelebration() {
            const overlay = document.getElementById('celebrationOverlay');
            
            // Create celebration message
            const message = document.createElement('div');
            message.className = 'celebration-message';
            message.innerHTML = '🎉 Task Completed! 🎉<br><small>Great job!</small>';
            overlay.appendChild(message);

            // Create emoji explosion from both bottom corners
            for (let i = 0; i < 60; i++) {
                setTimeout(() => {
                    const emoji = document.createElement('div');
                    emoji.className = 'celebration-emoji';
                    emoji.textContent = celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)];
                    
                    const fromLeft = Math.random() > 0.5;
                    emoji.style.position = 'fixed';
                    emoji.style.left = fromLeft ? '20px' : 'calc(100vw - 60px)';
                    emoji.style.bottom = '20px';
                    emoji.style.fontSize = '2rem';
                    emoji.style.pointerEvents = 'none';
                    emoji.style.zIndex = '9999';
                    emoji.style.animation = `celebrate-${fromLeft ? 'left' : 'right'} 3s ease-out forwards`;
                    
                    overlay.appendChild(emoji);
                    
                    setTimeout(() => {
                        if (emoji.parentNode) {
                            emoji.parentNode.removeChild(emoji);
                        }
                    }, 3000);
                }, i * 30);
            }

            setTimeout(() => {
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }, 3000);
        }

        // Save to localStorage
        function saveToLocalStorage() {
            localStorage.setItem('todoTasks', JSON.stringify(tasks));
            localStorage.setItem('taskIdCounter', taskIdCounter.toString());
        }

        // Close timer popup when clicking outside
        document.getElementById('timerPopup').addEventListener('click', function(e) {
            if (e.target === this) {
                hideTimerPopup();
            }
        });

        // Initialize
        document.body.style.overflow = 'hidden';
        initTheme();
        loadAchievements();
        updateTimerDisplay();
    
// ===========================
// KANBAN BOARD - VANILLA JS
// ===========================

// ===========================
// STATE MANAGEMENT
// ===========================

const STORAGE_KEY = 'kanban-board-data';
const COLUMNS = ['todo', 'inProgress', 'done'];

let appState = {
    todo: [],
    inProgress: [],
    done: []
};

let currentEditingTaskId = null;
let currentEditingColumn = null;

// ===========================
// INITIALIZATION
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    renderTasks();
    attachEventListeners();
    loadThemePreference();
});

// ===========================
// EVENT LISTENERS
// ===========================

function attachEventListeners() {
    // Add Task buttons
    document.querySelectorAll('.btn-add-task').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const columnId = e.target.dataset.columnId;
            openModal(columnId);
        });
    });

    // Modal controls
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('taskForm').addEventListener('submit', handleFormSubmit);

    // Close modal on outside click
    document.getElementById('taskModal').addEventListener('click', (e) => {
        if (e.target.id === 'taskModal') {
            closeModal();
        }
    });

    // Dark mode toggle
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);

    // Event delegation for task actions
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-edit')) {
            const taskId = e.target.closest('.task-item').dataset.taskId;
            const columnId = e.target.closest('.task-list').dataset.columnId;
            editTask(taskId, columnId);
        }

        if (e.target.classList.contains('btn-delete')) {
            const taskId = e.target.closest('.task-item').dataset.taskId;
            const columnId = e.target.closest('.task-list').dataset.columnId;
            deleteTask(taskId, columnId);
        }
    });

    // Drag and Drop
    document.addEventListener('dragstart', handleDragStart, true);
    document.addEventListener('dragend', handleDragEnd, true);
    document.addEventListener('dragover', handleDragOver, true);
    document.addEventListener('drop', handleDrop, true);
    document.addEventListener('dragenter', handleDragEnter, true);
    document.addEventListener('dragleave', handleDragLeave, true);
}

// ===========================
// MODAL MANAGEMENT
// ===========================

function openModal(columnId) {
    currentEditingTaskId = null;
    currentEditingColumn = columnId;
    
    const modal = document.getElementById('taskModal');
    const form = document.getElementById('taskForm');
    const modalTitle = document.getElementById('modalTitle');
    
    // Reset form
    form.reset();
    
    // Set modal title
    modalTitle.textContent = 'Add New Task';
    
    // Show modal
    modal.classList.add('active');
    
    // Focus on input
    document.getElementById('taskTitle').focus();
}

function closeModal() {
    const modal = document.getElementById('taskModal');
    modal.classList.remove('active');
    currentEditingTaskId = null;
    currentEditingColumn = null;
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    
    if (!title) {
        alert('Please enter a task title');
        return;
    }
    
    if (currentEditingTaskId) {
        // Edit existing task
        updateTask(currentEditingTaskId, currentEditingColumn, title, description);
    } else {
        // Add new task
        addTask(currentEditingColumn, title, description);
    }
    
    closeModal();
    renderTasks();
    saveToLocalStorage();
}

// ===========================
// TASK MANAGEMENT
// ===========================

/**
 * Add a new task to the specified column
 * @param {string} columnId - The column to add the task to
 * @param {string} title - Task title
 * @param {string} description - Task description (optional)
 */
function addTask(columnId, title, description = '') {
    const task = {
        id: generateUniqueId(),
        title,
        description,
        createdAt: new Date().toISOString()
    };
    
    appState[columnId].push(task);
}

/**
 * Update an existing task
 * @param {string} taskId - The task ID to update
 * @param {string} columnId - The column containing the task
 * @param {string} title - New task title
 * @param {string} description - New task description
 */
function updateTask(taskId, columnId, title, description) {
    const taskIndex = appState[columnId].findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
        appState[columnId][taskIndex].title = title;
        appState[columnId][taskIndex].description = description;
    }
}

/**
 * Edit a task - open modal with task data
 * @param {string} taskId - The task ID to edit
 * @param {string} columnId - The column containing the task
 */
function editTask(taskId, columnId) {
    const task = appState[columnId].find(t => t.id === taskId);
    
    if (task) {
        currentEditingTaskId = taskId;
        currentEditingColumn = columnId;
        
        const modal = document.getElementById('taskModal');
        const modalTitle = document.getElementById('modalTitle');
        
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description;
        
        modalTitle.textContent = 'Edit Task';
        modal.classList.add('active');
        
        document.getElementById('taskTitle').focus();
    }
}

/**
 * Delete a task from a column
 * @param {string} taskId - The task ID to delete
 * @param {string} columnId - The column containing the task
 */
function deleteTask(taskId, columnId) {
    if (confirm('Are you sure you want to delete this task?')) {
        appState[columnId] = appState[columnId].filter(task => task.id !== taskId);
        renderTasks();
        saveToLocalStorage();
    }
}

// ===========================
// RENDERING
// ===========================

/**
 * Render all tasks from the current app state
 */
function renderTasks() {
    COLUMNS.forEach(columnId => {
        const taskList = document.getElementById(`${columnId}-list`);
        const taskCount = document.getElementById(`${columnId}-count`);
        const tasks = appState[columnId];
        
        // Update count
        taskCount.textContent = tasks.length;
        
        // Clear existing tasks
        taskList.innerHTML = '';
        
        // Render tasks or empty state
        if (tasks.length === 0) {
            taskList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><p>No tasks yet</p></div>';
        } else {
            tasks.forEach(task => {
                const taskElement = createTaskElement(task, columnId);
                taskList.appendChild(taskElement);
            });
        }
    });
}

/**
 * Create a task DOM element
 * @param {Object} task - The task object
 * @param {string} columnId - The column ID
 * @returns {HTMLElement} The task element
 */
function createTaskElement(task, columnId) {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task-item';
    taskDiv.draggable = true;
    taskDiv.dataset.taskId = task.id;
    taskDiv.dataset.columnId = columnId;
    
    // Task title
    const titleDiv = document.createElement('div');
    titleDiv.className = 'task-title';
    titleDiv.textContent = task.title;
    
    // Task description (if exists)
    let descriptionDiv = null;
    if (task.description) {
        descriptionDiv = document.createElement('div');
        descriptionDiv.className = 'task-description';
        descriptionDiv.textContent = task.description;
    }
    
    // Task actions
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'btn-edit';
    editBtn.textContent = '✏️ Edit';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = '🗑️ Delete';
    
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);
    
    // Assemble task element
    taskDiv.appendChild(titleDiv);
    if (descriptionDiv) {
        taskDiv.appendChild(descriptionDiv);
    }
    taskDiv.appendChild(actionsDiv);
    
    return taskDiv;
}

// ===========================
// DRAG & DROP HANDLERS
// ===========================

let draggedElement = null;

/**
 * Handle drag start
 */
function handleDragStart(e) {
    if (e.target.classList.contains('task-item')) {
        draggedElement = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.innerHTML);
    }
}

/**
 * Handle drag end
 */
function handleDragEnd(e) {
    if (draggedElement) {
        draggedElement.classList.remove('dragging');
        draggedElement = null;
    }
    
    // Remove drag-over state from all columns
    document.querySelectorAll('.column').forEach(col => {
        col.classList.remove('drag-over');
    });
}

/**
 * Handle drag over - allow drop
 */
function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

/**
 * Handle drag enter - highlight column
 */
function handleDragEnter(e) {
    const column = e.target.closest('.column');
    if (column && draggedElement) {
        column.classList.add('drag-over');
    }
}

/**
 * Handle drag leave - remove highlight
 */
function handleDragLeave(e) {
    const column = e.target.closest('.column');
    if (column && !column.contains(e.relatedTarget)) {
        column.classList.remove('drag-over');
    }
}

/**
 * Handle drop - move task between columns
 */
function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    const taskList = e.target.closest('.task-list');
    const column = e.target.closest('.column');
    
    if (taskList && draggedElement) {
        const taskId = draggedElement.dataset.taskId;
        const fromColumnId = draggedElement.dataset.columnId;
        const toColumnId = taskList.dataset.columnId;
        
        // Only move if columns are different
        if (fromColumnId !== toColumnId) {
            moveTask(taskId, fromColumnId, toColumnId);
        }
    }
    
    if (column) {
        column.classList.remove('drag-over');
    }
    
    return false;
}

/**
 * Move task from one column to another
 * @param {string} taskId - The task to move
 * @param {string} fromColumnId - Source column
 * @param {string} toColumnId - Destination column
 */
function moveTask(taskId, fromColumnId, toColumnId) {
    const taskIndex = appState[fromColumnId].findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
        const task = appState[fromColumnId].splice(taskIndex, 1)[0];
        appState[toColumnId].push(task);
        
        renderTasks();
        saveToLocalStorage();
    }
}

// ===========================
// LOCAL STORAGE
// ===========================

/**
 * Save app state to localStorage
 */
function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

/**
 * Load app state from localStorage
 */
function loadFromLocalStorage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
        try {
            appState = JSON.parse(stored);
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            // Keep default state if parsing fails
        }
    }
}

// ===========================
// DARK MODE
// ===========================

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    
    // Save preference
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('kanban-dark-mode', isDarkMode);
}

function loadThemePreference() {
    const isDarkMode = localStorage.getItem('kanban-dark-mode') === 'true';
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
}

// ===========================
// UTILITY FUNCTIONS
// ===========================

/**
 * Generate a unique ID for tasks
 * @returns {string} Unique ID
 */
function generateUniqueId() {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

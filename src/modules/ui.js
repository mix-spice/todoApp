import { format } from "date-fns";
import { Project } from "./project.js";
import { ToDo } from "./todo.js";
import { saveToLocalStorage, getFromLocalStorage } from "./storage.js";

const projectList = getFromLocalStorage("projects") || [];
let currentProjectIndex = 0;

// ✅ Ensure script runs after DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 App Loaded");
    initializeDefaultProject();
    setupEventListeners();
});

// ✅ Initialize Default Project
export function initializeDefaultProject() {
    let savedProjects = getFromLocalStorage("projects");

    if (savedProjects.length > 0) {
        projectList.length = 0;
        savedProjects.forEach(projectData => {
            let project = new Project(projectData.name);
            project.todos = projectData.todos.map(ToDo.fromJSON); // ✅ Ensure proper ToDo conversion
            projectList.push(project);
        });
    } else {
        projectList.push(new Project("Default Project"));
    }

    saveToLocalStorage("projects", projectList);
    updateProjectSidebar();
    loadCurrentProject();
}

// ✅ Load Selected Project
function loadCurrentProject() {
    if (!projectList[currentProjectIndex]) return;
    
    document.getElementById("currentProjectName").textContent = projectList[currentProjectIndex].name;
    renderTodos();
}
function renderTodos() {
    const toDoList = document.getElementById("toDoList");
    toDoList.innerHTML = "";

    const currentProject = projectList[currentProjectIndex];

    if (!currentProject.getTodos().length) {
        toDoList.innerHTML = `<p class="text-gray-500">No tasks yet. Add one!</p>`;
        return;
    }

    currentProject.getTodos().forEach(todo => {
        console.log(`🖥 Rendering Task: ${todo.title} - Due: ${todo.dueDate}`);

        const formattedDueDate = todo.dueDate
            ? format(new Date(todo.dueDate), "MM/dd/yyyy")
            : "No Due Date";

        const listItem = document.createElement("li");
        listItem.className = "flex justify-between items-center p-2 bg-[#1f1f1f] border-b border-gray-700 rounded text-white"; // ✅ Dark gray background

        listItem.innerHTML = `
            <span class="flex-1">${todo.title}</span>
            <span class="text-gray-400">${formattedDueDate}</span>
            <button class="delete text-red-500 ml-4" data-title="${todo.title}">❌</button>
        `;

        listItem.querySelector(".delete").addEventListener("click", () => {
            currentProject.removeToDo(todo.title);
            saveToLocalStorage("projects", projectList);
            renderTodos();
        });

        toDoList.appendChild(listItem);
    });
}


// ✅ Update Sidebar & Add Delete Buttons
function updateProjectSidebar() {
    const projectListElement = document.getElementById("projectList");
    projectListElement.innerHTML = "";

    projectList.forEach((project, index) => {
        const listItem = document.createElement("li");
        listItem.className = "flex justify-between items-center p-2 hover:bg-gray-700 rounded cursor-pointer";
        listItem.dataset.index = index;
        listItem.textContent = project.name;

        // ❌ Delete Button (Appears on Hover)
        const deleteButton = document.createElement("button");
        deleteButton.className = "text-red-500 hidden hover:text-red-700";
        deleteButton.innerHTML = "❌";
        deleteButton.addEventListener("click", (e) => {
            e.stopPropagation();
            deleteProject(index);
        });

        listItem.addEventListener("mouseenter", () => deleteButton.classList.remove("hidden"));
        listItem.addEventListener("mouseleave", () => deleteButton.classList.add("hidden"));

        listItem.addEventListener("click", () => {
            currentProjectIndex = index;
            loadCurrentProject();
        });

        listItem.appendChild(deleteButton);
        projectListElement.appendChild(listItem);
    });

    document.getElementById("currentProjectName").textContent = projectList[currentProjectIndex].name;
}

// ✅ Delete Project (Prevent Deleting Last Project)
function deleteProject(index) {
    if (projectList.length === 1) {
        alert("⚠ You must have at least one project.");
        return;
    }
    
    projectList.splice(index, 1);

    if (currentProjectIndex >= projectList.length) {
        currentProjectIndex = projectList.length - 1;
    }

    saveToLocalStorage("projects", projectList);
    updateProjectSidebar();
    loadCurrentProject();
}

// ✅ Setup Event Listeners
export function setupEventListeners() {
    const newProjectButton = document.getElementById("newProject");
    const addToDoForm = document.getElementById("addToDoForm");
    const dueDateInput = document.getElementById("toDoDate");

    // ✅ Set today's date as the placeholder value
    const today = new Date().toISOString().split("T")[0];
    dueDateInput.value = today; // ✅ Automatically sets today’s date

    if (!newProjectButton.dataset.listener) {
        newProjectButton.addEventListener("click", handleNewProject);
        newProjectButton.dataset.listener = "true"; 
    }

    if (!addToDoForm.dataset.listener) {
        addToDoForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const titleInput = document.getElementById("toDoTitle");

            if (!titleInput || !dueDateInput) {
                console.error("🚨 Error: Missing input fields in DOM!");
                return;
            }

            const title = titleInput.value.trim();
            const dueDate = dueDateInput.value.trim();

            console.log(`📌 Task Title: "${title}"`);
            console.log(`📅 Due Date: "${dueDate}"`);

            if (!title || !dueDate) {
                alert("⚠ Please enter a task name and due date!");
                return;
            }

            const newTask = new ToDo(title, dueDate);
            projectList[currentProjectIndex].addToDo(newTask);

            saveToLocalStorage("projects", projectList.map(project => ({
                name: project.name,
                todos: project.getTodos().map(todo => ({
                    title: todo.title,
                    dueDate: todo.dueDate
                }))
            })));

            renderTodos();
            addToDoForm.reset();
            dueDateInput.value = today; // ✅ Reset to today's date after submission
        });

        addToDoForm.dataset.listener = "true"; 
    }
}

// ✅ Function to handle project creation
function handleNewProject() {
    const projectName = prompt("Enter project name:");
    if (!projectName) return;

    if (projectList.some(project => project.name === projectName)) {
        alert("⚠ Project name already exists!");
        return;
    }

    // 🛠 Create new project and update the UI
    const newProject = new Project(projectName);
    projectList.push(newProject);
    saveToLocalStorage("projects", projectList);
    updateProjectSidebar();
    currentProjectIndex = projectList.length - 1;
    loadCurrentProject();
}

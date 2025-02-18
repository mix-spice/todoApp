import "./styles.css";  // ✅ Webpack will bundle this
import { initializeDefaultProject, setupEventListeners } from "./modules/ui.js";
import { format } from "date-fns";

document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 DOM Fully Loaded - Initializing App");
    initializeDefaultProject();
    setupEventListeners();
});

// Display formatted current date
document.getElementById("currentDate").textContent = format(new Date(), "EEEE, MMMM do");

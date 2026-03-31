// globals.js
// ==========================================
// 1) GLOBAL VARIABLES
// These hold our current state across all files
// ==========================================

let allGames = [];
let searchText = "";
let sortBy = "recent";
let minHours = 0;
let currentTab = "all";
let gamesPerPage = 15;

// Look for a saved theme in the browser before doing anything
if (localStorage.getItem("theme") === "light") {
  document.documentElement.setAttribute("data-theme", "light");
}

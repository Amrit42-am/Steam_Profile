// events.js
// ==========================================
// 4) ALL CLICKS AND EVENTS
// Connects buttons to their functions
// ==========================================

function setupAllEvents() {
  
  // Tab Buttons (All, Recent, Win, Mac, etc.)
  document.querySelectorAll(".tab-btn").forEach(function(button) {
    button.addEventListener("click", function() {
      // Remove 'active' format from all tabs
      document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
      
      button.classList.add("active");
      currentTab = button.dataset.section;
      gamesPerPage = 15;
      displayGames();
    });
  });

  // Search Textbox
  document.getElementById("search-bar").addEventListener("input", function() {
    searchText = this.value;
    gamesPerPage = 15;
    displayGames();
  });

  // Sort Menu
  document.getElementById("sort-select").addEventListener("change", function() {
    sortBy = this.value;
    gamesPerPage = 15;
    displayGames();
  });

  // Filter Panel Toggle Button
  let filterButton = document.getElementById("filter-btn");
  let filterPanel = document.getElementById("filter-panel");

  filterButton.addEventListener("click", function() {
    if (filterPanel.style.display === "none" || filterPanel.style.display === "") {
      filterPanel.style.display = "flex";
      filterButton.classList.remove("btn-secondary");
      filterButton.classList.add("btn-primary-light");
    } else {
      filterPanel.style.display = "none";
      filterButton.classList.remove("btn-primary-light");
      filterButton.classList.add("btn-secondary");
    }
  });

  // Minimum Playtime Slider
  let playtimeSlider = document.getElementById("min-playtime-range");
  let playtimeLabel = document.getElementById("min-playtime-val");

  playtimeSlider.addEventListener("input", function() {
    let selectedHours = parseInt(this.value);
    minHours = selectedHours * 60; // Convert to minutes
    playtimeLabel.textContent = selectedHours + "h+";
    gamesPerPage = 15;
    displayGames();
  });

  // Modal Closers
  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("modal-backdrop").addEventListener("click", function(event) {
    // Prevent clicking interior elements from closing the menu
    if (event.target.id === "modal-backdrop") {
      closeModal();
    }
  });

  // Dark/Light Theme Button
  document.getElementById("theme-toggle").addEventListener("click", function() {
    let isCurrentlyLight = (document.documentElement.getAttribute("data-theme") === "light");

    if (isCurrentlyLight) {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }

    updateThemeIcon();
  });
}

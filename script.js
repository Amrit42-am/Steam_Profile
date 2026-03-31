// ==========================================
// 1) GLOBAL VARIABLES
// These hold our current state across the app
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


// ==========================================
// 2) STARTUP (When the page loads)
// ==========================================
document.addEventListener("DOMContentLoaded", async function() {
  updateThemeIcon();
  
  // Attach all the clicks and inputs immediately
  setupAllEvents(); 

  let gameCountText = document.getElementById("game-count");
  gameCountText.textContent = "loading...";

  try {
    // We use async/await here because it is much simpler to read!
    // We ask for the profile and games, and "await" for them to arrive.
    let profileData = await fetchProfile();
    let gamesData = await fetchGames();

    // Save games to our global variable so we can search/sort them later
    allGames = gamesData;

    // Put them on the screen!
    displayProfile(profileData);
    displayGames();

  } catch (error) {
    console.log("Error loading data:", error);
    gameCountText.textContent = "error loading";
    document.getElementById("profile-name").textContent = "Could not load profile";
  }
});


// ==========================================
// 3) SHOW PROFILE
// Updates the top header with user information
// ==========================================
function displayProfile(profileData) {
  // Set images and texts using standard JavaScript
  document.getElementById("profile-avatar").src = profileData.avatarfull;
  document.getElementById("profile-name").textContent = profileData.personaname;
  document.getElementById("profile-joined").textContent = formatMonthYear(profileData.timecreated);
  document.getElementById("profile-country").textContent = profileData.loccountrycode || "—";
  document.getElementById("profile-id").textContent = profileData.steamid;
  document.getElementById("profile-link").href = profileData.profileurl;

  // Let's decide what word goes next to the status ball
  let statusNumber = profileData.personastate;
  let statusWord = "Offline";
  
  if (statusNumber === 1) statusWord = "Online";
  if (statusNumber === 2) statusWord = "Busy";
  if (statusNumber === 3) statusWord = "Away";
  if (statusNumber === 4) statusWord = "Snooze";
  if (statusNumber === 5) statusWord = "Looking to trade";
  if (statusNumber === 6) statusWord = "Looking to play";
  
  document.getElementById("profile-status-text").textContent = statusWord;

  // Make the dot green if they are online in any way (status 1-6)
  let dotColor = "hsl(0, 0%, 45%)"; // default gray
  if (statusNumber >= 1) {
    dotColor = "var(--steam-online)"; // green colored
  }
  
  document.getElementById("profile-status-indicator").style.backgroundColor = dotColor;
  document.getElementById("profile-status-dot-sm").style.backgroundColor = dotColor;

  // Show "Comments open" only if they allowed it
  if (profileData.commentpermission === 1) {
    document.getElementById("profile-comments").style.display = "flex";
  } else {
    document.getElementById("profile-comments").style.display = "none";
  }
}


// ==========================================
// 4) SHOW GAMES
// Filters, sorts, and draws the game cards
// ==========================================
function displayGames() {
  let gameGrid = document.getElementById("games-grid");
  let noGamesMessage = document.getElementById("no-games");
  let gameCountLabel = document.getElementById("game-count");

  // Clear what was there before
  gameGrid.innerHTML = "";

  // Figure out the time for "2 weeks ago"
  let currentTime = Math.floor(Date.now() / 1000);
  let twoWeeksAgo = currentTime - (60 * 60 * 24 * 14);

  // -- STEP 1: FILTERING --
  // We go through all games one by one. If we return true, it stays. False = hidden.
  let filteredGames = allGames.filter(function(game) {
    let gameName = (game.name || "").toLowerCase();
    let totalPlaytime = game.playtime_forever || 0;
    let lastPlayed = game.rtime_last_played || 0;

    // Check tabs
    if (currentTab === "recent" && lastPlayed < twoWeeksAgo) return false;
    if (currentTab === "never" && totalPlaytime > 0) return false;
    if (currentTab === "win" && !game.playtime_windows_forever) return false;
    if (currentTab === "mac" && !game.playtime_mac_forever) return false;
    if (currentTab === "linux" && !game.playtime_linux_forever) return false;
    if (currentTab === "deck" && !game.playtime_deck_forever) return false;
    if (currentTab === "disconnected" && !game.playtime_disconnected) return false;
    
    // Check search box
    if (!gameName.includes(searchText.toLowerCase())) return false;
    
    // Check minimum hours slider
    if (totalPlaytime < minHours) return false;

    // Passed all checks!
    return true;
  });

  // -- STEP 2: SORTING --
  if (sortBy === "name") {
    filteredGames.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === "playtime") {
    filteredGames.sort((a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0));
  } else {
    // Sort by recent by default
    filteredGames.sort((a, b) => (b.rtime_last_played || 0) - (a.rtime_last_played || 0));
  }

  // Record how many we found
  gameCountLabel.textContent = filteredGames.length + " games";

  // If nothing was found, show the "No Games" message
  if (filteredGames.length === 0) {
    gameGrid.style.display = "none";
    noGamesMessage.style.display = "block";
    return;
  }

  // Otherwise, let's display them
  gameGrid.style.display = "grid";
  noGamesMessage.style.display = "none";

  // Take only the first few games based on gamesPerPage
  let gamesToDisplay = filteredGames.slice(0, gamesPerPage);

  gamesToDisplay.forEach(function(game) {
    let card = document.createElement("button");
    card.className = "game-card";

    // Open the modal popup when clicked
    card.onclick = function() {
      openModal(game);
    };

    let imageUrl = "https://cdn.cloudflare.steamstatic.com/steam/apps/" + game.appid + "/header.jpg";

    /* 
      We use Backticks (`) here for string interpolation! 
      This is much easier to read than combining lots of strings with plus (+) signs. 
      Variables inside ${} are pulled in automatically.
    */
    card.innerHTML = `
      <div class="card-image-wrapper">
        <img src="${imageUrl}" alt="${game.name}" loading="lazy">
        <div class="card-gradient"></div>
        <h3 class="card-title">${game.name}</h3>
      </div>
      <div class="card-stats">
        <span class="card-stat">
          <img src="icons/wall-clock.png" class="icon" alt="time" width="12" height="12">
          ${formatPlaytime(game.playtime_forever)}
        </span>
        <span class="card-stat">
          <img src="icons/calendar (1).png" class="icon" alt="date" width="12" height="12">
          ${formatShortDate(game.rtime_last_played)}
        </span>
      </div>
    `;

    gameGrid.appendChild(card);
  });

  // -- STEP 3: "SHOW MORE" BUTTON --
  let showMoreDiv = document.getElementById("show-more-container");

  // Create it on the page if it doesn't exist
  if (!showMoreDiv) {
    showMoreDiv = document.createElement("div");
    showMoreDiv.id = "show-more-container";
    showMoreDiv.className = "show-more-container";
    gameGrid.parentNode.insertBefore(showMoreDiv, gameGrid.nextSibling);
  }

  if (filteredGames.length > gamesPerPage) {
    let remaining = Math.min(15, filteredGames.length - gamesPerPage);
    showMoreDiv.innerHTML = `<button id="show-more-btn" class="btn btn-secondary">Show ${remaining} More</button>`;
    showMoreDiv.style.display = "flex";

    // When clicked, add 15 more games
    document.getElementById("show-more-btn").addEventListener("click", function() {
      gamesPerPage += 15;
      displayGames();
    });
  } else {
    showMoreDiv.style.display = "none"; // Hide button if no more games
  }
}


// ==========================================
// 5) ALL CLICKS AND EVENTS
// Connects buttons to their functions
// ==========================================
function setupAllEvents() {
  
  // Tab Buttons (All, Recent, Win, Mac, etc.)
  document.querySelectorAll(".tab-btn").forEach(function(button) {
    button.addEventListener("click", function() {
      // Remove 'active' format from all tabs
      document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
      
      // Make this button active
      button.classList.add("active");
      
      currentTab = button.dataset.section;
      gamesPerPage = 15; // Reset the limit back to start
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
    // If hidden, show it
    if (filterPanel.style.display === "none" || filterPanel.style.display === "") {
      filterPanel.style.display = "flex";
      filterButton.classList.remove("btn-secondary");
      filterButton.classList.add("btn-primary-light");
    } else {
      // If showing, hide it
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
    minHours = selectedHours * 60; // We convert to minutes to match Steam API
    playtimeLabel.textContent = selectedHours + "h+";
    gamesPerPage = 15;
    displayGames();
  });

  // Modal Closers
  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("modal-backdrop").addEventListener("click", function(event) {
    // Only close if they click the deep dark background, not the dialog box
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


// ==========================================
// 6) HELPER FUNCTIONS
// Small tasks like formatting text and dates
// ==========================================

// Swaps the moon/sun icon
function updateThemeIcon() {
  let isLight = (document.documentElement.getAttribute("data-theme") === "light");
  document.getElementById("theme-icon-sun").style.display = isLight ? "none" : "block";
  document.getElementById("theme-icon-moon").style.display = isLight ? "block" : "none";
}

// Shows the detailed game screen
function openModal(game) {
  document.getElementById("modal-img").src = "https://cdn.cloudflare.steamstatic.com/steam/apps/" + game.appid + "/header.jpg";
  document.getElementById("modal-title").textContent = game.name;

  // Insert playtimes
  document.getElementById("modal-total-playtime").textContent = formatPlaytime(game.playtime_forever);
  document.getElementById("modal-win-playtime").textContent = formatPlaytime(game.playtime_windows_forever);
  document.getElementById("modal-mac-playtime").textContent = formatPlaytime(game.playtime_mac_forever);
  document.getElementById("modal-linux-playtime").textContent = formatPlaytime(game.playtime_linux_forever);
  document.getElementById("modal-deck-playtime").textContent = formatPlaytime(game.playtime_deck_forever);
  document.getElementById("modal-disconnected").textContent = formatPlaytime(game.playtime_disconnected);
  
  // Insert dates
  document.getElementById("modal-last-played").textContent = formatLongDate(game.rtime_last_played);

  // Show or hide community button, using a simple compact if/else format (ternary)
  document.getElementById("modal-community-btn").style.display = game.has_community_visible_stats ? "inline-flex" : "none";

  // Make it visible!
  document.getElementById("modal-backdrop").style.display = "flex";
  document.body.style.overflow = "hidden"; // Stops the background page from scrolling
}

// Hides the detailed game screen
function closeModal() {
  document.getElementById("modal-backdrop").style.display = "none";
  document.body.style.overflow = "auto";
}

// Turns total minutes into a nice "Xh Ym" format
function formatPlaytime(totalMinutes) {
  if (!totalMinutes || totalMinutes <= 0) return "—";

  if (totalMinutes < 60) {
    return totalMinutes + "m";
  }

  let hours = Math.floor(totalMinutes / 60);
  let minutes = totalMinutes % 60;

  if (minutes > 0) {
    return hours + "h " + minutes + "m";
  } else {
    return hours + "h";
  }
}

// Turns timestamps into "Jan 12"
function formatShortDate(timestamp) {
  if (!timestamp) return "—";
  let date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Turns timestamps into "January 12, 2024"
function formatLongDate(timestamp) {
  if (!timestamp) return "—";
  let date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// Turns timestamps into "Jan 2024"
function formatMonthYear(timestamp) {
  if (!timestamp) return "—";
  let date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

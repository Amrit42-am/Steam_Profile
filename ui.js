// ui.js
// ==========================================
// 3) USER INTERFACE
// Functions that update the screen/HTML
// ==========================================

// Updates the top header with user information
function displayProfile(profileData) {
  document.getElementById("profile-avatar").src = profileData.avatarfull;
  document.getElementById("profile-name").textContent = profileData.personaname;
  document.getElementById("profile-joined").textContent = formatMonthYear(profileData.timecreated);
  document.getElementById("profile-country").textContent = profileData.loccountrycode || "—";
  document.getElementById("profile-id").textContent = profileData.steamid;
  document.getElementById("profile-link").href = profileData.profileurl;

  // Decide what word goes next to the status ball
  let statusNumber = profileData.personastate;
  let statusWord = "Offline";
  
  if (statusNumber === 1) statusWord = "Online";
  if (statusNumber === 2) statusWord = "Busy";
  if (statusNumber === 3) statusWord = "Away";
  if (statusNumber === 4) statusWord = "Snooze";
  if (statusNumber === 5) statusWord = "Looking to trade";
  if (statusNumber === 6) statusWord = "Looking to play";
  
  document.getElementById("profile-status-text").textContent = statusWord;

  // Make the dot green if they are online (status 1-6)
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

// Filters, sorts, and draws the game cards
function displayGames() {
  let gameGrid = document.getElementById("games-grid");
  let noGamesMessage = document.getElementById("no-games");
  let gameCountLabel = document.getElementById("game-count");

  gameGrid.innerHTML = ""; // Clear existing grid

  let currentTime = Math.floor(Date.now() / 1000);
  let twoWeeksAgo = currentTime - (60 * 60 * 24 * 14);

  // -- FILTERING --
  let filteredGames = allGames.filter(function(game) {
    let gameName = (game.name || "").toLowerCase();
    let totalPlaytime = game.playtime_forever || 0;
    let lastPlayed = game.rtime_last_played || 0;

    if (currentTab === "recent" && lastPlayed < twoWeeksAgo) return false;
    if (currentTab === "never" && totalPlaytime > 0) return false;
    if (currentTab === "win" && !game.playtime_windows_forever) return false;
    if (currentTab === "mac" && !game.playtime_mac_forever) return false;
    if (currentTab === "linux" && !game.playtime_linux_forever) return false;
    if (currentTab === "deck" && !game.playtime_deck_forever) return false;
    if (currentTab === "disconnected" && !game.playtime_disconnected) return false;
    
    if (!gameName.includes(searchText.toLowerCase())) return false;
    if (totalPlaytime < minHours) return false;

    return true; // Game passed all filters!
  });

  // -- SORTING --
  if (sortBy === "name") {
    filteredGames.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === "playtime") {
    filteredGames.sort((a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0));
  } else {
    filteredGames.sort((a, b) => (b.rtime_last_played || 0) - (a.rtime_last_played || 0));
  }

  gameCountLabel.textContent = filteredGames.length + " games";

  if (filteredGames.length === 0) {
    gameGrid.style.display = "none";
    noGamesMessage.style.display = "block";
    return;
  }

  gameGrid.style.display = "grid";
  noGamesMessage.style.display = "none";

  let gamesToDisplay = filteredGames.slice(0, gamesPerPage);

  gamesToDisplay.forEach(function(game) {
    let card = document.createElement("button");
    card.className = "game-card";

    card.onclick = function() {
      openModal(game);
    };

    let imageUrl = "https://cdn.cloudflare.steamstatic.com/steam/apps/" + game.appid + "/header.jpg";

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

  // -- "SHOW MORE" BUTTON --
  let showMoreDiv = document.getElementById("show-more-container");

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

    document.getElementById("show-more-btn").addEventListener("click", function() {
      gamesPerPage += 15;
      displayGames();
    });
  } else {
    showMoreDiv.style.display = "none";
  }
}

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

  document.getElementById("modal-total-playtime").textContent = formatPlaytime(game.playtime_forever);
  document.getElementById("modal-win-playtime").textContent = formatPlaytime(game.playtime_windows_forever);
  document.getElementById("modal-mac-playtime").textContent = formatPlaytime(game.playtime_mac_forever);
  document.getElementById("modal-linux-playtime").textContent = formatPlaytime(game.playtime_linux_forever);
  document.getElementById("modal-deck-playtime").textContent = formatPlaytime(game.playtime_deck_forever);
  document.getElementById("modal-disconnected").textContent = formatPlaytime(game.playtime_disconnected);
  
  document.getElementById("modal-last-played").textContent = formatLongDate(game.rtime_last_played);
  document.getElementById("modal-community-btn").style.display = game.has_community_visible_stats ? "inline-flex" : "none";

  document.getElementById("modal-backdrop").style.display = "flex";
  document.body.style.overflow = "hidden";
}

// Hides the detailed game screen
function closeModal() {
  document.getElementById("modal-backdrop").style.display = "none";
  document.body.style.overflow = "auto";
}

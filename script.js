var allGames = [];
var searchText = "";
var sortBy = "recent";
var minHours = 0;
var currentTab = "all";
var gamesPerPage = 15;

if (localStorage.getItem("theme") === "light") {
  document.documentElement.setAttribute("data-theme", "light");
}

document.addEventListener("DOMContentLoaded", function() {
  updateThemeIcon();
  setupAllEvents();

  document.getElementById("game-count").textContent = "loading...";

  Promise.all([fetchProfile(), fetchGames()])
    .then(function(results) {
      allGames = results[1];
      displayProfile(results[0]);
      displayGames();
    })
    .catch(function(error) {
      console.log("Error loading data:", error);
      document.getElementById("game-count").textContent = "error loading";
      document.getElementById("profile-name").textContent = "Could not load profile";
    });
});

function displayProfile(profileData) {
  document.getElementById("profile-avatar").src = profileData.avatarfull;
  document.getElementById("profile-name").textContent = profileData.personaname;
  document.getElementById("profile-joined").textContent = formatMonthYear(profileData.timecreated);
  document.getElementById("profile-country").textContent = profileData.loccountrycode || "—";
  document.getElementById("profile-id").textContent = profileData.steamid;
  document.getElementById("profile-link").href = profileData.profileurl;

  // Convert status number to label
  var statusNumber = profileData.personastate;
  var statusWord = "Offline";
  if (statusNumber === 1) statusWord = "Online";
  else if (statusNumber === 2) statusWord = "Busy";
  else if (statusNumber === 3) statusWord = "Away";
  else if (statusNumber === 4) statusWord = "Snooze";
  else if (statusNumber === 5) statusWord = "Looking to trade";
  else if (statusNumber === 6) statusWord = "Looking to play";
  document.getElementById("profile-status-text").textContent = statusWord;

  var dotColor;
  if (statusNumber >= 1) {
    dotColor = "var(--steam-online)";
  } else {
    dotColor = "hsl(0, 0%, 45%)";
  }
  document.getElementById("profile-status-indicator").style.backgroundColor = dotColor;
  document.getElementById("profile-status-dot-sm").style.backgroundColor = dotColor;

  if (profileData.commentpermission === 1) {
    document.getElementById("profile-comments").style.display = "flex";
  } else {
    document.getElementById("profile-comments").style.display = "none";
  }
}

function displayGames() {
  var gameGrid = document.getElementById("games-grid");
  var noGamesMessage = document.getElementById("no-games");
  var gameCountLabel = document.getElementById("game-count");

  gameGrid.innerHTML = "";

  var currentTime = Math.floor(Date.now() / 1000);
  var twoWeeksAgo = currentTime - (60 * 60 * 24 * 14);

  var filteredGames = allGames.filter(function(game) {
    var gameName = (game.name || "").toLowerCase();
    var totalPlaytime = game.playtime_forever || 0;
    var lastPlayed = game.rtime_last_played || 0;

    if (currentTab === "recent" && lastPlayed < twoWeeksAgo) return false;
    if (currentTab === "never" && totalPlaytime > 0) return false;
    if (currentTab === "win" && !game.playtime_windows_forever) return false;
    if (currentTab === "mac" && !game.playtime_mac_forever) return false;
    if (currentTab === "linux" && !game.playtime_linux_forever) return false;
    if (currentTab === "deck" && !game.playtime_deck_forever) return false;
    if (currentTab === "disconnected" && !game.playtime_disconnected) return false;
    if (!gameName.includes(searchText.toLowerCase())) return false;
    if (totalPlaytime < minHours) return false;

    return true;
  });

  if (sortBy === "name") {
    filteredGames.sort(function(a, b) {
      return a.name.localeCompare(b.name);
    });
  } else if (sortBy === "playtime") {
    filteredGames.sort(function(a, b) {
      return (b.playtime_forever || 0) - (a.playtime_forever || 0);
    });
  } else {
    filteredGames.sort(function(a, b) {
      return (b.rtime_last_played || 0) - (a.rtime_last_played || 0);
    });
  }

  gameCountLabel.textContent = filteredGames.length + " games";

  if (filteredGames.length === 0) {
    gameGrid.style.display = "none";
    noGamesMessage.style.display = "block";
    return;
  }

  gameGrid.style.display = "grid";
  noGamesMessage.style.display = "none";

  var gamesToDisplay = filteredGames.slice(0, gamesPerPage);

  gamesToDisplay.forEach(function(game) {
    var card = document.createElement("button");
    card.className = "game-card";

    card.onclick = function() {
      openModal(game);
    };

    var imageUrl = "https://cdn.cloudflare.steamstatic.com/steam/apps/" + game.appid + "/header.jpg";

    card.innerHTML =
      '<div class="card-image-wrapper">' +
        '<img src="' + imageUrl + '" alt="' + game.name + '" loading="lazy">' +
        '<div class="card-gradient"></div>' +
        '<h3 class="card-title">' + game.name + '</h3>' +
      '</div>' +
      '<div class="card-stats">' +
        '<span class="card-stat"><img src="icons/wall-clock.png" class="icon" alt="time" width="12" height="12"> ' + formatPlaytime(game.playtime_forever) + '</span>' +
        '<span class="card-stat"><img src="icons/calendar (1).png" class="icon" alt="date" width="12" height="12"> ' + formatShortDate(game.rtime_last_played) + '</span>' +
      '</div>';

    gameGrid.appendChild(card);
  });

  var showMoreDiv = document.getElementById("show-more-container");

  if (!showMoreDiv) {
    showMoreDiv = document.createElement("div");
    showMoreDiv.id = "show-more-container";
    showMoreDiv.className = "show-more-container";
    gameGrid.parentNode.insertBefore(showMoreDiv, gameGrid.nextSibling);
  }

  if (filteredGames.length > gamesPerPage) {
    var remaining = Math.min(15, filteredGames.length - gamesPerPage);
    showMoreDiv.innerHTML = '<button id="show-more-btn" class="btn btn-secondary">Show ' + remaining + ' More</button>';
    showMoreDiv.style.display = "flex";

    document.getElementById("show-more-btn").addEventListener("click", function() {
      gamesPerPage = gamesPerPage + 15;
      displayGames();
    });
  } else {
    showMoreDiv.style.display = "none";
  }
}

function setupAllEvents() {
  document.querySelectorAll(".tab-btn").forEach(function(button) {
    button.addEventListener("click", function() {
      document.querySelectorAll(".tab-btn").forEach(function(btn) {
        btn.classList.remove("active");
      });

      button.classList.add("active");
      currentTab = button.dataset.section;
      gamesPerPage = 15;
      displayGames();
    });
  });

  document.getElementById("search-bar").addEventListener("input", function() {
    searchText = this.value;
    gamesPerPage = 15;
    displayGames();
  });

  document.getElementById("sort-select").addEventListener("change", function() {
    sortBy = this.value;
    gamesPerPage = 15;
    displayGames();
  });

  var filterButton = document.getElementById("filter-btn");
  var filterPanel = document.getElementById("filter-panel");

  filterButton.addEventListener("click", function() {
    if (filterPanel.style.display === "none") {
      filterPanel.style.display = "flex";
      filterButton.classList.remove("btn-secondary");
      filterButton.classList.add("btn-primary-light");
    } else {
      filterPanel.style.display = "none";
      filterButton.classList.remove("btn-primary-light");
      filterButton.classList.add("btn-secondary");
    }
  });

  var playtimeSlider = document.getElementById("min-playtime-range");
  var playtimeLabel = document.getElementById("min-playtime-val");

  playtimeSlider.addEventListener("input", function() {
    var selectedHours = parseInt(this.value);
    minHours = selectedHours * 60; // stored in minutes
    playtimeLabel.textContent = selectedHours + "h+";
    gamesPerPage = 15;
    displayGames();
  });

  document.getElementById("modal-close").addEventListener("click", closeModal);

  document.getElementById("modal-backdrop").addEventListener("click", function(event) {
    if (event.target.id === "modal-backdrop") {
      closeModal();
    }
  });

  document.getElementById("theme-toggle").addEventListener("click", function() {
    var isCurrentlyLight = document.documentElement.getAttribute("data-theme") === "light";

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

function updateThemeIcon() {
  var isLight = document.documentElement.getAttribute("data-theme") === "light";

  if (isLight) {
    document.getElementById("theme-icon-sun").style.display = "none";
    document.getElementById("theme-icon-moon").style.display = "block";
  } else {
    document.getElementById("theme-icon-sun").style.display = "block";
    document.getElementById("theme-icon-moon").style.display = "none";
  }
}

function openModal(game) {
  var imageUrl = "https://cdn.cloudflare.steamstatic.com/steam/apps/" + game.appid + "/header.jpg";

  document.getElementById("modal-img").src = imageUrl;
  document.getElementById("modal-title").textContent = game.name;

  document.getElementById("modal-total-playtime").textContent = formatPlaytime(game.playtime_forever);
  document.getElementById("modal-win-playtime").textContent = formatPlaytime(game.playtime_windows_forever);
  document.getElementById("modal-mac-playtime").textContent = formatPlaytime(game.playtime_mac_forever);
  document.getElementById("modal-linux-playtime").textContent = formatPlaytime(game.playtime_linux_forever);
  document.getElementById("modal-deck-playtime").textContent = formatPlaytime(game.playtime_deck_forever);

  document.getElementById("modal-disconnected").textContent = formatPlaytime(game.playtime_disconnected);
  document.getElementById("modal-last-played").textContent = formatLongDate(game.rtime_last_played);

  if (game.has_community_visible_stats) {
    document.getElementById("modal-community-btn").style.display = "inline-flex";
  } else {
    document.getElementById("modal-community-btn").style.display = "none";
  }

  document.getElementById("modal-backdrop").style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("modal-backdrop").style.display = "none";
  document.body.style.overflow = "auto";
}

function formatPlaytime(totalMinutes) {
  if (!totalMinutes || totalMinutes === 0) return "—";

  if (totalMinutes < 60) {
    return totalMinutes + "m";
  }

  var hours = Math.floor(totalMinutes / 60);
  var minutes = totalMinutes % 60;

  if (minutes > 0) {
    return hours + "h " + minutes + "m";
  } else {
    return hours + "h";
  }
}

function formatShortDate(timestamp) {
  if (!timestamp) return "—";
  var date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatLongDate(timestamp) {
  if (!timestamp) return "—";
  var date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function formatMonthYear(timestamp) {
  if (!timestamp) return "—";
  var date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

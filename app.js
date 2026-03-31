// app.js
// ==========================================
// 5) STARTUP
// Runs as soon as the HTML page is finished loading
// ==========================================

document.addEventListener("DOMContentLoaded", async function() {
  updateThemeIcon();      // Check dark/light mode
  setupAllEvents();       // Connect all buttons

  let gameCountText = document.getElementById("game-count");
  gameCountText.textContent = "loading...";

  try {
    // Fetch profile and games at the same time
    let profileData = await fetchProfile();
    let gamesData = await fetchGames();

    // Save global games list
    allGames = gamesData;

    // Output to screen
    displayProfile(profileData);
    displayGames();

  } catch (error) {
    console.log("Error loading data:", error);
    gameCountText.textContent = "error loading";
    document.getElementById("profile-name").textContent = "Could not load profile";
  }
});

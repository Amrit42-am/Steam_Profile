/* api.js — Fetches Steam data from local Python proxy */

function fetchProfile() {
  return fetch("/api/profile").then(function(response) {
    return response.json();
  });
}

function fetchGames() {
  return fetch("/api/games").then(function(response) {
    return response.json();
  });
}
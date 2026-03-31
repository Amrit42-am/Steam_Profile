// utils.js
// ==========================================
// 2) HELPER FUNCTIONS
// Small tasks like formatting text and dates
// ==========================================

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

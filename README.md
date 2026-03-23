# Steam Profile Viewer

A simple web project that fetches data from the **Steam Web API** and shows:

- Steam profile information
- Owned games list
- Total/individual game play time
- Search, filter, and sort controls
- Dark/Light mode toggle

This project is currently focused on the core fetch + UI experience.

---

## Features

- **Profile Fetching**
	- Fetches and displays Steam user profile details (name, avatar, profile link, etc.).

- **Games + Playtime**
	- Fetches owned games for a profile.
	- Displays game playtime (for example, in minutes/hours).

- **Search**
	- Search games by name.

- **Filter**
	- Filter game list based on selected rules (for example: played/unplayed or minimum playtime).

- **Sort**
	- Sort games by name or playtime (ascending/descending).

- **Theme Toggle**
	- Dark mode and Light mode switch.

---

## How It Works

1. User enters a Steam profile identifier (such as SteamID64).
2. App calls Steam Web API endpoints.
3. Profile and games data are parsed.
4. UI renders profile details and games with playtime.
5. Search/filter/sort are applied on the fetched data.

---

## Steam Web API

This project uses Steam Web API data for:

- Player profile summary
- Owned games and playtime

> You need a valid Steam Web API key to run the app.

---

## Getting Started

### 1) Clone the repository

```bash
git clone https://github.com/your-username/Steam_Profile.git
cd Steam_Profile
```

### 2) Add your API key

Create an environment/config file (based on your implementation) and add:

```env
STEAM_API_KEY=your_steam_web_api_key
```

### 3) Run the project

Run using your project setup (for example, static server or framework dev server).

---

## Current Scope

Implemented for now:

- Profile fetch and display
- Games + playtime display
- Search, filter, sort
- Dark/Light mode

---

## Future Improvements

- Pagination for very large game libraries
- Better loading/error states
- Caching API responses
- Charts for playtime analytics
- Mobile UI improvements

---

## License

This project is licensed under the terms in [LICENSE](LICENSE).


#!/usr/bin/env python3
"""
Steam Profile – Minimal proxy server
Run: python3 proxy.py
Open: http://localhost:8080
"""
import http.server, urllib.request, urllib.parse, json, os, re

PORT = 8080

# Read config.js for API key and Steam ID
cfg_path = os.path.join(os.path.dirname(__file__), "config.js")
config_text = open(cfg_path).read()
API_KEY = re.search(r'STEAM_API_KEY:\s*"([^"]+)"', config_text).group(1)
STEAM_ID = re.search(r'STEAM_ID:\s*"([^"]+)"', config_text).group(1)

STEAM_BASE = "https://api.steampowered.com"

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/profile":
            self._proxy(f"{STEAM_BASE}/ISteamUser/GetPlayerSummaries/v2/?key={API_KEY}&steamids={STEAM_ID}",
                        lambda d: d["response"]["players"][0])
        elif self.path == "/api/games":
            self._proxy(f"{STEAM_BASE}/IPlayerService/GetOwnedGames/v1/?key={API_KEY}&steamid={STEAM_ID}&include_appinfo=true&include_played_free_games=true",
                        lambda d: d["response"].get("games", []))
        else:
            super().do_GET()

    def _proxy(self, url, extract):
        try:
            with urllib.request.urlopen(url) as r:
                data = extract(json.loads(r.read()))
            body = json.dumps(data).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(body)
        except Exception as e:
            self.send_error(500, str(e))

    def log_message(self, fmt, *args):
        pass  # Silent

print(f"\n  🎮  Steam Profile running at  http://localhost:{PORT}\n")
http.server.HTTPServer(("", PORT), Handler).serve_forever()

# 🎵 Spotify Dev Lab

A full-featured PWA for testing and exploring the Spotify Web API. Built with React + Vite, deployable to Vercel in minutes.

![Spotify Dev Lab](https://img.shields.io/badge/Spotify-API%20v1-1db954?style=flat&logo=spotify)
![PWA](https://img.shields.io/badge/PWA-Ready-blue?style=flat)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat&logo=vercel)

## ✨ Features

| Feature | Description |
|---|---|
| **API Explorer** | Browse & test 40+ endpoints across all Spotify API categories |
| **Live Dashboard** | Real-time playback state, top artists/tracks, audio features |
| **Audio Visualizer** | Radar chart, waveform, pitch wheel, feature comparison |
| **Request History** | Full log with replay, export to JSON, favorites |
| **PKCE Auth** | Secure OAuth 2.0 with PKCE — no backend required |
| **PWA** | Installable as desktop/mobile app |
| **Dark Terminal UI** | Custom design with Space Mono + Syne typography |

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/spotify-dev-lab.git
cd spotify-dev-lab
npm install
```

### 2. Create a Spotify App

1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Click **Create app**
3. Fill in app name and description
4. Add Redirect URI: `http://localhost:5173/callback`
5. Check **Web API** under APIs used
6. Save and copy your **Client ID**

### 3. Configure Environment

Create a `.env.local` file:

```env
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_REDIRECT_URI=http://localhost:5173/callback
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), enter your Client ID on the home page, and click **Connect with Spotify**.

## ☁️ Deploy to Vercel

### Option A: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/spotify-dev-lab)

### Option B: Manual Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add VITE_SPOTIFY_CLIENT_ID
vercel env add VITE_REDIRECT_URI
```

### Vercel Environment Variables

In your Vercel dashboard → Project → Settings → Environment Variables:

| Variable | Value |
|---|---|
| `VITE_SPOTIFY_CLIENT_ID` | Your Spotify Client ID |
| `VITE_REDIRECT_URI` | `https://your-app.vercel.app/callback` |

### Update Spotify App Redirect URI

Add your Vercel URL to Spotify app settings:
```
https://your-app.vercel.app/callback
```

## 🗂️ Project Structure

```
spotify-dev-lab/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Layout.jsx        # Sidebar navigation
│   │   ├── Home.jsx          # Landing + setup wizard
│   │   ├── Explorer.jsx      # API endpoint browser
│   │   ├── Dashboard.jsx     # Live playback dashboard
│   │   ├── Visualizer.jsx    # Audio feature visualizer
│   │   ├── History.jsx       # Request history & replay
│   │   └── Callback.jsx      # OAuth callback handler
│   ├── utils/
│   │   ├── spotify.js        # Auth (PKCE) + API fetch wrapper
│   │   ├── storage.js        # History, favorites, collections
│   │   └── endpoints.js      # Endpoint catalog
│   ├── styles/
│   │   └── global.css
│   ├── App.jsx
│   └── main.jsx
├── vite.config.js            # Vite + PWA config
├── vercel.json               # Vercel SPA routing
└── package.json
```

## 🔐 Scopes Requested

```
user-read-private, user-read-email,
user-read-playback-state, user-modify-playback-state,
user-read-currently-playing, user-read-recently-played,
user-top-read, user-library-read, user-library-modify,
playlist-read-private, playlist-read-collaborative,
playlist-modify-public, playlist-modify-private,
streaming, app-remote-control,
user-follow-read, user-follow-modify
```

## 🎛️ API Endpoints Covered

- **User Profile** — Profile, top artists, top tracks, followed artists
- **Playback** — Current state, devices, queue, recently played, play/pause/skip/volume/shuffle
- **Search** — Tracks, artists, albums, by genre, by year
- **Tracks** — Details, audio features, audio analysis, recommendations
- **Artists** — Details, top tracks, albums, related artists
- **Albums** — Details, tracks, new releases, saved albums
- **Playlists** — User playlists, featured, browse categories
- **Markets & Misc** — Markets, shows, episodes, genre seeds

## 🛠️ Tech Stack

- **React 18** — UI framework
- **React Router v6** — Client-side routing
- **Vite** — Build tool
- **vite-plugin-pwa** — PWA / service worker
- **Spotify Web API** — Data source
- **PKCE OAuth 2.0** — Secure auth (no backend)

## 📄 License

MIT — feel free to fork and customize!

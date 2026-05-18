export const ENDPOINTS = {
  'User Profile': [
    { method: 'GET', endpoint: '/me', label: 'Current User Profile', description: 'Get detailed profile information about the current user' },
    { method: 'GET', endpoint: '/me/top/artists?time_range=medium_term&limit=20', label: 'Top Artists', description: 'Get top artists for current user' },
    { method: 'GET', endpoint: '/me/top/tracks?time_range=medium_term&limit=20', label: 'Top Tracks', description: 'Get top tracks for current user' },
    { method: 'GET', endpoint: '/me/following?type=artist', label: 'Followed Artists', description: 'Get artists followed by current user' },
  ],
  'Playback': [
    { method: 'GET', endpoint: '/me/player', label: 'Current Playback', description: 'Get information about the current playback' },
    { method: 'GET', endpoint: '/me/player/currently-playing', label: 'Currently Playing', description: 'Get currently playing track' },
    { method: 'GET', endpoint: '/me/player/devices', label: 'Available Devices', description: 'Get available Spotify devices' },
    { method: 'GET', endpoint: '/me/player/queue', label: 'Playback Queue', description: 'Get current playback queue' },
    { method: 'GET', endpoint: '/me/player/recently-played?limit=20', label: 'Recently Played', description: 'Get recently played tracks' },
    { method: 'PUT', endpoint: '/me/player/play', label: 'Start/Resume Playback', description: 'Start or resume playback', body: '{}' },
    { method: 'PUT', endpoint: '/me/player/pause', label: 'Pause Playback', description: 'Pause playback' },
    { method: 'POST', endpoint: '/me/player/next', label: 'Skip to Next', description: 'Skip to next track' },
    { method: 'POST', endpoint: '/me/player/previous', label: 'Skip to Previous', description: 'Skip to previous track' },
    { method: 'PUT', endpoint: '/me/player/shuffle?state=true', label: 'Toggle Shuffle', description: 'Toggle shuffle mode' },
    { method: 'PUT', endpoint: '/me/player/repeat?state=track', label: 'Set Repeat Mode', description: 'Set repeat mode (track/context/off)' },
    { method: 'PUT', endpoint: '/me/player/volume?volume_percent=50', label: 'Set Volume', description: 'Set volume for current playback' },
  ],
  'Search': [
    { method: 'GET', endpoint: '/search?q=radiohead&type=artist,album,track&limit=10', label: 'Search', description: 'Search for tracks, artists, albums, playlists' },
    { method: 'GET', endpoint: '/search?q=genre:jazz&type=track&limit=20', label: 'Search by Genre', description: 'Search tracks by genre' },
    { method: 'GET', endpoint: '/search?q=year:2024&type=album&limit=10', label: 'Search by Year', description: 'Search albums by release year' },
  ],
  'Tracks': [
    { method: 'GET', endpoint: '/tracks/4cOdK2wGLETKBW3PvgPWqT', label: 'Get Track', description: 'Get a specific track by ID' },
    { method: 'GET', endpoint: '/audio-features/4cOdK2wGLETKBW3PvgPWqT', label: 'Audio Features', description: 'Get audio features for a track' },
    { method: 'GET', endpoint: '/audio-analysis/4cOdK2wGLETKBW3PvgPWqT', label: 'Audio Analysis', description: 'Get detailed audio analysis for a track' },
    { method: 'GET', endpoint: '/recommendations?seed_genres=rock&limit=10', label: 'Recommendations', description: 'Get track recommendations' },
    { method: 'GET', endpoint: '/me/tracks?limit=20', label: 'Saved Tracks', description: 'Get user saved tracks' },
  ],
  'Artists': [
    { method: 'GET', endpoint: '/artists/0OdUWJ0sBjDrqHygGUXeCF', label: 'Get Artist', description: 'Get artist details (Band of Horses)' },
    { method: 'GET', endpoint: '/artists/0OdUWJ0sBjDrqHygGUXeCF/top-tracks?market=US', label: 'Artist Top Tracks', description: 'Get top tracks for an artist' },
    { method: 'GET', endpoint: '/artists/0OdUWJ0sBjDrqHygGUXeCF/albums?limit=10', label: 'Artist Albums', description: 'Get albums for an artist' },
    { method: 'GET', endpoint: '/artists/0OdUWJ0sBjDrqHygGUXeCF/related-artists', label: 'Related Artists', description: 'Get related artists' },
  ],
  'Albums': [
    { method: 'GET', endpoint: '/albums/4aawyAB9vmqN3uQ7FjRGTy', label: 'Get Album', description: 'Get album details' },
    { method: 'GET', endpoint: '/albums/4aawyAB9vmqN3uQ7FjRGTy/tracks?limit=20', label: 'Album Tracks', description: 'Get tracks from an album' },
    { method: 'GET', endpoint: '/me/albums?limit=20', label: 'Saved Albums', description: 'Get user saved albums' },
    { method: 'GET', endpoint: '/new-releases?limit=10', label: 'New Releases', description: 'Get newly released albums' },
  ],
  'Playlists': [
    { method: 'GET', endpoint: '/me/playlists?limit=20', label: 'My Playlists', description: 'Get user playlists' },
    { method: 'GET', endpoint: '/playlists/37i9dQZF1DXcBWIGoYBM5M', label: 'Get Playlist', description: 'Get a specific playlist' },
    { method: 'GET', endpoint: '/playlists/37i9dQZF1DXcBWIGoYBM5M/tracks?limit=20', label: 'Playlist Tracks', description: 'Get tracks in a playlist' },
    { method: 'GET', endpoint: '/featured-playlists?limit=10', label: 'Featured Playlists', description: 'Get featured playlists' },
    { method: 'GET', endpoint: '/categories?limit=20', label: 'Browse Categories', description: 'Get available categories' },
  ],
  'Markets & Misc': [
    { method: 'GET', endpoint: '/markets', label: 'Available Markets', description: 'Get list of available markets' },
    { method: 'GET', endpoint: '/me/episodes?limit=20', label: 'Saved Episodes', description: 'Get user saved episodes' },
    { method: 'GET', endpoint: '/me/shows?limit=20', label: 'Saved Shows', description: 'Get user saved shows' },
    { method: 'GET', endpoint: '/genres', label: 'Recommendation Genres', description: 'Get available genre seeds' },
  ]
}

export const VARIABLES = {
  '{track_id}': '4cOdK2wGLETKBW3PvgPWqT',
  '{artist_id}': '0OdUWJ0sBjDrqHygGUXeCF',
  '{album_id}': '4aawyAB9vmqN3uQ7FjRGTy',
  '{playlist_id}': '37i9dQZF1DXcBWIGoYBM5M',
  '{market}': 'US',
  '{limit}': '20',
  '{offset}': '0',
}

export const METHOD_COLORS = {
  GET: '#1db954',
  POST: '#4a9eff',
  PUT: '#ffd700',
  DELETE: '#ff4444',
  PATCH: '#ff6b2b'
}

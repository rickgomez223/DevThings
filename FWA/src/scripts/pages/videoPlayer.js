import {
  database,
  databaseRef as ref,
  get,
  analytics,
  logEvent,
} from "https://rickgomez223.netlify.app/firebase/firebaseConfig.js";

// Function to fetch the playlist ID from Firebase
// Function to fetch the playlist ID from Firebase
async function getPlaylistId() {
  try {
    // Reference to user playlist
    const userPlaylistRef = ref(database, `user/settings/userPlaylist`);
    // Reference to default playlist if none is set by user
    const defaultPlaylistRef = ref(database, `user/settings/defaultPlaylist`);

    // Attempt to get the user playlist
    const userSnapshot = await get(userPlaylistRef);

    if (userSnapshot.exists() && userSnapshot.val()) {
      return userSnapshot.val().playlistId; // Return only the playlistId
    } else {
      // If userPlaylist doesn't exist or has no value, check for defaultPlaylist
      const defaultSnapshot = await get(defaultPlaylistRef);

      if (defaultSnapshot.exists()) {
        return defaultSnapshot.val().playlistId; // Return only the playlistId
      } else {
        console.warn(
          "Neither userPlaylist nor defaultPlaylist exists in Firebase."
        );
        return "PLPWAY3oXfm0VF9PuFptwCmzfQJjTfSsn4"; // Fallback default if neither exists
      }
    }
  } catch (error) {
    console.error("Error fetching playlist ID from Firebase:", error);
    return "PLPWAY3oXfm0VF9PuFptwCmzfQJjTfSsn4"; // Return hardcoded default if there's an error
  }
}

// Usage: Set the result of getPlaylistId to the playlistId variable
async function setPlaylistId() {
  const playlistId = await getPlaylistId();
  console.log("Resolved Playlist ID:", playlistId);
  // Now you can use playlistId in your code
}

// API Key for YouTube Data API
const ytAPIKey = "AIzaSyCVxTLhIoLiq1omD8fFDJ8HHkA7CibhXHA";
const queryCount = 12;

// Function to fetch and display videos from the playlist
async function fetchAndDisplayVideos() {
  try {
    const playlistId = await getPlaylistId();
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${queryCount}&playlistId=${playlistId}&key=${ytAPIKey}`
    );
    const data = await response.json();

    const videoGallery = document.getElementById("videoGallery");
    videoGallery.innerHTML = ""; // Clear existing content

    data.items.forEach((item) => {
      const videoId = item.snippet.resourceId.videoId;
      const videoItem = document.createElement("div");
      videoItem.className = "videoItem";

      const iframe = document.createElement("iframe");
      iframe.id = `player-${videoId}`;
      iframe.src = generateYouTubeEmbedURL(videoId);
      iframe.frameBorder = "0";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      iframe.style.width = "100%";
      iframe.style.height = "100%";

      videoItem.appendChild(iframe);
      videoGallery.appendChild(videoItem);
    });
  } catch (error) {
    console.error("Error fetching videos from the playlist:", error);
  }
}

// Helper function to generate YouTube embed URL with desired parameters
function generateYouTubeEmbedURL(videoId) {
  const baseUrl = `https://www.youtube.com/embed/${videoId}`;
  const params = new URLSearchParams({
    rel: "0",
    showinfo: "0",
    autoplay: "0",
    modestbranding: "1",
    iv_load_policy: "3",
    controls: "1",
    mute: "0",
    start: "0",
  });

  return `${baseUrl}?${params.toString()}`;
}

// Function to log Firebase events
function logFirebaseEvent(eventName, eventParams = {}) {
  logEvent(analytics, eventName, eventParams);
}

// Function to inject styles and scripts dynamically
async function injectStyles() {
  try {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "src/styles/videoPlayer.css";
    document.head.appendChild(link);
    console.log("Video Player CSS file injected:", link);
  } catch (error) {
    console.error("Error injecting styles:", error);
  }
}

// Function to initialize the video player
export function initVideoPlayer() {
  injectStyles(); // Inject styles and scripts
  setPlaylistId();
  fetchAndDisplayVideos(); // Fetch and display videos from the playlist
  logFirebaseEvent("video_player_initialized"); // Log event
  console.log("Video Player initialized");
}

// Block all external URL attempts
window.open = function () {
  return null;
};

// For Testing Purposes
document.addEventListener("DOMContentLoaded", startApp);

async function startApp() {
  await initVideoPlayer();
}

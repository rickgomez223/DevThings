import {
  database,
  databaseRef as ref,
  onValue,
  set,
  get,
  remove,
  analytics,
  logEvent,
  auth,
  onAuthStateChanged,
} from "https://rickgomez223.netlify.app/firebase/firebaseConfig.js";

// Exported function to initialize the change playlist functionality
export function initChangePlaylist() {
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      const userDisplayName = await getUserDisplayName();
      if (userDisplayName) {
        initializeAppComponents();
      }
    } catch (error) {
      handleError(error, "app_initialization_error");
    }
  });
}

// Centralized helper function to get the user's display name from Firebase Auth and LocalStorage
function getUserDisplayName() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        let userDisplayName = user.displayName;
        sessionStorage.getItem("userDisplayName");
        resolve(userDisplayName);
      } else {
        alert("User not logged in. Redirecting to login.");
        window.location.href = "/index.html"; // Redirect to login if userDisplayName is not found
        reject("User not logged in");
      }
    });
  });
}

// Centralized Error Handler
function handleError(error, eventType) {
  console.error(`${eventType}:`, error);
  logFirebaseEvent(eventType, { error: error.message });
  sendPushcutWebhook(`Error occurred in ${eventType}: ${error.message}`);
}

// Log Firebase Events
function logFirebaseEvent(eventName, eventParams = {}) {
  try {
    logEvent(analytics, eventName, eventParams);
  } catch (error) {
    console.error("Error logging Firebase event:", error);
  }
}

// Pushcut Webhook function for logging errors to Pushcut
function sendPushcutWebhook(message) {
  const webhookUrl = 'https://api.pushcut.io/VEQktvCTFnpchKTT3TsIK/notifications/FWA';

  const payload = {
    title: 'Error Occurred',
    text: message,
  };

  fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then(response => response.json())
    .then(data => console.log('Pushcut webhook response:', data))
    .catch(error => handleError(error, "pushcut_webhook_error"));
}

// Function to initialize the application components
function initializeAppComponents() {
  try {
    loadStoredPlaylists();
    loadCurrentPlaylist(); // Load and display the current playlist

    const playlistInput = document.getElementById("playlistIdInput");
    const playlistNameInput = document.getElementById("playlistNameInput");
    const saveButton = document.getElementById("savePlaylistButton");

    if (!playlistInput || !playlistNameInput || !saveButton) {
      throw new Error("One or more elements not found.");
    }

    saveButton.addEventListener("click", async () => {
      await handleSavePlaylist(playlistInput, playlistNameInput);
    });
  } catch (error) {
    handleError(error, "app_initialization_error");
  }
}

// Function to handle saving a playlist
async function handleSavePlaylist(playlistInput, playlistNameInput) {
  const saveButton = document.getElementById("savePlaylistButton");
  saveButton.disabled = true; // Disable the save button

  try {
    const youtubeUrl = playlistInput.value.trim();
    const playlistName = playlistNameInput.value.trim();

    const playlistId = extractPlaylistId(youtubeUrl);

    if (playlistId && playlistName) {
      await savePlaylist(playlistId, playlistName, youtubeUrl);
      playlistInput.value = "";
      playlistNameInput.value = "";
      await loadStoredPlaylists(); // Reload the playlist list
    } else {
      alert("Please enter a valid YouTube Playlist URL and Name.");
    }
  } catch (error) {
    handleError(error, "save_playlist_error");
  } finally {
    saveButton.disabled = false; // Re-enable the save button
  }
}

// Function to save a new playlist to Firebase
async function savePlaylist(playlistId, playlistName, url) {
  try {
    const userDisplayName = await getUserDisplayName();
    const playlistRef = ref(database, `users/${userDisplayName}/settings/playlists/${playlistName}`);

    const data = {
      playlistId,
      playlistName,
      url,
      dateAdded: new Date().toISOString(),
    };

    await set(playlistRef, data);
    alert("Playlist saved successfully!");
    logFirebaseEvent("playlist_saved", { playlistId, playlistName });
  } catch (error) {
    handleError(error, "playlist_save_error");
  }
}

// Function to load and display stored playlists
async function loadStoredPlaylists() {
  try {
    const userDisplayName = await getUserDisplayName();
    const playlistList = document.getElementById("playlistList");
    const playlistsRef = ref(database, `users/${userDisplayName}/settings/playlists`);
    const snapshot = await get(playlistsRef);

    playlistList.innerHTML = ""; // Clear the list

    if (snapshot.exists()) {
      const playlists = snapshot.val();
      const fragment = document.createDocumentFragment(); // Use fragment for better performance
      for (const key in playlists) {
        displayPlaylist(fragment, playlists[key]);
      }
      playlistList.appendChild(fragment); // Append once after the loop
    } else {
      playlistList.innerHTML = "<li>No playlists stored yet.</li>";
    }
  } catch (error) {
    handleError(error, "playlist_load_error");
  }
}

// Function to display a playlist in the DOM
function displayPlaylist(container, playlist) {
  const listItem = document.createElement("li");
  listItem.textContent = playlist.playlistName;
  container.appendChild(listItem);
}

// Function to delete a playlist
async function deletePlaylist(playlistName) {
  try {
    const userDisplayName = await getUserDisplayName();
    const playlistRef = ref(database, `users/${userDisplayName}/settings/playlists/${playlistName}`);
    await remove(playlistRef);
    alert("Playlist deleted successfully!");
    loadStoredPlaylists();  // Refresh the playlist list
    logFirebaseEvent("playlist_deleted", { playlistName });
  } catch (error) {
    handleError(error, "playlist_delete_error");
  }
}

// Function to load and display the current playlist
async function loadCurrentPlaylist() {
  try {
    const userDisplayName = await getUserDisplayName();
    const currentPlaylistText = document.getElementById("currentPlaylistText");
    const selectedPlaylistRef = ref(database, `users/${userDisplayName}/settings/userPlaylist`);
    const snapshot = await get(selectedPlaylistRef);

    if (snapshot.exists()) {
      const { playlistId, playlistName } = snapshot.val();
      currentPlaylistText.textContent = `Current Playlist: ${playlistName}`;
      logFirebaseEvent("current_playlist_loaded", { playlistId, playlistName });
    } else {
      currentPlaylistText.textContent = "No playlist selected.";
    }
  } catch (error) {
    handleError(error, "current_playlist_load_error");
  }
}

// Function to extract playlist ID from YouTube URL
function extractPlaylistId(url) {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    const playlistId = params.get("list");
    if (playlistId) {
      logFirebaseEvent("playlist_id_extracted", { playlistId });
      return playlistId;
    } else {
      throw new Error("Invalid playlist ID extracted.");
    }
  } catch (error) {
    handleError(error, "playlist_id_extraction_failed");
    return null;
  }
}
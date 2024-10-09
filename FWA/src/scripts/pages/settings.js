import {
  database,
  storage,
  analytics,
  databaseRef,
  onValue,
  set,
  storageRef,
  listAll,
  logEvent,
  get,
} from "https://rickgomez223.netlify.app/firebase/firebaseConfig.js";




document.addEventListener("DOMContentLoaded", () => {
  console.log("Settings: Start");

  try {
    initSettings();
  } catch (error) {
    console.log("Settings: Start Failed");
    console.log("Run initSettings() To Retry");
  }
});

// Function to log Firebase Analytics events
function logFirebaseEvent(eventName, eventParams = {}) {
  logEvent(analytics, eventName, eventParams);
}

// Function to update the status on the settings page
function updateStatus(elementId, status, color) {
  try {
    const element = document.getElementById(elementId);
    element.textContent = status;
    element.parentElement.style.color = color;
    logFirebaseEvent("status_updated", { elementId, status, color });
  } catch (error) {
    console.error(`Error updating status for ${elementId}:`, error);
    logFirebaseEvent("error", {
      message: `Error updating status for ${elementId}`,
      error,
    });
  }
}

// Function to check Firebase connection using Realtime Database
function checkFirebaseConnection() {
  try {
    const connectedRef = databaseRef(database, ".info/connected");

    onValue(connectedRef, (snapshot) => {
      const isConnected = snapshot.val() === true;
      if (isConnected) {
        console.log("Firebase: Connected");
        updateStatus("FbConnectionStatusText", "Connected", "green");
      } else {
        console.log("Firebase: Disconnected");
        updateStatus("FbConnectionStatusText", "Offline", "orange");
      }
      logFirebaseEvent("firebase_connection_status", { isConnected });
    });
  } catch (error) {
    console.error("Failed Connecting to Firebase:", error);
    updateStatus("FbConnectionStatusText", "Offline", "orange");
    logFirebaseEvent("error", {
      message: "Failed Connecting to Firebase",
      error,
    });
  }
}

// Function to check Firebase Storage connection
function checkFirebaseStorageConnection() {
  try {
    const pathReference = storageRef(storage, "test-connection/");

    listAll(pathReference)
      .then(() => {
        updateStatus("FbStorageStatusText", "Connected", "green");
        logFirebaseEvent("firebase_storage_connection", { status: "good" });
      })
      .catch((error) => {
        console.error("Error accessing Firebase Storage:", error);
        updateStatus("FbStorageStatusText", "Offline", "orange");
        logFirebaseEvent("error", {
          message: "Error accessing Firebase Storage",
          error,
        });
      });
  } catch (error) {
    console.error("Error checking Firebase Storage:", error);
    updateStatus("FbStorageStatusText", "Cached", "orange");
    logFirebaseEvent("error", {
      message: "Error checking Firebase Storage",
      error,
    });
  }
}

// Function to check YouTube API connection
function checkYouTubeConnection() {
  try {
    const apiKey = "AIzaSyCVxTLhIoLiq1omD8fFDJ8HHkA7CibhXHA"; // Consider using environment variables
    const playlistId = "PLPWAY3oXfm0VF9PuFptwCmzfQJjTfSsn4";
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`;

    fetch(url)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Failed to connect to YouTube API");
        }
      })
      .then((data) => {
        if (data && data.items && data.items.length > 0) {
          updateStatus("ytConnectionStatusText", "Connected", "green");
          logFirebaseEvent("youtube_connection", { status: "connected" });
        } else {
          updateStatus("ytConnectionStatusText", "Offline", "orange");
          logFirebaseEvent("youtube_connection", { status: "offline" });
        }
      })
      .catch((error) => {
        console.error("Error accessing YouTube API:", error);
        updateStatus("ytConnectionStatusText", "Offline", "orange");
        logFirebaseEvent("error", {
          message: "Error accessing YouTube API",
          error,
        });
      });
  } catch (error) {
    console.error("Error in checkYouTubeConnection:", error);
    updateStatus("ytConnectionStatusText", "Offline", "orange");
    logFirebaseEvent("error", {
      message: "Error in checkYouTubeConnection",
      error,
    });
  }
}

// Function to load and display the current playlist
async function loadCurrentPlaylist() {
  try {
    const currentPlaylistText = document.getElementById("ytPlaylistStatusText");
    const selectedPlaylistRef = databaseRef(
      database,
      `user/settings/userPlaylist`
    );
    const snapshot = await get(selectedPlaylistRef);

    if (snapshot.exists()) {
      const { playlistId, playlistName } = snapshot.val();
      const playID = `${playlistName}`;
      updateStatus("ytPlaylistStatusText", playID, "green");

      logFirebaseEvent("current_playlist_loaded", { playlistId, playlistName });
    } else {
      updateStatus("ytPlaylistStatusText", "Franklins Playlist.", "green");
    }
  } catch (error) {
    console.error("Error loading current playlist from Firebase:", error);
    logFirebaseEvent("current_playlist_load_error", { error: error.message });
  }
}

// Function to load HTML content and handle fallbacks
async function loadHtmlWithFallbacks(htmlPaths) {
  for (const htmlPath of htmlPaths) {
    try {
      const response = await fetch(htmlPath);
      if (response.ok) {
        return await response.text();
      } else {
        console.warn(`Failed to load HTML from ${htmlPath}: HTTP status ${response.status}`);
      }
    } catch (error) {
      console.warn(`Error fetching HTML from ${htmlPath}:`, error);
    }
  }
  throw new Error("Failed to load HTML from all provided paths.");
}

// Function to load a script dynamically
function loadScript(scriptUrl) {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
    if (existingScript) {
      existingScript.remove(); // Remove existing script to force reload
    }

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.type = "module";

    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

// Function to load stylesheet with fallback paths
async function loadStylesheet(url) {
  if (!document.querySelector(`link[href="${url}"]`)) {
    const link = document.createElement("link");
    link.href = url;
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return new Promise((resolve, reject) => {
      link.onload = resolve;
      link.onerror = reject;
    });
  }
}

// Function to inject HTML content
function injectHtmlContent(html) {
  const router = document.getElementById("settingsRouter");
  router.innerHTML = html;
  router.style.display = "flex"; // Ensure router is visible
}

// Function to hide specific elements before content change
function hideElements() {
  const settingsWrapper = document.getElementById("settingsWrapper");
  const backButton = document.getElementById("settingsNav");
  const pageFooter = document.getElementById("pageFooter");

  settingsWrapper.style.display = "none";
  backButton.style.display = "block";
  pageFooter.style.display = "none";
}

// DRY function to handle both Storage Manager and Playlist change
async function loadPage(htmlPaths, scriptPath, stylesheetUrl, moduleName) {
  try {
    hideElements(); // Hide existing elements

    const html = await loadHtmlWithFallbacks(htmlPaths);
    injectHtmlContent(html);

    await loadStylesheet(stylesheetUrl); // Load stylesheet if needed

    const module = await loadScript(scriptPath);
    module[moduleName](); // Call the module's initialization function (e.g., initStorageManager or initChangePlaylist)

    console.log(`${moduleName} loaded successfully.`);
  } catch (error) {
    console.error(`Failed to load ${moduleName}:`, error);
  }
}

// Function to show Storage Manager
async function showStorageManager() {
  const htmlPaths = [
    "./src/pages/storageManager.html",
    "../src/pages/storageManager.html",
    "../../src/pages/storageManager.html",
    "../../../src/pages/storageManager.html"
  ];

  const scriptPath = "./src/scripts/pages/storageManager.js";
  const stylesheetUrl = "src/styles/storageManager.css";
  await loadPage(htmlPaths, scriptPath, stylesheetUrl, "initStorageManager");
}

// Function to change Playlist
async function changePlaylist() {
  const htmlPaths = [
    "./src/pages/changePlaylist.html",
    "../src/pages/changePlaylist.html",
    "../../src/pages/changePlaylist.html",
    "../../../src/pages/changePlaylist.html"
  ];

  const scriptPath = "./src/scripts/pages/changePlaylist.js";
  const stylesheetUrl = "src/styles/changePlaylist.css";
  await loadPage(htmlPaths, scriptPath, stylesheetUrl, "initChangePlaylist");
}

function showSettingsHome() {
  const settingsWrapper = document.getElementById("settingsWrapper");
  settingsWrapper.style.display = "block";

  const backButton = document.getElementById("settingsNav");
  backButton.style.display = "none";

  const pageFooter = document.getElementById("pageFooter");
  pageFooter.style.display = "block";

  const router = document.getElementById("settingsRouter");
  router.innerHTML = "";
  router.style.display = "none";
}

function showAttributes() {
  const attr = document.getElementById("attr");
  const attrBtn = document.getElementById("attributesBtn");
  const settingsWrapper = document.getElementById("settingsWrapper");
  const u2la = document.querySelector(".footer-item:last-child");

  if (attr.classList.contains("hidden")) {
    // Show the attributes section with a smooth transition
    settingsWrapper.classList.add("hidden");
    u2la.style.display = "none";
    attr.classList.remove("hidden");
    attr.classList.add("visible");
    attrBtn.textContent = "Back";
    attrBtn.setAttribute("aria-expanded", "true");
  } else {
    // Hide the attributes section with a smooth transition
    attr.classList.remove("visible");
    attr.classList.add("hidden");
    settingsWrapper.classList.remove("hidden");
    u2la.style.display = "block";
    attrBtn.textContent = "Show Attributes";
    attrBtn.setAttribute("aria-expanded", "false");
  }
}

function initializeAttributes() {
  // Apply initial styles for smooth transitions

  const attr = document.getElementById("attr");
  attr.classList.add("hidden"); // Ensure it's initially hidden

  // Initialize the button with correct ARIA attributes
  const attrBtn = document.getElementById("attributesBtn");
  attrBtn.setAttribute("aria-expanded", "false");
}

// Function to inject styles for the settings page
export async function injectStyles() {
  try {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "src/styles/settings.css";
    document.head.appendChild(link);
    console.log("Settings CSS file injected:", link);
    logFirebaseEvent("settings_style_injected");
  } catch (error) {
    console.error("Error injecting styles:", error);
    logFirebaseEvent("error", { message: "Error injecting styles", error });
  }
}

function initializeEventListeners() {
  try {
    const attrBtn = document.getElementById("attributesBtn");
    attrBtn.addEventListener("click", showAttributes);

    const changePlaylistBtn = document.getElementById("changePlaylistBtn");
    changePlaylistBtn.addEventListener("click", changePlaylist);

    const showStorageManagerBtn = document.getElementById(
      "showStorageManagerBtn"
    );
    showStorageManagerBtn.addEventListener("click", showStorageManager);

    const backButton = document.getElementById("backBtn");
    backButton.addEventListener("click", showSettingsHome);

    const u2laBTN = document.getElementById("u2laBTN");
    u2laBTN.addEventListener("click", openU2LA);
  } catch (error) {
    console.error("Error inializing event listeners:", error);
    logFirebaseEvent("error", {
      message: "Error inializing event listeners",
      error,
    });
  }
}

// Main function to initialize the settings page
export function initSettings() {
  try {
    injectStyles();
    checkFirebaseConnection();
    checkFirebaseStorageConnection();
    checkYouTubeConnection();
    loadCurrentPlaylist();

    initializeAttributes();

    initializeEventListeners();

    console.log("Export & Start Settings Page");
    logFirebaseEvent("settings_page_initialized");
  } catch (error) {
    console.error("Error initializing settings:", error);
    logFirebaseEvent("error", {
      message: "Error initializing settings",
      error,
    });
  }
}

function openU2LA() {
  // Create the overlay for the dialog
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  overlay.style.zIndex = "1000";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";

  // Create the dialog box
  const dialog = document.createElement("div");
  dialog.style.backgroundColor = "#fff";
  dialog.style.padding = "20px";
  dialog.style.borderRadius = "8px";
  dialog.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
  dialog.style.maxWidth = "400px";
  dialog.style.textAlign = "center";

  const message = document.createElement("p");
  message.textContent =
    "You are about to navigate away from the app. Continue?";

  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancel";
  cancelButton.style.marginRight = "10px";
  cancelButton.style.padding = "10px 20px";
  cancelButton.style.backgroundColor = "#007aff";
  cancelButton.style.color = "#fff";
  cancelButton.style.border = "none";
  cancelButton.style.borderRadius = "5px";
  cancelButton.style.cursor = "pointer";

  // Append the elements to the dialog
  dialog.appendChild(message);
  dialog.appendChild(cancelButton);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  // Function to cancel the operation
  function cancelNavigation() {
    clearTimeout(autoNavigateTimer); // Cancel the auto-navigate timer
    document.body.removeChild(overlay); // Remove the overlay and dialog
  }

  // Event listener for the cancel button
  cancelButton.addEventListener("click", cancelNavigation);

  // Event listener to cancel if clicking outside the dialog
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      cancelNavigation();
    }
  });

  // Automatically navigate after 3 seconds
  const autoNavigateTimer = setTimeout(() => {
    document.body.removeChild(overlay);
    tryNextPath(0); // Proceed with the original path check and navigation
  }, 3000);

  function tryNextPath(index) {
    if (index >= paths.length) {
      console.error("All paths failed.");
      return;
    }

    const path = paths[index];
    const xhr = new XMLHttpRequest();
    xhr.open("HEAD", path, true);

    xhr.onload = function () {
      if (xhr.status === 200) {
        // Path exists, navigate to it
        clearTimeout(autoNavigateTimer); // Cancel auto-navigate if manually navigating
        window.location.href = path;
      } else {
        // Try the next path in the list
        tryNextPath(index + 1);
      }
    };

    xhr.onerror = function () {
      // On error, try the next path in the list
      tryNextPath(index + 1);
    };

    xhr.send();
  }

  // Start checking paths
  const paths = [
    "U2LA/uploadForm.html",
    "../U2LA/uploadForm.html",
    "../../U2LA/uploadForm.html",
  ];
}
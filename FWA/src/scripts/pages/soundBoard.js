import {
  storage,
  analytics,
  storageRef,
  listAll,
  getDownloadURL,
  logEvent as firebaseLogEvent,
} from "https://rickgomez223.netlify.app/firebase/firebaseConfig.js";

console.log("Firebase initialized: From soundboardjs");

// Logging function to wrap console.log
function logConsole(message, ...args) {
  console.log(message, ...args);
}

// Logging function to wrap Firebase log events
function logEvent(eventName, eventParams) {
  firebaseLogEvent(analytics, eventName, eventParams);
}

async function injectStyles() {
  try {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "./src/styles/soundBoard.css";
    document.head.appendChild(link);
    logConsole("CSS file injected:", link);
    link.dataset.injected = "true";
  } catch (error) {
    logConsole("Error injecting CSS:", error);
    logEvent("inject_styles_error", { error_message: error.message });
  }
}

let currentAudio = null;
const switchSound = new Audio("sounds/switch-sound.mp3");
let currentFolderPath = "Sounds/";
const cachedMedia = new Set();

function checkInternetConnection() {
  logConsole("Checking for internet connection...");

  if (navigator.onLine) {
    logConsole("Internet connection is available.");
    return true;
  } else {
    logConsole("Navigator indicates offline status.");
    return false;
  }
}

function resetSoundboardState() {
  logConsole("Resetting soundboard state...");

  const soundboard = document.getElementById("soundBoard");
  if (soundboard) {
    soundboard.innerHTML = ""; // Clear the soundboard content
  }

  currentAudio = null; // Reset the current audio
  cachedMedia.clear(); // Clear any cached media references
}

function createButton(label, url) {
  try {
    const labelWithoutExtension = label.split(".").slice(0, -1).join(".");
    const button = document.createElement("button");
    button.className = "sound-button";
    button.textContent = labelWithoutExtension;

    button.addEventListener("touchstart", () =>
      handleButtonClick(labelWithoutExtension, url)
    );
    logConsole("Button Created for:", labelWithoutExtension);
    return button;
  } catch (error) {
    logConsole("Error creating button:", error);
    logEvent("create_button_error", { error_message: error.message });
  }
}

function handleButtonClick(labelWithoutExtension, url) {
  try {
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }

    if (currentAudio && !currentAudio.paused) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    currentAudio = new Audio(url);
    currentAudio.play().catch((error) => {
      logConsole("Error playing audio:", error);
      logEvent("play_audio_error", { error_message: error.message });
    });

    logEvent("play_sound", {
      sound_name: labelWithoutExtension,
      sound_url: url,
    });
  } catch (error) {
    logConsole("Error handling button click:", error);
    logEvent("button_click_error", { error_message: error.message });
  }
}

async function createCacheIfNotExists(cacheName) {
  try {
    const cache = await caches.open(cacheName);
    logConsole(`Cache '${cacheName}' opened/created successfully.`);
    return cache;
  } catch (error) {
    logConsole(`Error creating cache '${cacheName}':`, error);
    logEvent("create_cache_error", { error_message: error.message });
    return null;
  }
}

// Function to display sound files, clearing previous ones
async function displaySounds(folderRef) {
  const soundboard = document.getElementById("soundBoard");
  soundboard.innerHTML = ""; // Clear existing buttons before displaying new ones

  try {
    const res = await listAll(folderRef);

    if (res.items.length > 0) {
      for (const itemRef of res.items) {
        await displaySound(itemRef, soundboard);
      }
    } else {
      displayEmptyMessage(soundboard, "No sound files in here.");
    }
  } catch (error) {
    handleFetchError(
      error,
      "Error fetching sound files:",
      soundboard,
      "Could not fetch sound files."
    );
  }
}

async function displaySound(itemRef, soundboard) {
  try {
    const fileName = itemRef.name;
    const fileURL = await getDownloadURL(itemRef);
    const button = createButton(fileName, fileURL);
    soundboard.appendChild(button);
  } catch (error) {
    logConsole("Error fetching sound URL:", error);
    logEvent("fetch_sound_url_error", { error_message: error.message });
  }
}

function displayEmptyMessage(container, message) {
  const emptyMessage = document.createElement("div");
  emptyMessage.textContent = message;
  container.appendChild(emptyMessage);
}

async function handleFetchError(error, logMessage, container, displayMessage) {
  logConsole(logMessage, error);
  displayEmptyMessage(container, displayMessage);
  logEvent("fetch_error", { error_message: error.message });
}

async function displaySoundsFromCache() {
  const soundboard = document.getElementById("soundBoard");
  soundboard.innerHTML = "";

  const cache = await createCacheIfNotExists("soundboard-cache");
  if (!cache) {
    displayEmptyMessage(
      soundboard,
      "Unable to open cache. Please try again later."
    );
    return;
  }

  try {
    const cachedRequests = await cache.keys();

    if (cachedRequests.length > 0) {
      for (const request of cachedRequests) {
        await displayCachedSound(request, cache, soundboard);
      }
    } else {
      displayEmptyMessage(
        soundboard,
        "No sounds available in cache. Please connect to the internet to download sounds."
      );
    }
  } catch (error) {
    handleFetchError(
      error,
      "Error loading sounds from cache:",
      soundboard,
      "Could not load sound files from cache."
    );
  }
}

async function displayCachedSound(request, cache, soundboard) {
  try {
    const response = await cache.match(request);
    const fileURL = request.url;
    const fileName = fileURL.split("/").pop();

    const button = createButton(fileName, fileURL);
    soundboard.appendChild(button);
    logConsole(`Loaded sound file from cache: ${fileURL}`);
  } catch (error) {
    logConsole("Error loading cached sound:", error);
    logEvent("load_cached_sound_error", { error_message: error.message });
  }
}

async function displayFolders(folderRef) {
  logConsole("Displaying folders...");

  const navBar = document.getElementById("navBar");
  navBar.innerHTML = ""; // Clear existing folders

  try {
    const res = await listAll(folderRef);
    logConsole("Fetched folders:", res.prefixes);

    if (res.prefixes.length > 0) {
      let isFirstFolder = true;

      // Loop through all folders and create buttons
      for (const folder of res.prefixes) {
        createFolderButton(folder, navBar);

        // Automatically display the first folder's content
        if (isFirstFolder) {
          handleFolderClick(folder);
          isFirstFolder = false; // Ensure this only happens for the first folder
        }
      }
    } else {
      displayEmptyMessage(navBar, "No folders available.");
    }
  } catch (error) {
    handleFetchError(
      error,
      "Error fetching folders:",
      navBar,
      "Could not fetch folders."
    );
  }
}

function createFolderButton(folder, navBar) {
  try {
    const folderName = folder.name;
    const button = document.createElement("button");
    button.className = "folder-button";
    button.textContent = folderName;

    button.addEventListener("touchstart", () => handleFolderClick(folder));
    navBar.appendChild(button);
  } catch (error) {
    logConsole("Error creating folder button:", error);
    logEvent("create_folder_button_error", { error_message: error.message });
  }
}

function handleFolderClick(folder) {
  try {
    currentFolderPath = folder.fullPath; // Update the current folder path
    displaySounds(folder); // Display sounds in the selected folder
  } catch (error) {
    logConsole("Error handling folder click:", error);
    logEvent("folder_click_error", { error_message: error.message });
  }
}

export async function initSoundboard() {
  try {
    logConsole("Starting initSoundboard...");
    resetSoundboardState();
    await injectStyles();

    const hasInternet = checkInternetConnection();
    logConsole("Internet connection status:", hasInternet);

    if (hasInternet) {
      logConsole("Loading sounds from Firebase Storage...");
      const initialFolderRef = storageRef(storage, currentFolderPath);
      await displayFolders(initialFolderRef); // Display all folders and load the first one by default
    } else {
      logConsole("Loading sounds from cache...");
      await displaySoundsFromCache();
    }

    logConsole("Soundboard initialized.");
  } catch (error) {
    logConsole("Error initializing soundboard:", error);
    logEvent("init_soundboard_error", { error_message: error.message });
  }
}

// Optional Start Page If Not Injected. IE, testing single html with css and js.

document.addEventListener("DOMContentLoaded", startApp);

function startApp() {
  initSoundboard();
}

import {
  storage,
  storageRef,
  uploadBytesResumable as uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject,
  analytics,
  logEvent,
} from "https://rickgomez223.netlify.app/firebase/firebaseConfig.js";

let selectedItems = [];
let mediaRecorder;
let mediaStream;
let recording = false;

const elements = {};

document.addEventListener("DOMContentLoaded", () => {
  logConsole("Storage Manager Js: Start...");
  try {
    initStorageManager();
  } catch (error) {
    logError("Storage Manager Js: Failed to initialize!", error);
  }
});



// Separate functions for logging
function logConsole(message, level = 'log') {
  switch (level) {
    case 'log':
      console.log(message);
      break;
    case 'warn':
      console.warn(message);
      break;
    case 'error':
      console.error(message);
      break;
    default:
      console.log(message);
  }
}

function logFirebaseEvent(eventName, eventParams = {}) {
  try {
    logEvent(analytics, eventName, eventParams);
    logConsole(`Firebase Event Logged: ${eventName}`, 'log');
  } catch (error) {
    logConsole(`Failed to log Firebase event: ${eventName}`, 'error');
  }
}

// Function to start the storage manager
export async function initStorageManager() {
  logConsole("Storage Manager Js: Initializing...");
  if (!document.getElementById('sm-photoGrid')) {
    logError("Required elements not found. Retrying initialization...");
    setTimeout(initStorageManager, 100); // Retry after a short delay
    return;
  }

  try {
    injectStyles(); // Inject styles and scripts
    initApp();
    logConsole("Storage Manager Js: Initialized successfully.");
    logFirebaseEvent("storage_manager_initialized");
  } catch (error) {
    logError("Storage Manager Js: initStorageManager failed!", error);
  }
}

// Function to inject styles dynamically
async function injectStyles() {
  logConsole("Injecting CSS styles...");
  try {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "./src/styles/storageManager.css";
    link.dataset.injected = "true";
    document.head.appendChild(link);
    logConsole("Storage Manager CSS file injected successfully:", link);
  } catch (error) {
    logError("Error injecting CSS:", error);
  }
}

// Function to initialize the app
function initApp() {
  try {
    logConsole("Initializing app...");
    initializeElements();
    setupDeleteButton();
    initializeToggleButtons();
    fetchSounds("", elements.soundGrid); // Start from the root
    fetchPhotos(elements.photoGrid);
    setupRecording();
    setupSoundFormSubmission();
    setupPhotoFormSubmission();
    logConsole("App initialized successfully.");
    logFirebaseEvent("app_initialized");
  } catch (error) {
    logError("Error initializing app:", error);
  }
}

function initializeElements() {
  try {
    logConsole("Initializing elements...");
    
    // Querying all necessary elements
    elements.toggleButton = document.getElementById("startRecording");
    elements.audioContainer = document.getElementById("audioContainer");
    
    elements.titleInput = document.getElementById("sm-ui-title");
    elements.subjectInput = document.getElementById("sm-ui-subject");
    elements.soundForm = document.getElementById("uploadSoundForm");
    elements.photoForm = document.getElementById("uploadPhotoForm");
    elements.photoGrid = document.getElementById("sm-photoGrid");
    elements.soundGrid = document.getElementById("sm-soundGrid");
    elements.photosBtn = document.getElementById("photosBtn");
    elements.soundsBtn = document.getElementById("soundsBtn");
    elements.deleteButtonPhotos = document.getElementById("deleteButtonPhotos");
    elements.deleteButtonSounds = document.getElementById("deleteButtonSounds");
    elements.selectedCountPhotos = document.getElementById("selectedCountPhotos");
    elements.selectedCountSounds = document.getElementById("selectedCountSounds");

    // Verify all elements were found
    for (let key in elements) {
      if (!elements[key]) {
        logWarn(`Element ${key} not found!`);
      }
    }

    logConsole("Elements initialized:", elements);
    logFirebaseEvent("elements_initialized", { elements });
  } catch (error) {
    logError("Error initializing elements:", error);
  }
}

function setupRecording() {
  try {
    logConsole("Setting up recording...");

    if (!elements.toggleButton) {
      logError("Toggle button not found, aborting recording setup.");
      return;
    }

    elements.toggleButton.addEventListener("click", async () => {
      logConsole("Recording button clicked. Current recording state:", recording);
      if (recording) {
        stopRecording();
      } else {
        startRecording();
      }
    });

    logConsole("Recording setup successfully.");
  } catch (error) {
    logError("Error setting up recording:", error);
  }
}

async function startRecording() {
  try {
    logConsole("Starting recording...");

    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    logConsole("Media stream obtained:", mediaStream);

    mediaRecorder = new MediaRecorder(mediaStream);
    logConsole("MediaRecorder initialized:", mediaRecorder);

    const chunks = [];
    mediaRecorder.ondataavailable = (event) => {
      logConsole("Data available from media recorder:", event.data.size);
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      logConsole("Recording stopped, processing chunks...");
      processRecording(chunks);
    };

    mediaRecorder.start();
    recording = true;
    elements.toggleButton.textContent = "Stop Recording";
    logConsole("Recording started...");
    logFirebaseEvent("recording_started");
  } catch (error) {
    logError("Error accessing audio devices:", error);
    alert("Unable to access audio devices. Please check your permissions.");
    logFirebaseEvent("access_audio_devices_error", {
      error_message: error.message,
    });
  }
}

function stopRecording() {
  try {
    logConsole("Stopping recording...");

    if (!mediaRecorder) {
      logError("MediaRecorder not initialized. Cannot stop recording.");
      return;
    }

    mediaRecorder.stop();
    recording = false;
    elements.toggleButton.textContent = "Record";

    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => {
        logConsole("Stopping media stream track:", track);
        track.stop();
      });
    }

    logConsole("Recording stopped.");
    logFirebaseEvent("recording_stopped");
  } catch (error) {
    logError("Error stopping recording:", error);
  }
}

function processRecording(chunks) {
  try {
    logConsole("Processing recording...");
    const blob = new Blob(chunks, { type: "audio/mp4" });
    logConsole("Blob created from chunks:", blob);

    const audioUrl = URL.createObjectURL(blob);
    logConsole("Audio URL created:", audioUrl);

    const audio = document.createElement("audio");
    audio.src = audioUrl;
    audio.controls = true;

    elements.audioContainer.innerHTML = ""; // Clear previous audio
    elements.audioContainer.appendChild(audio);
    logConsole("Audio element appended to container.");

    // Store audio blob in hidden input for upload
    elements.audioInput.value = audioUrl;
    elements.audioInput.blob = blob;
    logConsole("Audio blob stored for later upload.");

    logConsole("Recording processed successfully.");
    logFirebaseEvent("recording_processed");
  } catch (error) {
    logError("Error processing recording:", error);
  }
}

function setupSoundFormSubmission() {
  try {
    logConsole("Setting up sound form submission...");

    if (!elements.soundForm) {
      logError("Sound form not found, aborting setup.");
      return;
    }

    elements.soundForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      logConsole("Sound form submitted. Validating form...");

      if (!elements.audioInput.value || !elements.audioInput.blob) {
        alert("Please record some audio before submitting the form.");
        logError("Form submission failed: No audio recorded.");
        return;
      }

      const title = elements.titleInput.value.trim();
      const subject = elements.subjectInput.value.trim();
      const audioBlob = elements.audioInput.blob;

      logConsole("Form validated. Preparing to upload audio.", {
        title,
        subject,
        audioBlobSize: audioBlob.size,
      });

      try {
        const fileName = `${title}.mp4`;
        const folderPath = `Sounds/${subject}`;
        const storageRefInstance = storageRef(storage, `${folderPath}/${fileName}`);

        logConsole("Uploading audio to Firebase Storage...", {
          fileName,
          folderPath,
        });

        const snapshot = await uploadBytes(storageRefInstance, audioBlob);
        logConsole("Upload successful. Snapshot:", snapshot);

        const downloadURL = await getDownloadURL(snapshot.ref);
        logConsole("File available at:", downloadURL);
        logFirebaseEvent("file_uploaded", { downloadURL });

        alert("Upload successful!");
      } catch (error) {
        logError("Error uploading file:", error);
        alert("Error uploading the file. Please try again.");
        logFirebaseEvent("upload_error", { error_message: error.message });
      }
    });

    logConsole("Sound form submission setup completed.");
  } catch (error) {
    logError("Error setting up sound form submission:", error);
  }
}

function setupPhotoFormSubmission() {
  try {
    logConsole("Setting up photo form submission...");

    if (!elements.photoForm) {
      logError("Photo form not found, aborting setup.");
      return;
    }

    elements.photoForm.addEventListener("submit", (event) => {
      event.preventDefault();
      logConsole("Photo form submitted.");

      const fileInput = document.getElementById("fileInput");
      const file = fileInput.files[0];
      if (file) {
        logConsole("File selected for upload:", file.name);
        uploadImage(file);
      } else {
        logError("No file selected for photo upload.");
      }
    });

    logConsole("Photo form submission setup completed.");
  } catch (error) {
    logError("Error setting up photo form submission:", error);
  }
}

function uploadImage(file) {
  try {
    logConsole("Uploading image:", file.name);
    const storageRefInstance = storageRef(storage, `Images/${file.name}`);
    const uploadTask = uploadBytes(storageRefInstance, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        logConsole("Upload is " + progress + "% done");
      },
      (error) => {
        logError("Upload failed:", error);
        logFirebaseEvent("image_upload_failed", { error_message: error.message });
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          logConsole("File available at", downloadURL);
          displayImage(downloadURL, file.name);
          logFirebaseEvent("image_uploaded", { downloadURL });
        });
      }
    );
  } catch (error) {
    logError("Error uploading image:", error);
    logFirebaseEvent("upload_error", { error_message: error.message });
  }
}

// Function to display an image
function displayImage(url, fileName) {
  try {
    logConsole("Displaying image:", fileName);
    const img = document.createElement("img");
    img.src = url;
    img.alt = fileName;
    img.style.width = "100px";
    img.style.height = "100px";
    img.className = "thumbnail";
    img.addEventListener("click", () =>
      toggleSelection(storageRef(storage, `Images/${fileName}`), img, "photos")
    );
    elements.photoGrid.appendChild(img);
    logConsole("Image appended to photo grid:", fileName);
  } catch (error) {
    logError("Error displaying image:", error);
  }
}

// Function to fetch photos from Firebase Storage
function fetchPhotos(photoGrid) {
  try {
    logConsole("Fetching photos...");
    const storageRefInstance = storageRef(storage, "Images/");
    listAll(storageRefInstance)
      .then((result) => {
        logConsole("Photos fetched successfully:", result.items.length, "items");
        photoGrid.innerHTML = ""; // Ensure the grid is clear before appending new items
        result.items.forEach((itemRef) => {
          displayPhoto(itemRef, photoGrid);
        });
      })
      .catch((error) => {
        logError("Error loading photos:", error);
        logFirebaseEvent("fetch_photos_error", { error_message: error.message });
      });
  } catch (error) {
    logError("Error fetching photos:", error);
    logFirebaseEvent("fetch_photos_error", { error_message: error.message });
  }
}

// Function to display a photo
function displayPhoto(itemRef, grid) {
  try {
    logConsole("Displaying photo:", itemRef.name);
    getDownloadURL(itemRef)
      .then((url) => {
        displayImage(url, itemRef.name);
      })
      .catch((error) => {
        logError("Error fetching image URL:", error);
        logFirebaseEvent("fetch_image_url_error", { error_message: error.message });
      });
  } catch (error) {
    logError("Error displaying photo:", error);
  }
}

// Function to fetch sounds from Firebase Storage
function fetchSounds(path, soundGrid) {
  try {
    logConsole("Fetching sounds from path:", path);
    const storageRefInstance = storageRef(storage, `Sounds/${path}`);
    listAll(storageRefInstance)
      .then((result) => {
        logConsole("Sounds fetched successfully:", result.items.length, "items");

        soundGrid.innerHTML = "";

        result.prefixes.forEach((folderRef) => {
          displayFolder(folderRef, path, soundGrid);
        });

        result.items.forEach((itemRef) => {
          displaySound(itemRef, soundGrid);
        });
      })
      .catch((error) => {
        logError("Error loading sounds:", error);
        logFirebaseEvent("fetch_sounds_error", { error_message: error.message });
      });
  } catch (error) {
    logError("Error fetching sounds:", error);
    logFirebaseEvent("fetch_sounds_error", { error_message: error.message });
  }
}

// Function to display a folder
function displayFolder(folderRef, path, soundGrid) {
  try {
    logConsole("Displaying folder:", folderRef.name);
    const folderItem = document.createElement("div");
    folderItem.className = "folder-item";
    folderItem.innerHTML = `<strong>${folderRef.name}</strong>`;

    const subGridId = `${path}${folderRef.name}-subGrid`;
    let subGrid = document.getElementById(subGridId);

    if (!subGrid) {
      subGrid = document.createElement("div");
      subGrid.id = subGridId;
      subGrid.className = "sub-grid";
      soundGrid.appendChild(folderItem);
      soundGrid.appendChild(subGrid);
    }

    folderItem.addEventListener("click", () => {
      const isExpanded = folderItem.classList.contains("expanded");
      if (isExpanded) {
        folderItem.classList.remove("expanded");
        subGrid.style.display = "none";
        logConsole("Folder collapsed:", folderRef.name);
      } else {
        folderItem.classList.add("expanded");
        subGrid.style.display = "block";
        fetchSounds(`${path}${folderRef.name}/`, subGrid);
        logConsole("Folder expanded:", folderRef.name);
      }
    });

    logConsole("Folder item appended to sound grid:", folderRef.name);
  } catch (error) {
    logError("Error displaying folder:", error);
  }
}

// Function to display a sound
function displaySound(itemRef, grid) {
  try {
    logConsole("Displaying sound:", itemRef.name);
    getDownloadURL(itemRef)
      .then((url) => {
        const soundContainer = document.createElement("div");
        soundContainer.className = "sound-item";

        const audio = document.createElement("audio");
        audio.src = url;
        audio.controls = true;

        const soundName = document.createElement("span");
        soundName.className = "sound-name";
        soundName.textContent = itemRef.name;

        soundContainer.appendChild(audio);
        soundContainer.appendChild(soundName);
        soundContainer.addEventListener("click", () =>
          toggleSelection(itemRef, soundContainer, "sounds")
        );

        grid.appendChild(soundContainer);
        logConsole("Sound appended to sound grid:", itemRef.name);
      })
      .catch((error) => {
        logError("Error fetching sound URL:", error);
        logFirebaseEvent("fetch_sound_url_error", { error_message: error.message });
      });
  } catch (error) {
    logError("Error displaying sound:", error);
  }
}

// Function to toggle selection of an item
function toggleSelection(itemRef, element, page) {
  try {
    logConsole(`Toggling selection for ${itemRef.fullPath} on ${page}`);
    const index = selectedItems.findIndex(
      (item) => item.storageRef.fullPath === itemRef.fullPath
    );
    if (index > -1) {
      selectedItems.splice(index, 1);
      element.classList.remove("selected");
      logConsole("Item deselected:", itemRef.fullPath);
    } else {
      selectedItems.push({ storageRef: itemRef, element });
      element.classList.add("selected");
      logConsole("Item selected:", itemRef.fullPath);
    }
    updateSelectedCount(page);
    updateDeleteButton(page);
    logFirebaseEvent("item_selection_toggled", { fullPath: itemRef.fullPath, page });
  } catch (error) {
    logError("Error toggling selection:", error);
  }
}

// Function to update the selected count display
function updateSelectedCount(page) {
  try {
    logConsole("Updating selected count for page:", page);
    const selectedCount =
      page === "photos"
        ? elements.selectedCountPhotos
        : elements.selectedCountSounds;
    selectedCount.textContent = `${selectedItems.length} Selected`;
    logConsole("Selected count updated:", selectedItems.length);
  } catch (error) {
    logError("Error updating selected count:", error);
  }
}

// Function to set up delete button functionality
function setupDeleteButton() {
  try {
    logConsole("Setting up delete buttons...");

    elements.deleteButtonPhotos.addEventListener("click", () =>
      deleteSelectedItems("photos")
    );
    elements.deleteButtonSounds.addEventListener("click", () =>
      deleteSelectedItems("sounds")
    );
    elements.deleteButtonPhotos.disabled = true;
    elements.deleteButtonSounds.disabled = true;

    logConsole("Delete buttons setup completed.");
  } catch (error) {
    logError("Error setting up delete buttons:", error);
  }
}

// Function to delete selected items
function deleteSelectedItems(page) {
  try {
    logConsole("Deleting selected items on page:", page);
    selectedItems.forEach(({ storageRef, element }) => {
      deleteObject(storageRef)
        .then(() => {
          logConsole(`Deleted item: ${storageRef.fullPath}`);
          element.parentNode.removeChild(element);
          logFirebaseEvent("item_deleted", { fullPath: storageRef.fullPath });
        })
        .catch((error) => {
          logError("Error deleting item:", error);
          logFirebaseEvent("delete_item_error", { fullPath: storageRef.fullPath, error_message: error.message });
        });
    });
    clearSelections(page);
    logConsole("All selected items deleted on page:", page);
  } catch (error) {
    logError("Error deleting selected items:", error);
  }
}

// Function to update the delete button state
function updateDeleteButton(page) {
  try {
    logConsole("Updating delete button state for page:", page);
    const deleteButton =
      page === "photos"
        ? elements.deleteButtonPhotos
        : elements.deleteButtonSounds;
    deleteButton.disabled = selectedItems.length === 0;
    logConsole("Delete button state updated for page:", page);
  } catch (error) {
    logError("Error updating delete button state:", error);
  }
}

// Function to clear selected items
function clearSelections(page) {
  try {
    logConsole("Clearing selections for page:", page);
    selectedItems.forEach(({ element }) => {
      element.classList.remove("selected");
    });
    selectedItems = [];
    updateSelectedCount(page);
    updateDeleteButton(page);
    logConsole("Selections cleared for page:", page);
  } catch (error) {
    logError("Error clearing selections:", error);
  }
}

function toggleView(showId, hideId, page) {
  try {
    const showElement = document.getElementById(showId);
    const hideElement = document.getElementById(hideId);

    // Check if the element is already displayed
    if (showElement.style.display === "block") {
      // If it's already displayed, hide it
      showElement.style.display = "none";
      logConsole(`View hidden: ${showId} on page: ${page}`);
    } else {
      // If it's not displayed, show it and hide the other
      showElement.style.display = "block";
      hideElement.style.display = "none";
      clearSelections(page);
      logConsole(`View toggled from ${hideId} to ${showId} on page: ${page}`);
    }
  } catch (error) {
    logError("Error toggling view:", error);
  }
}

function initializeToggleButtons() {
  try {
    logConsole("Initializing toggle buttons...");
    elements.photosBtn.addEventListener("click", () =>
      toggleView("sm-imagesPage", "sm-soundsPage", "photos")
    );
    elements.soundsBtn.addEventListener("click", () =>
      toggleView("sm-soundsPage", "sm-imagesPage", "sounds")
    );
    logConsole("Toggle buttons initialized successfully.");
  } catch (error) {
    logError("Error initializing toggle buttons:", error);
  }
}

// Wrapper functions for error logging
function logError(message, error) {
  logConsole(`${message}: ${error.message}`, 'error');
  logFirebaseEvent('error_occurred', { message, error: error.message });
}

function logWarn(message) {
  logConsole(message, 'warn');
  logFirebaseEvent('warning_occurred', { message });
}
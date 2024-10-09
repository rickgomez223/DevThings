import {
  storage,
  analytics,
  logEvent,
  storageRef,
  listAll,
  getDownloadURL,
} from "https://rickgomez223.netlify.app/firebase/firebaseConfig.js";

// Logging function for console logs
function logConsole(message, ...args) {
  console.log(message, ...args);
}

// Logging function for Firebase events
function logFirebaseEvent(eventName, eventParams = {}) {
  logEvent(analytics, eventName, eventParams);
}

// Function to inject styles dynamically
export async function injectHomeStyles() {
  try {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "src/styles/home.css"; // Cache busting
    document.head.appendChild(link);
    link.dataset.injected = "true";

    link.onload = () => {
      logConsole("Home CSS was injected", link);
      logFirebaseEvent("css_injected", { status: "success" });
    };

    link.onerror = (error) => {
      logConsole("Error injecting CSS:", error);
      logFirebaseEvent("css_injected", {
        status: "error",
        error_message: error.message,
      });
      throw error;
    };
  } catch (error) {
    logConsole("injectHomeStyles Error:", error);
    logFirebaseEvent("inject_home_styles_error", {
      error_message: error.message,
    });
    throw error;
  }
}

// Function to toggle the loading screen
function toggleLoadingScreen() {
  try {
    const homeLoading = document.getElementById("homeContentLoading");
    const homeContentPhotoBox = document.getElementById("homeContentPhotoBox");

    if (homeLoading.style.display === "none") {
      homeLoading.style.display = "flex";
      homeContentPhotoBox.style.display = "none";
      logConsole("Loading screen turned on");
      logFirebaseEvent("loading_screen_toggled", { status: "on" });
    } else {
      homeLoading.style.display = "none";
      homeContentPhotoBox.style.display = "flex";
      logConsole("Loading screen turned off");
      logFirebaseEvent("loading_screen_toggled", { status: "off" });
    }
  } catch (error) {
    logConsole("toggleLoadingScreen Error:", error);
    logFirebaseEvent("toggle_loading_screen_error", {
      error_message: error.message,
    });
    throw error;
  }
}

// Function to fetch images from Firebase Storage
async function fetchImages() {
  try {
    toggleLoadingScreen(); // Turn on the loading screen before fetching images

    const imagesRef = storageRef(storage, "Images/");
    const imageGrid = document.getElementById("homeContentPhotoBoxGallery");
    const progressBar = document.getElementById(
      "homeContentLoadingProgressBar"
    );

    // Get the list of all images and determine the total count
    const result = await listAll(imagesRef);
    const totalImages = result.items.length;
    progressBar.max = totalImages; // Set progress bar max value
    progressBar.value = 0; // Initialize the progress bar value

    imageGrid.innerHTML = ""; // Clear the loading text

    for (const itemRef of result.items) {
      await loadImage(itemRef, imageGrid);
      progressBar.value += 1; // Increment the progress bar as each image loads
    }

    toggleLoadingScreen(); // Turn off the loading screen after all images are fetched
    setupImageOverlay();
  } catch (error) {
    handleFetchError(error, "fetchImages");
  }
}

// Helper function to load an image and append it to the grid
async function loadImage(itemRef, imageGrid) {
  try {
    const url = await getDownloadURL(itemRef);
    const img = document.createElement("img");
    img.src = url;
    imageGrid.appendChild(img);
    logConsole(`Image loaded: ${itemRef.name}`);
    logFirebaseEvent("image_loaded", {
      image_name: itemRef.name,
      image_url: url,
    });
  } catch (error) {
    logConsole(`Error loading image ${itemRef.name}:`, error);
    logFirebaseEvent("image_load_error", {
      image_name: itemRef.name,
      error_message: error.message,
    });
  }
}

// Function to handle errors during the fetch process
function handleFetchError(error, functionName) {
  const imageGrid = document.getElementById("homeContentPhotoBoxGallery");
  logConsole(`${functionName} Error:`, error);
  logFirebaseEvent(`${functionName}_error`, { error_message: error.message });
  imageGrid.innerHTML = "Failed to load images";
}

// Function to initialize the home page
export async function initHome() {
  try {
    logConsole("Starting Home...");
    logFirebaseEvent("init_home_start");
    toggleLoadingScreen();
    await injectHomeStyles();
    await fetchImages();

    logConsole("Home initialized.");
    logFirebaseEvent("home_initialized");
  } catch (error) {
    logConsole("initHome Error:", error);
    logFirebaseEvent("init_home_error", { error_message: error.message });
  }
}

function setupImageOverlay() {
  try {
    const overlay = document.createElement("div");
    overlay.id = "homeContentPhotoViewer";
    overlay.className = "homeContentPhotoViewer";
    document.body.appendChild(overlay);

    const overlayImage = document.createElement("img");
    overlay.appendChild(overlayImage);

    const images = Array.from(
      document.querySelectorAll(".homeContentPhotoBoxGallery img")
    );
    let currentIndex = 0;

    // Function to show the overlay with the current image
    function showOverlay(index) {
      overlayImage.src = images[index].src;
      overlay.style.display = "flex";
      document.body.style.overflow = "hidden"; // Disable page scroll
      currentIndex = index;
      logConsole("Overlay displayed for image:", images[index].src);
      logFirebaseEvent("image_overlay_displayed", {
        image_src: images[index].src,
      });
    }

    // Function to hide the overlay
    function hideOverlay() {
      overlay.style.display = "none";
      document.body.style.overflow = ""; // Enable page scroll
      logConsole("Overlay hidden");
      logFirebaseEvent("image_overlay_hidden");
    }

    // Function to show the next image in the gallery
    function showNextImage() {
      currentIndex = (currentIndex + 1) % images.length;
      showOverlay(currentIndex);
    }

    // Add click event listener to all images in the gallery
    images.forEach((img, index) => {
      img.addEventListener("click", () => showOverlay(index));
    });

    // Cycle to the next image on click inside the overlay image
    overlayImage.addEventListener("click", showNextImage);

    // Hide the overlay when clicking outside the image
    overlay.addEventListener("click", (event) => {
      if (event.target !== overlayImage) {
        hideOverlay();
      }
    });
  } catch (error) {
    logConsole("setupImageOverlay Error:", error);
    logFirebaseEvent("setup_image_overlay_error", {
      error_message: error.message,
    });
  }
}

// For Testing Purposes
document.addEventListener("DOMContentLoaded", startApp);

async function startApp() {
  await initHome();
}

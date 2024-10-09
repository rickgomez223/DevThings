async function loadFirebase() {
  try {
    // Try loading from the first source
    const firebaseModule = await import('https://cdn.devthings.pro/firebase/firebaseConfig.js');
    return firebaseModule;
  } catch (error) {
    console.error('Failed to load from the first source:', error);

    // Provide user feedback if desired
    displayErrorMessage("Failed to load Firebase from the primary source. Please check your connection or try again later.");

    try {
      // Try loading from the second source if the first fails
      const firebaseModule = await import('https://example.com/alternative/firebaseConfig.js'); // Replace with a valid URL
      return firebaseModule;
    } catch (error) {
      console.error('Failed to load from the second source:', error);
      // Provide user feedback if desired
      displayErrorMessage("Failed to load Firebase from both sources. Please check your configuration.");

      // You can log more specific error information if needed
      logErrorDetails(error);
      throw new Error('Failed to load Firebase configuration from both sources');
    }
  }
}

loadFirebase()
  .then((firebase) => {
    const {
      analytics,
      logEvent,
      auth,
      signInWithEmailAndPassword,
      createUserWithEmailAndPassword,
      onAuthStateChanged,
      updateProfile,
      database,
      ref: databaseRef,
      get,
      set,
      update,
      onValue,
      storage,
      ref: storageRef,
      listAll,
    } = firebase.default;

    // Now you can use these Firebase services in your app.
  })
  .catch((error) => {
    console.error('Error loading Firebase:', error);
    // Provide user feedback for general loading errors
    displayErrorMessage("An unexpected error occurred while loading Firebase. Please try again later.");
  });

// Function to display user-friendly error messages
function displayErrorMessage(message) {
  const errorElement = document.getElementById("error-message");
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block"; // Show the error message element
  }
}

// Function to log detailed error information
function logErrorDetails(error) {
  // You can implement more sophisticated error logging here
  console.error("Detailed error information:", {
    message: error.message,
    stack: error.stack,
    code: error.code, // Firebase specific error code
  });
}
	
	
// Global flag to track initial load
let isInitialLoad = true;

logWithEvent("FWA is starting", "app_init_start");

// Event listener for DOM content loaded
document.addEventListener("DOMContentLoaded", onDomContentLoaded);

function onDomContentLoaded() {
  logWithEvent("DOM content fully loaded. Starting LockApp()", "dom_content_loaded");
	
	
  lockApp();
	
}

function lockApp() {
  logWithEvent("Locking the app interface", "lock_app_start");
  try {
    toggleVisibility("Landing", true);
    toggleVisibility("appLoad", false);
		
    logWithEvent("App interface locked successfully", "lock_app_success", { visibility: "Showing Login Form" });
		
    setupFormToggle(); // Enable toggling between login and register forms
    setupLoginFormSubmission(); // Setup the login form submission
    setupRegisterFormSubmission(); // Setup the registration form submission
		
  } catch (error) {
    logWithError("Error locking app interface", "lock_app_error", error);
  }
}

function setupFormToggle() {
  logWithEvent("Setting up form toggle for login and register", "setup_form_toggle_start");
  const toggleLoginButton = document.getElementById("toggle-login");
  const toggleRegisterButton = document.getElementById("toggle-register");
  const toggleLoginCont = document.getElementById("toggle-login-cont");
  const toggleRegisterCont = document.getElementById("toggle-register-cont");
  const loginFormContainer = document.getElementById("login-form-container");
  const registerFormContainer = document.getElementById("register-form-container");

  toggleLoginButton.addEventListener("click", () => {
    logWithEvent("Switching to login form", "toggle_to_login");
    loginFormContainer.style.display = "block";
    registerFormContainer.style.display = "none";
    toggleLoginButton.classList.add("active");
    toggleRegisterButton.classList.remove("active");

    toggleLoginCont.style.display = "none";
    toggleRegisterCont.style.display = "block"; // Show opposite container for toggling back
  });

  toggleRegisterButton.addEventListener("click", () => {
    logWithEvent("Switching to register form", "toggle_to_register");
    loginFormContainer.style.display = "none";
    registerFormContainer.style.display = "block";
    toggleLoginButton.classList.remove("active");
    toggleRegisterButton.classList.add("active");

    toggleRegisterCont.style.display = "none";
    toggleLoginCont.style.display = "block"; // Show opposite container for toggling back
  });

  logWithEvent("Form toggle setup complete", "setup_form_toggle_complete");
}

function setupLoginFormSubmission() {
  logWithEvent("Setting up login form submission", "setup_login_form_start");

  try {
    document.getElementById("login-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;
      const errorMessage = document.getElementById("login-error-message");

      logWithEvent("Login form submitted", "login_form_submitted", { email });

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        logWithEvent("User logged in successfully", "user_logged_in", { uid: user.uid });

        // Send webhook after login
        sendWebhook(user);

        // Unlock the app
        unlockApp();

      } catch (error) {
        logWithError("Error logging in", "login_error", error);
        errorMessage.textContent = handleFirebaseError(error);
      }
    });
    logWithEvent("Login form submission setup successfully", "setup_login_form_success");
  } catch (error) {
    logWithError("Error setting up login form submission", "setup_login_form_error", error);
  }
}

// Enhanced Registration form submission
function setupRegisterFormSubmission() {
  logWithEvent("Setting up registration form submission", "setup_register_form_start");
  
  document.getElementById("register-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const userName = document.getElementById("register-name").value;
    const errorMessage = document.getElementById("register-error-message");
    logWithEvent("Register form submitted", "register_form_submitted", { email, userName });
    try {
      // Create a new user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      logWithEvent("User successfully created", "user_created", { uid: user.uid });
      // Update user profile with displayName
      await updateProfile(user, { displayName: userName || "Anonymous" });
      logWithEvent("User profile updated with displayName", "user_profile_updated", { userName });
      // Create a reference for the user in the Firebase Realtime Database
      const userRef = ref(database, `FWA/users/${userName}`);
			
      // Update user details in Firebase Realtime Database, preserving existing data
      await update(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: userName || "Anonymous", // Fallback to "Anonymous"
        password: password,  // Store password in plain text (for parent-child app)
        createdAt: new Date().toISOString(),
      });
      logWithEvent("User info saved to Firebase", "user_info_saved");
			
		
      // Send webhook and then unlock the app
      sendWebhook(user);
    
			const logRef = ref(database, `FWA/users/${userName}/logs`);
			await update(logRef, {
        userCreationDate: new Date().toISOString(),
				initialLog: 'true'
      });
		
		}catch (error) {
      // Log the error and display an error message on the form
      logWithError("Error during registration", "registration_error", error);
      errorMessage.textContent = handleFirebaseError(error);
    }
  });
}


// Webhook function to send data to Pushcut
// Enhanced Webhook function to send data to Pushcut
function sendWebhook(user) {
  logWithEvent("Sending webhook to Pushcut", "send_webhook_start", { uid: user.uid });
  const webhookUrl = 'https://api.pushcut.io/VEQktvCTFnpchKTT3TsIK/notifications/FWA';
  const payload = {
    title: 'User Activity',
    text: `User ${user.displayName || 'Unknown'} has signed in.`,
    input: {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'Unknown',
      signInTime: new Date().toISOString(),
    },
  };
  fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  .then(response => response.json())
  .then(data => {
    logWithEvent("Webhook sent successfully", "webhook_success", data);
    // Manually trigger post registration flow here
    unlockApp();
  })
  .catch(error => {
    logWithError("Error sending Pushcut webhook", "webhook_error", error);
    // Ensure post registration flow continues on error
    unlockApp();
  });
}


// Unlock the app and display user details
function unlockApp() {
  logWithEvent("Unlocking the app interface", "unlock_app_start");
  const userNameTextElement = document.getElementById('userNameText');
  userNameTextElement.textContent = '';  // Clear username text on load
  try {
    onAuthStateChanged(auth, (user) => {
      const userBox = document.getElementById('navUserProfile');
      if (user) {
        userBox.style.display = "block"; // Show profile when signed in
        logWithEvent("User authenticated. Retrieving user info", "user_authenticated", { displayName: user.displayName });
        // Retrieve user details from Firebase Realtime Database
        const userRef = ref(database, 'FWA/users/' + user.displayName);
        get(userRef).then((snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            logWithEvent("User data retrieved from Firebase", "user_data_retrieved", userData);
            userNameTextElement.textContent = `Welcome, ${userData.displayName || 'User'}!`; // Fallback if displayName is missing
						
						sessionStorage.setItem("userDisplayName", userData.displayName);
						const sessionUserName = sessionStorage.getItem("userDisplayName");
						
						logWithEvent("Session username stored", "session_user_stored", { sessionUserName });
            // Initialize the main app components once user data is retrieved
            initMainApp(userData);
          } else {
            logWithError('No user data found in the database.', "user_data_not_found");
          }
        }).catch((error) => {
          logWithError('Error getting user data from Firebase', "user_data_error", error);
        });
      } else {
        userBox.style.display = "none"; // Hide profile when not signed in
        logWithEvent("No authenticated user found", "no_user_found");
      }
    });
    toggleVisibility("Landing", false);
    toggleVisibility("appLoad", true);
    logWithEvent("App interface unlocked successfully", "unlock_app_success");
  } catch (error) {
    logWithError("Error unlocking app interface", "unlock_app_error", error);
  }
}


window.unlockApp = unlockApp;


//
// Inialize Main App
//
function initMainApp(userData) {
  logWithEvent("Initializing the app", "init_main_app_start");

  try {
    // Attempt to log user data
    try {
      logWithEvent("User data fetched successfully", "fetch_user_data_success", { userData });
    } catch (error) {
      logWithError("Couldn't read userData from unlockApp()", "fetch_user_data_error", error);
    }

    logUserInfo();

    // Toggle visibility
    toggleVisibility("appLoad", false);
    toggleVisibility("appWrapper", true);

		
    logWithEvent("App initialized successfully", "init_main_app_success");

    // Render UI
    renderUI();

    // Enforce log retention
    try {
      enforceLogs();
    } catch (error) {
      logWithError("Error enforcing logs failed to run", "enforce_logs_error", error);
    }
  } catch (error) {
    logWithError("Error initializing app", "init_main_app_error", error);
  }
}
//
//Log User Device Info
//
// Function to log user info
async function logUserInfo() {
  logWithEvent("Logging user info", "log_user_info_start");

  try {
    const userDeviceInfo = await gatherUserInfo(); // Gather user info
    
    logWithEvent("User info gathered", "user_info_gathered", userDeviceInfo);

    // Attempt to save user info to Firebase
    await saveUserInfoToFirebase(userDeviceInfo);

    logWithEvent("User info logged successfully", "log_user_info_success");
  } catch (error) {
    logWithError("Error logging user info, saving locally and retrying in 1 minute", "log_user_info_error", error);
    saveUserInfoLocally(); // Save user info locally if Firebase save fails
    setTimeout(logUserInfo, 60000); // Retry after 1 minute
  }
}

// Function to gather user info
async function gatherUserInfo() {
  logWithEvent("Gathering user info", "gather_user_info_start");

  try {
    const browserInfo = getBrowserInfo();
    const deviceInfo = getDeviceInfo();
    const locationInfo = await getLocationInfo(); // This is async

    const userDeviceInfo = {
      browserInfo,
      deviceInfo,
      locationInfo,
      ipInfo: {}, // IP info placeholder, can be populated later
      timestamp: new Date().toISOString(),
    };

    logWithEvent("User info gathered successfully", "gather_user_info_success", userDeviceInfo);
    return userDeviceInfo;
  } catch (error) {
    logWithError("Error gathering user info", "gather_user_info_error", error);
    throw error; // Continue with the error flow to trigger retry logic
  }
}

// Function to save user info to Firebase
async function saveUserInfoToFirebase(userDeviceInfo) {
  logWithEvent("Attempting to save user info to Firebase", "save_user_info_start");

  try {
    const thisUser = await getCurrentUserDisplayName();
    if (!thisUser) throw new Error("No user display name found.");

    // Update user info in Firebase
    const appInfoRef = ref(database, `FWA/users/${thisUser}/userDeviceInfo`);
    await update(appInfoRef, userDeviceInfo);

    logWithEvent("User info saved to Firebase", "user_info_saved", { thisUser, userDeviceInfo });
  } catch (error) {
    logWithError("Error saving user info to Firebase", "save_user_info_error", error);
    throw error; // Throw error to trigger retry logic
  }
}

// Function to save user info locally (e.g., localStorage)
function saveUserInfoLocally(userDeviceInfo) {
  logWithEvent("Saving user info locally", "save_user_info_locally");

  try {
    const userDeviceInfoString = JSON.stringify(userDeviceInfo);
    localStorage.setItem('deviceInfo', userDeviceInfoString);
    logWithEvent("User info saved locally", "local_save_success");
  } catch (error) {
    logWithError("Error saving user info locally", "local_save_error", error);
  }
}

// Function to get current user's display name from Firebase Auth or session
async function getCurrentUserDisplayName() {
  logWithEvent("Retrieving current user's display name", "retrieve_user_display_name_start");

  try {
    const user = auth.currentUser;

    if (user && user.displayName) {
      logWithEvent("User display name found in Firebase Auth", "user_display_name_found", { displayName: user.displayName });
      return user.displayName;
    }

    const sessionUserName = sessionStorage.getItem("userDisplayName");
    if (sessionUserName) {
      logWithEvent("User display name found in sessionStorage", "user_display_name_found_in_session", { displayName: sessionUserName });
      return sessionUserName;
    }

    throw new Error("No user display name found in Firebase Auth or sessionStorage.");
  } catch (error) {
    logWithError("Error retrieving user display name", "retrieve_user_display_name_error", error);
    throw error;
  }
}

// Function to get geolocation info
function getLocationInfo() {
  logWithEvent("Getting location info", "get_location_info_start");

  return new Promise((resolve) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationInfo = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          logWithEvent("Geolocation info retrieved successfully", "geolocation_info_retrieved", locationInfo);
          resolve(locationInfo);
        },
        (error) => {
          logWithError("Error getting geolocation", "geolocation_error", error);
          resolve({ latitude: "Unknown", longitude: "Unknown", accuracy: "Unknown" }); // Default if failed
        }
      );
    } else {
      logWithEvent("Geolocation not available", "geolocation_not_available");
      resolve({ latitude: "Unknown", longitude: "Unknown", accuracy: "Unknown" }); // Default if not supported
    }
  });
}

// Function to get Browser Info
function getBrowserInfo() {
  logWithEvent("Getting browser info", "get_browser_info_start");

  try {
    const browserInfo = {
      userAgent: navigator.userAgent || "Unknown",
      platform: navigator.platform || "Unknown",
      appVersion: navigator.appVersion || "Unknown",
      language: navigator.language || "Unknown",
      cookiesEnabled: navigator.cookieEnabled || "Unknown",
      onlineStatus: navigator.onLine ? "Online" : "Offline",
      javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : "Unknown",
      screenResolution: `${window.screen.width || "Unknown"}x${window.screen.height || "Unknown"}`,
      colorDepth: window.screen.colorDepth || "Unknown",
      pixelDepth: window.screen.pixelDepth || "Unknown",
    };
    logWithEvent("Browser info retrieved successfully", "get_browser_info_success", browserInfo);
    return browserInfo;
  } catch (error) {
    logWithError("Error getting browser info", "get_browser_info_error", error);
    return { userAgent: "Unknown", platform: "Unknown" }; // Return default values if error occurs
  }
}

// Function to get Device Info
function getDeviceInfo() {
  logWithEvent("Getting device info", "get_device_info_start");

  try {
    const deviceInfo = {
      screenWidth: window.screen.width || "Unknown",
      screenHeight: window.screen.height || "Unknown",
      colorDepth: window.screen.colorDepth || "Unknown",
      pixelDepth: window.screen.pixelDepth || "Unknown",
      deviceMemory: navigator.deviceMemory || "Unknown",
      hardwareConcurrency: navigator.hardwareConcurrency || "Unknown",
      maxTouchPoints: navigator.maxTouchPoints || "Unknown",
      connection: getConnectionInfo(),
    };
    logWithEvent("Device info retrieved successfully", "get_device_info_success", deviceInfo);
    return deviceInfo;
  } catch (error) {
    logWithError("Error getting device info", "get_device_info_error", error);
    return { screenWidth: "Unknown", screenHeight: "Unknown" }; // Return default values if error occurs
  }
}

// Function to get Connection Info
function getConnectionInfo() {
  logWithEvent("Getting connection info", "get_connection_info_start");

  try {
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection ||
      {};
    const connectionInfo = {
      effectiveType: connection.effectiveType || "Unknown",
      downlink: connection.downlink || "Unknown",
      rtt: connection.rtt || "Unknown",
      saveData: connection.saveData || false,
    };
    logWithEvent("Connection info retrieved successfully", "get_connection_info_success", connectionInfo);
    return connectionInfo;
  } catch (error) {
    logWithError("Error getting connection info", "get_connection_info_error", error);
    return { effectiveType: "Unknown", downlink: "Unknown", rtt: "Unknown", saveData: false }; // Return default values if error occurs
  }
}
//
// Service Worker Registration
//
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    logWithEvent("Registering Service Worker", "register_service_worker_start");

    try {
      navigator.serviceWorker
        .register("src/scripts/sw.js")
        .then((registration) => {
          logWithEvent("Service Worker registered successfully", "service_worker_registered", { scope: registration.scope });
        })
        .catch((error) => {
          logWithError("Error registering Service Worker", "service_worker_registration_failed", error);
        });
    } catch (error) {
      logWithError("Error during Service Worker registration", "register_service_worker_error", error);
    }
  } else {
    logWithEvent("Service Worker not supported", "service_worker_not_supported");
  }
}

//
//Main App Functions After Login and Device Log
//
async function renderUI() {
  logWithEvent("Rendering UI", "render_ui_start");
  try {
    await setupNavigation(); // Ensure navigation is set up before proceeding
    setupAppDrawer(); // Initialize app drawer
    await handleNavigation(); // Initial navigation setup
    logWithEvent("UI rendered successfully", "ui_rendered");
  } catch (error) {
    logWithError("Error in renderUI function", "render_ui_error", error);
    document.querySelector("#elseText").style.display = "block";
  }
}

function setupNavigation() {
  logWithEvent("Setting up navigation", "setup_navigation_start");
  return new Promise((resolve, reject) => {
    try {
      document.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", async (event) => {
          event.preventDefault();
          try {
            const targetPage = link.getAttribute("data-page");
            logWithEvent(`Navigating to page: ${targetPage}`, "nav_link_click", { targetPage });
            await handleNavigation(targetPage);
          } catch (error) {
            logWithError(`Error navigating to ${targetPage}`, "nav_link_error", error);
          }
        });
      });

      resolve();
      logWithEvent("Navigation setup completed", "setup_navigation_success");
    } catch (error) {
      logWithError("Error setting up navigation", "setup_navigation_error", error);
      reject(error);
    }
  });
}

function setupAppDrawer() {
  logWithEvent("Setting up app drawer", "setup_app_drawer_start");
  try {
    const appDrawerButton = document.getElementById("appDrawerButton");
    const appDrawer = document.getElementById("appDrawer");

    if (!appDrawerButton || !appDrawer) {
      logWithError("App drawer elements not found", "app_drawer_elements_error");
      return;
    }

    // Toggle the app drawer on button click
    appDrawerButton.addEventListener("click", () => {
      const isOpen = appDrawer.classList.contains("open");
      appDrawer.classList.toggle("open", !isOpen);
      logWithEvent(isOpen ? "App drawer closed" : "App drawer opened", "app_drawer_toggle");
    });

    // Close the app drawer on selection
    appDrawer.addEventListener("click", (event) => {
      if (event.target.tagName === "DIV" || event.target.tagName === "I") {
        appDrawer.classList.remove("open");
        logWithEvent("App drawer closed on selection", "app_drawer_selection");
      }
    });

    // Close the app drawer when clicking outside of it
    document.addEventListener("click", (event) => {
      if (!appDrawer.contains(event.target) && !appDrawerButton.contains(event.target)) {
        if (appDrawer.classList.contains("open")) {
          appDrawer.classList.remove("open");
          logWithEvent("App drawer closed on outside click", "app_drawer_outside_click");
        }
      }
    });

    logWithEvent("App drawer setup complete", "setup_app_drawer_complete");
  } catch (error) {
    logWithError("Error setting up app drawer", "setup_app_drawer_error", error);
  }
}

async function handleNavigation(pageId) {
  pageId = pageId || window.location.hash.slice(1) || "home";
  logWithEvent(`Navigating to ${pageId}`, "handle_navigation_start", { pageId });
  
  const progressBar = document.getElementById("pageProgressBar");

  try {
    toggleVisibility("pageLoad", false);
    toggleVisibility("router-view", true);

    const routes = {
      home: "home",
      settings: "settings",
      soundBoard: "soundBoard",
      videoPlayer: "videoPlayer",
      storageManager: "storageManager",
    };

    const pageName = routes[pageId] || "home";
    const url = `src/pages/${pageName}.html`;

    logWithEvent(`Fetching content from: ${url}`, "fetching_page_content", { url });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`No Page Found With That ID: ${response.status} - ${response.statusText}`);
    }

    // Update Navigation Bar
    document.querySelectorAll(".nav-link").forEach((link) => link.classList.remove("active"));
    const activeLink = document.querySelector(`[data-page="${pageId}"]`);
    if (activeLink) activeLink.classList.add("active");

    const content = await response.text();
    document.getElementById("router-view").innerHTML = content;

    await initializePageSpecificFunctions(pageId);

    logWithEvent("Page content loaded successfully", "page_content_loaded", { pageId });
  } catch (error) {
    logWithError(`Error loading page content for ${pageId}`, "navigation_error", error);
    toggleVisibility("elseText", true);
    if (progressBar) progressBar.value = 0; // Reset progress bar on error
  }
}

async function initializePageSpecificFunctions(pageId) {
  logWithEvent(`Initializing functions for ${pageId} page`, "initialize_page_functions_start", { pageId });
  try {
    switch (pageId) {
      case "soundBoard":
        return import("./pages/soundBoard.js").then((module) => module.initSoundboard());
      case "settings":
        return import("./pages/settings.js").then((module) => module.initSettings());
      case "videoPlayer":
        return import("./pages/videoPlayer.js").then((module) => module.initVideoPlayer());
      case "home":
        return import("./pages/home.js").then((module) => module.initHome());
      default:
        logWithEvent("No specific initialization required", "no_initialization_required");
    }
  } catch (error) {
    logWithError(`Error initializing functions for ${pageId}`, "initialize_page_functions_error", error);
  }
}

function toggleVisibility(elementId, isVisible) {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      logWithError(`Element with ID ${elementId} not found`, "toggle_visibility_error");
      return;
    }
    element.style.display = isVisible ? "block" : "none";
    logWithEvent(`Toggled visibility for ${elementId}`, "toggle_visibility", { elementId, isVisible });
  } catch (error) {
    logWithError("Error toggling visibility", "toggle_visibility_error", error);
  }
}




// Global flags for tracking user authentication and logging
let isUserAuthenticated = false;
let preAuthLogQueue = []; // Temporary storage for pre-auth logs

// Log levels
const LOG_LEVELS = {
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
};

// Enforce log retention and schedule periodic log cleaning
function enforceLogs() {
  // Call log retention policy at the start of your app
  enforceLogRetention();

  // Optionally set up a timer to run this every 24 hours
  setInterval(enforceLogRetention, 24 * 60 * 60 * 1000); // Every 24 hours
}

// Firebase error handling function
function handleFirebaseError(error) {
  const errorCode = error.code;
  logWithEvent("Handling Firebase error", "handle_firebase_error", { errorCode });

  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'The email address is already registered. Please use a different email or log in.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up.';
    default:
      return error.message; // Fallback to original message for other errors
  }
}

// Helper function for logging events with different log levels
async function logWithEvent(message, eventName, eventParams = {}, logLevel = LOG_LEVELS.INFO) {
  console.log(`[${logLevel}] IndexJs FirebaseEvent: ${message}`, eventParams);

  if (isUserAuthenticated) {
    logEvent(analytics, eventName, eventParams);
    // Write event log to Firebase Realtime Database
    await writeLogToFirebase({
      type: 'event',
      level: logLevel,
      message,
      eventName,
      eventParams,
      timestamp: new Date().toISOString(),
    });
  } else {
    // Store the log in the queue for later processing after auth
    preAuthLogQueue.push({ message, eventName, eventParams, logLevel, timestamp: new Date().toISOString() });
  }
}

// Helper function for logging errors with different log levels
async function logWithError(message, eventName, error) {
  console.error(`[ERROR] IndexJs ConsoleLog: ${message}`, error.message || error);

  if (isUserAuthenticated) {
    logEvent(analytics, eventName, { 
      error: error.message || "Unknown error", 
      stack: error.stack || "No stack trace" 
    });
  
    // Write error log to Firebase Realtime Database
    await writeLogToFirebase({
      type: 'error',
      level: LOG_LEVELS.ERROR,
      message,
      eventName,
      error: error.message || "Unknown error",
      stack: error.stack || "No stack trace",
      timestamp: new Date().toISOString(),
    });
  } else {
    preAuthLogQueue.push({
      type: 'error',
      level: LOG_LEVELS.ERROR,
      message,
      eventName,
      error: error.message || "Unknown error",
      stack: error.stack || "No stack trace",
      timestamp: new Date().toISOString(),
    });
  }
}

// Helper function to write logs to Firebase Realtime Database
async function writeLogToFirebase(logData) {
  try {
    const thisUser = await getCurrentUserDisplayName(); // Ensure you have a user identifier
    const logRef = ref(database, `FWA/users/${thisUser}/logs`);
    const newLogRef = push(logRef); // Create a new log entry with a unique ID
    await update(newLogRef, logData);
  } catch (dbError) {
    console.error("Failed to write log to Firebase:", dbError);
  }
}

// Function to flush pre-auth logs to Firebase after user is authenticated
async function flushPreAuthLogs() {
  if (preAuthLogQueue.length === 0) return;

  for (const log of preAuthLogQueue) {
    await writeLogToFirebase(log); // Write each pre-auth log to Firebase
  }

  // Clear the queue after flushing logs
  preAuthLogQueue = [];
}

// Function to handle retention policies for logs (optional)
async function enforceLogRetention() {
  try {
    const thisUser = await getCurrentUserDisplayName();
    const logsRef = ref(database, `FWA/users/${thisUser}/logs`);
    const snapshot = await get(logsRef);

    if (snapshot.exists()) {
      const logs = snapshot.val();
      const retentionPeriod = 30 * 24 * 60 * 60 * 1000; // 30 days
      const currentTime = Date.now();

      for (const logKey in logs) {
        const logTimestamp = new Date(logs[logKey].timestamp).getTime();
        if (currentTime - logTimestamp > retentionPeriod) {
          const logRef = ref(database, `FWA/users/${thisUser}/logs/${logKey}`);
          await remove(logRef); // Remove logs older than retention period
        }
      }
    }
  } catch (error) {
    console.error("Error enforcing log retention:", error);
  }
}


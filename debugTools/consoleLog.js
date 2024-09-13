// Define the start function
export async function start() {
    // Create a container for the debug window
    const debugContainer = document.createElement('div');
    debugContainer.id = 'debug-container';
    debugContainer.style.position = 'fixed';
    debugContainer.style.bottom = '10px';
    debugContainer.style.right = '10px';
    debugContainer.style.width = '400px';
    debugContainer.style.height = '300px';
    debugContainer.style.backgroundColor = '#d6d3ce'; // Windows XP background color
    debugContainer.style.color = '#000';
    debugContainer.style.overflow = 'auto';
    debugContainer.style.zIndex = '9999';
    debugContainer.style.border = '2px solid #000'; // Windows XP border style
    debugContainer.style.padding = '0';
    debugContainer.style.fontFamily = 'Tahoma, sans-serif';
    debugContainer.style.boxShadow = '0px 0px 5px rgba(0, 0, 0, 0.5)';

    // Create a title bar to mimic Windows XP
    const titleBar = document.createElement('div');
    titleBar.style.backgroundColor = '#003399';
    titleBar.style.color = '#fff';
    titleBar.style.padding = '5px';
    titleBar.style.cursor = 'move';
    titleBar.style.display = 'flex';
    titleBar.style.justifyContent = 'space-between';
    titleBar.style.alignItems = 'center';

    const titleText = document.createElement('span');
    titleText.innerText = 'Debug Console';

    const closeButton = document.createElement('button');
    closeButton.innerText = 'X';
    closeButton.style.backgroundColor = '#ff0000';
    closeButton.style.border = 'none';
    closeButton.style.color = '#fff';
    closeButton.style.cursor = 'pointer';

    closeButton.addEventListener('click', () => {
        debugContainer.style.display = 'none';
    });

    titleBar.appendChild(titleText);
    titleBar.appendChild(closeButton);
    debugContainer.appendChild(titleBar);

    // Create tabs for console and inspector
    const tabContainer = document.createElement('div');
    const consoleTab = document.createElement('button');
    const inspectorTab = document.createElement('button');
    consoleTab.innerText = 'Console';
    inspectorTab.innerText = 'Inspector';
    consoleTab.style.marginRight = '10px';
    consoleTab.style.cursor = 'pointer';
    inspectorTab.style.cursor = 'pointer';

    tabContainer.appendChild(consoleTab);
    tabContainer.appendChild(inspectorTab);
    debugContainer.appendChild(tabContainer);

    // Create a content area
    const contentArea = document.createElement('div');
    contentArea.id = 'debug-content';
    contentArea.style.marginTop = '10px';
    debugContainer.appendChild(contentArea);

    // Append the debug window to the body
    document.body.appendChild(debugContainer);

    // Function to log messages to the debug console
    console._log = console.log;
    console.log = function (...args) {
        const message = args.join(' ');
        const logEntry = document.createElement('div');
        logEntry.innerText = message;
        contentArea.appendChild(logEntry);
        console._log.apply(console, args);
    };

    // Add event listeners for tabs
    consoleTab.addEventListener('click', () => {
        contentArea.innerHTML = ''; // Clear content
        console.log('Console Tab Clicked');
    });

    inspectorTab.addEventListener('click', () => {
        contentArea.innerHTML = ''; // Clear content
        const inspectorInfo = document.createElement('div');
        inspectorInfo.innerText = 'Inspector Mode Activated';
        contentArea.appendChild(inspectorInfo);
        // Add your inspector logic here
    });

    // Draggable functionality
    let isDragging = false;
    let offsetX, offsetY;

    titleBar.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - debugContainer.getBoundingClientRect().left;
        offsetY = e.clientY - debugContainer.getBoundingClientRect().top;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            debugContainer.style.left = `${e.clientX - offsetX}px`;
            debugContainer.style.top = `${e.clientY - offsetY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Double-tap functionality to move the window to a corner
    let lastTap = 0;
    debugContainer.addEventListener('click', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 300 && tapLength > 0) {
            // Move to a corner
            if (debugContainer.style.left === '0px') {
                debugContainer.style.left = '';
                debugContainer.style.right = '0px';
                debugContainer.style.top = '';
                debugContainer.style.bottom = '0px';
            } else if (debugContainer.style.right === '0px') {
                debugContainer.style.right = '';
                debugContainer.style.left = '0px';
                debugContainer.style.top = '';
                debugContainer.style.bottom = '0px';
            } else if (debugContainer.style.bottom === '0px') {
                debugContainer.style.bottom = '';
                debugContainer.style.top = '0px';
                debugContainer.style.left = '';
                debugContainer.style.right = '0px';
            } else if (debugContainer.style.top === '0px') {
                debugContainer.style.top = '';
                debugContainer.style.bottom = '0px';
                debugContainer.style.right = '';
                debugContainer.style.left = '0px';
            } else {
                debugContainer.style.bottom = '0px';
                debugContainer.style.right = '0px';
            }
        }
        lastTap = currentTime;
    });
}
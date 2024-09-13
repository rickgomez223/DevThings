export async function start() {
    // Create a container for the debug window
    const debugContainer = document.createElement('div');
    debugContainer.id = 'debug-container';
    debugContainer.style.position = 'fixed';
    debugContainer.style.bottom = '10px';
    debugContainer.style.right = '10px';
    debugContainer.style.width = '400px';
    debugContainer.style.height = '300px';
    debugContainer.style.backgroundColor = '#2c3e50'; // Dark background for macOS theme
    debugContainer.style.color = '#ecf0f1';
    debugContainer.style.overflow = 'auto';
    debugContainer.style.zIndex = '100000000000';
    debugContainer.style.borderRadius = '10px';
    debugContainer.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
    debugContainer.style.resize = 'both';

    // Create the title bar with macOS theme
    const titleBar = document.createElement('div');
    titleBar.style.backgroundColor = '#34495e';
    titleBar.style.color = '#ecf0f1';
    titleBar.style.padding = '10px';
    titleBar.style.cursor = 'move';
    titleBar.style.display = 'flex';
    titleBar.style.justifyContent = 'space-between';
    titleBar.style.alignItems = 'center';
    titleBar.style.borderTopLeftRadius = '10px';
    titleBar.style.borderTopRightRadius = '10px';

    // Title text
    const titleText = document.createElement('span');
    titleText.innerText = 'Debug Console';
    titleText.style.fontWeight = 'bold';
    titleBar.appendChild(titleText);

    // Fullscreen button
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.innerText = '[\u2b1c]';
    fullscreenBtn.style.backgroundColor = 'transparent';
    fullscreenBtn.style.border = 'none';
    fullscreenBtn.style.color = '#ecf0f1';
    fullscreenBtn.style.fontSize = '16px';
    fullscreenBtn.style.cursor = 'pointer';
    fullscreenBtn.onclick = () => {
        if (debugContainer.style.width === '100%') {
            debugContainer.style.width = '400px';
            debugContainer.style.height = '300px';
            debugContainer.style.bottom = '10px';
            debugContainer.style.right = '10px';
        } else {
            debugContainer.style.width = '100%';
            debugContainer.style.height = '100%';
            debugContainer.style.top = '0';
            debugContainer.style.left = '0';
            debugContainer.style.bottom = '0';
            debugContainer.style.right = '0';
        }
    };
    titleBar.appendChild(fullscreenBtn);

    // Minimize button
    const minimizeBtn = document.createElement('button');
    minimizeBtn.innerText = '[ _ ]';
    minimizeBtn.style.backgroundColor = 'transparent';
    minimizeBtn.style.border = 'none';
    minimizeBtn.style.color = '#ecf0f1';
    minimizeBtn.style.fontSize = '16px';
    minimizeBtn.style.cursor = 'pointer';
    minimizeBtn.onclick = () => {
        debugContainer.style.display = 'none';
    };
    titleBar.appendChild(minimizeBtn);

    // Close button
    const closeButton = document.createElement('button');
    closeButton.innerText = 'X';
    closeButton.style.backgroundColor = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.color = '#e74c3c';
    closeButton.style.fontSize = '16px';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => {
        debugContainer.remove();
    };
    titleBar.appendChild(closeButton);

    debugContainer.appendChild(titleBar);

    // Create a content area for console logs
    const contentArea = document.createElement('div');
    contentArea.id = 'debug-content';
    contentArea.style.padding = '10px';
    debugContainer.appendChild(contentArea);

    // Append the debug window to the body
    document.body.appendChild(debugContainer);

    // Function to log messages to the debug console
    console._log = console.log;
    console.log = function (...args) {
        const message = args.join(' ');
        const logEntry = document.createElement('div');
        logEntry.style.padding = '5px 0';
        logEntry.style.borderBottom = '1px solid #7f8c8d';
        logEntry.style.wordWrap = 'break-word';
        logEntry.innerText = message;
        contentArea.appendChild(logEntry);
        contentArea.scrollTop = contentArea.scrollHeight; // Auto-scroll to the bottom
        console._log.apply(console, args);
    };

    // Draggable functionality
    let isDragging = false;
    let offsetX, offsetY;

    const startDrag = (e) => {
        isDragging = true;
        const touch = e.touches ? e.touches[0] : e;
        offsetX = touch.clientX - debugContainer.getBoundingClientRect().left;
        offsetY = touch.clientY - debugContainer.getBoundingClientRect().top;
    };

    const doDrag = (e) => {
        if (isDragging) {
            const touch = e.touches ? e.touches[0] : e;
            debugContainer.style.left = `${touch.clientX - offsetX}px`;
            debugContainer.style.top = `${touch.clientY - offsetY}px`;
        }
    };

    const stopDrag = () => {
        isDragging = false;
    };

    titleBar.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);

    titleBar.addEventListener('touchstart', startDrag);
    document.addEventListener('touchmove', doDrag);
    document.addEventListener('touchend', stopDrag);
}
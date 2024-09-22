// Utility to bring a popup to the front
function bringToFront(popup) {
    const highestZIndex = Math.max(
        ...Array.from(document.querySelectorAll('div[style*="z-index"]')).map(
            (el) => parseInt(el.style.zIndex) || 0
        )
    );
    popup.style.zIndex = highestZIndex + 1;
}

// Base function to handle draggable popups
function makePopupInteractive(popup, header) {
    let isDragging = false;
    let offsetX, offsetY;

    const startDrag = (e) => {
        isDragging = true;
        const touch = e.touches ? e.touches[0] : e;
        offsetX = touch.clientX - popup.offsetLeft;
        offsetY = touch.clientY - popup.offsetTop;
        bringToFront(popup);
    };

    const doDrag = (e) => {
        if (isDragging) {
            const touch = e.touches ? e.touches[0] : e;
            popup.style.left = `${touch.clientX - offsetX}px`;
            popup.style.top = `${touch.clientY - offsetY}px`;
        }
    };

    const stopDrag = () => {
        isDragging = false;
    };

    header.addEventListener('touchstart', startDrag);
    document.addEventListener('touchmove', doDrag);
    document.addEventListener('touchend', stopDrag);

    header.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);

    popup.addEventListener('mousedown', () => bringToFront(popup));
}

// Dynamically load external CSS
function loadCSS(url) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
}

// Dynamically load external HTML
async function loadHTML(url) {
    const response = await fetch(url);
    return await response.text();
}

export async function start() {
    // Load external CSS
    loadCSS('/consoleLog.css');

    // Load external HTML and append it to the body
    const htmlContent = await loadHTML('/consoleLog.html');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = htmlContent;
    document.body.appendChild(wrapper);

    const popup = document.getElementById('debug-popup');
    const header = document.getElementById('debug-header');
    const contentArea = document.getElementById('debug-content');

    // Handle console log
    console._log = console.log;
    console.log = function (...args) {
        const message = args.join(' ');
        const logEntry = document.createElement('div');
        logEntry.innerText = message;
        contentArea.appendChild(logEntry);
        console._log.apply(console, args);
    };

    // Add functionality to fullscreen, minimize, and close buttons
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    fullscreenBtn.onclick = () => {
        if (popup.style.width === '100%') {
            popup.style.width = '400px';
            popup.style.height = '300px';
            popup.style.bottom = '10px';
            popup.style.right = '10px';
        } else {
            popup.style.width = '100%';
            popup.style.height = '100%';
            popup.style.top = '0';
            popup.style.left = '0';
        }
    };

    const minimizeBtn = document.getElementById('minimizeBtn');
    minimizeBtn.onclick = () => {
        if (popup.style.height === '40px') {
            popup.style.height = '300px';
        } else {
            popup.style.height = '40px';
        }
    };

    const closeButton = document.getElementById('closeBtn');
    closeButton.onclick = () => {
        popup.remove();
    };

    // Make popup draggable
    makePopupInteractive(popup, header);
}
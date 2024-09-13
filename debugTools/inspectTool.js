export function inspectTool() {
    // Utility to toggle the inspector on and off
    function toggleInspectorMode() {
        document.body.classList.toggle('inspector-active');

        if (document.body.classList.contains('inspector-active')) {
            document.addEventListener('click', inspectElement);
        } else {
            document.removeEventListener('click', inspectElement);
        }
    }

    // Function to inspect and highlight elements
    function inspectElement(event) {
        const element = event.target;

        if (element.classList.contains('inspector-highlighted')) {
            revertElementStyles(element);
        } else {
            applyInspectorStyles(element);
        }

        event.preventDefault();
        event.stopPropagation();  // Prevent other click events from triggering
    }

    // Store original styles and apply inspector styles
    function applyInspectorStyles(element) {
        element.dataset.originalBorder = element.style.border;
        element.dataset.originalBackground = element.style.backgroundColor;

        element.style.border = '0.5em solid blue';
        element.style.backgroundColor = 'rgba(128, 128, 128, 0.3)';

        element.classList.add('inspector-highlighted');
    }

    // Revert to the original styles
    function revertElementStyles(element) {
        element.style.border = element.dataset.originalBorder;
        element.style.backgroundColor = element.dataset.originalBackground;

        element.classList.remove('inspector-highlighted');
        delete element.dataset.originalBorder;
        delete element.dataset.originalBackground;
    }

    // Return the function to toggle inspector mode so it can be connected to a button
    return toggleInspectorMode;
}
export function inspectTool() {
    // Utility to toggle the inspector on and off for all elements
    function toggleInspectorMode() {
        document.body.classList.toggle('inspector-active');

        if (document.body.classList.contains('inspector-active')) {
            applyInspectorToAllElements();
        } else {
            revertInspectorForAllElements();
        }
    }

    // Function to apply inspector styles to all elements
    function applyInspectorToAllElements() {
        const elements = document.querySelectorAll('*');

        elements.forEach(element => {
            if (!element.classList.contains('inspector-highlighted')) {
                applyInspectorStyles(element);
            }
        });

        // Prevent clicks from triggering other actions
        document.addEventListener('click', preventDefaultBehavior, true);
    }

    // Function to revert inspector styles for all elements
    function revertInspectorForAllElements() {
        const elements = document.querySelectorAll('.inspector-highlighted');

        elements.forEach(element => {
            revertElementStyles(element);
        });

        document.removeEventListener('click', preventDefaultBehavior, true);
    }

    // Prevent default click behavior during inspection
    function preventDefaultBehavior(event) {
        event.preventDefault();
        event.stopPropagation();
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
// Arrow key navigation

document.addEventListener('keydown', function(event) {
    if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
        const buttons = Array.from(document.querySelectorAll('.option-btn, .nav-btn'));
        const focusedElement = document.activeElement;
        const currentIndex = buttons.indexOf(focusedElement);

        if (currentIndex === -1 && (event.key === 'ArrowRight' || event.key === 'ArrowDown')) {
            // No element is focused and user pressed right or down, focus the first element
            const firstElement = buttons.find(element => element.tabIndex === 0);
            if (firstElement) {
                firstElement.focus();
            }
        } else if (currentIndex !== -1) {
            // Proceed with normal navigation
            const nextIndex = findClosestElement(buttons, currentIndex, event.key);
            if (nextIndex !== -1) {
                buttons[nextIndex].focus();
            }
        }
        event.preventDefault(); // Prevent default scrolling behavior
    }
});

function findClosestElement(elements, currentIndex, direction) {
    const currentPosition = getElementPosition(elements[currentIndex]);
    let candidateIndex = -1;
    let candidateDistance = Infinity;

    elements.forEach((element, index) => {
        if (index !== currentIndex) {
            const position = getElementPosition(element);
            let isDirectionValid;
            let distance;

            switch (direction) {
                case 'ArrowRight':
                    isDirectionValid = position.left > currentPosition.left && position.top === currentPosition.top;
                    distance = position.left - currentPosition.left;
                    break;
                case 'ArrowLeft':
                    isDirectionValid = position.left < currentPosition.left && position.top === currentPosition.top;
                    distance = currentPosition.left - position.left;
                    break;
                case 'ArrowDown':
                    isDirectionValid = position.top > currentPosition.top && position.left === currentPosition.left;
                    distance = position.top - currentPosition.top;
                    break;
                case 'ArrowUp':
                    isDirectionValid = position.top < currentPosition.top && position.left === currentPosition.left;
                    distance = currentPosition.top - position.top;
                    break;
            }

            if (isDirectionValid && distance < candidateDistance) {
                candidateIndex = index;
                candidateDistance = distance;
            }
        }
    });

    return candidateIndex;
}

function getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    return { top: rect.top, left: rect.left };
}

// Escape key to remove focus from any focused element

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        // Check if any element is currently focused
        if (document.activeElement) {
            // Remove focus from the currently focused element
            document.activeElement.blur();
        }
        event.preventDefault(); // Optional: Prevent any default behavior associated with the Escape key
    }
});
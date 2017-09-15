let container;

/**
 * Get if there is an active container on this page.
 */
export function hasActiveContainer() {
	return !! container;
}

/**
 * Get the current container.
 */
export function getActiveContainer() {
	return container;
}

/**
 * Set the active container.
 *
 * @param {HTMLElement} c
 */
export function setActiveContainer(c) {
	container = c;
}

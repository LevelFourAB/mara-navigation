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
	if(c !== null && ! (c instanceof Container)) {
		throw new Error('Container must extend the class Container');
	}

	container = c;
}

/**
 * Base class to extend if something wants to be a container.
 */
export class Container {

	/**
	 * Remove a page that is currently in the container.
	 *
	 * @param {Page} page
	 */
	removePage(page) {
		throw new Error('removePage must be implemented');
	}

	/**
	 * Add a page to the container.
	 *
	 * @param {Page} page
	 */
	addPage(page) {
		throw new Error('addPage must be implemented');
	}
}

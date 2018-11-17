/**
 * API for managing page navigation.
 */

export { addContentHandler, setMinimumLoadTime } from './internal/result';

import get from './internal/get';
import * as urlUtils from './url';

export let resolveURL = urlUtils.resolveURL;

/**
 *
 * @param {string} url
 * @param {*} source
 * @param {*} isReload
 */
export function navigateTo(url, source=null, isReload=false) {
	const page = document.querySelector('mara-page');
	if(page) {
		history.replaceState(page.pageState, "", window.location);
	}

	get(url, source, isReload);
}

/**
 * Reload the current or the given URL.
 *
 * @param {string} url
 */
export function reload(url=null) {
	if(url) {
		url = urlUtils.resolveURL(url);
		if(url !== document.location.toString()) return;
	} else {
		url = document.location.toString();
	}

	get(url, null, true);
}

/**
 * Get the current URL.
 */
export function url() {
	return document.location.toString();
}

/*
 * Utilities for URL resolving.
 */

// Resolve the root URL of this page
export const rootURL = function() {
	let rootUrl = document.location.protocol +  '//' + (document.location.hostname || document.location.host);
	if(document.location.port > 0) {
		rootUrl += ':'+ document.location.port;
	}
	rootUrl += '/';
	return rootUrl;
}();

/**
 * Resolve an URL turning it into an absolute URL.
 *
 * @param {string} url
 */
export function resolveURL(url) {
	if(url.search(/^\/\//) != -1) {
		return window.location.protocol + url;
	}

	if(url.search(/:\/\//) != -1) return url;

	if(url.search(/^\//) != -1) {
		return window.location.origin + url;
	}

	const base = window.location.href.match(/(.*\/)/)[0];
	return base + url;
}

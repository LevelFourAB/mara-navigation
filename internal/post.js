import { resolveURL } from '../url';
import { navigateStart, navigateLoad, navigateError, navigateProgress, navigateResolveCustom } from './result';

/**
 * Perform a navigation via a POST.
 *
 * @param {url} target
 * @param {string} method
 * @param {string} data
 * @param {HTMLElement} form
 */
export default function post(target, data, form) {
	const url = resolveURL(target);

	navigateStart(url, form, false);

	navigateResolveCustom('POST', url, data)
		.then(isCustom => {
			if(isCustom) {
				// If the POST was handled by a custom loader
				history.pushState(null, "", url);
				return;
			}

			const req = new XMLHttpRequest();
			req.onload = function() {
				history.pushState(null, "", url);
				navigateLoad.call(this);
			};
			req.onerror = navigateError;
			req.onprogress = navigateProgress;
			req.open('POST', target, true);
			if(! (data instanceof window.FormData)) {
				req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			}
			req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			req.setRequestHeader('X-Partial', 'true');
			req.send(data);
		})
		.catch(navigateError);
}

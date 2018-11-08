
import { resolveURL } from '../url';
import { navigateStart, navigateLoad, navigateError, navigateProgress, navigateResolveCustom } from './result';

/**
 * Navigate via a GET request.
 *
 * @param {string} target
 *   the URL to navigate to
 * @param {any} from
 *   what triggered this navigation
 * @param {boolean} isReload
 *   if the navigation is actually a reload
 */
export default function get(target, from=null, isReload=false, external=false) {
	let url = resolveURL(target);

	if(! isReload && ! external) {
		history.pushState(null, "", url);
	}

	const dialogs = document.querySelectorAll('mara-dialog');
	for(const dialog of dialogs) {
		// TODO: Do we always want to do this?
		dialog.removeIfVisible();
	}

	navigateStart(url, from, isReload);

	navigateResolveCustom('GET', url)
		.then(isCustom => {
			if(isCustom) return;

			const req = new XMLHttpRequest();
			req.onload = navigateLoad;
			req.onerror = navigateError;
			req.onprogress = navigateProgress;
			req.open('GET', url, true);
			req.setRequestHeader('Accept', 'text/html,application/json,*/*');
			req.setRequestHeader('X-Partial', 'true');
			req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			req.send();
		})
		.catch(navigateError);
}

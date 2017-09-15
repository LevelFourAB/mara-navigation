
import { triggerEvent } from 'mara/events';
import { getActiveContainer, setActiveContainer } from './container';

let loadStart = 0;
let minLoadTime = 0;

export function navigateStart(url, from, reload) {
	loadStart = Date.now();
	triggerEvent(document, 'navigateStarted', {
		url: url,
		from: from,
		reload: reload
	});
}

export function navigateLoad() {
	if(this.status < 200 || this.status > 299) {
		navigateError.call(this);
		return;
	}

	const html = this.responseText;
	const now = Date.now();

	if(now - loadStart > minLoadTime) {
		loadHtml(html);
	} else {
		setTimeout(() => loadHtml(html), minLoadTime - (now - loadStart));
	}
}

export function navigateProgress(e) {
	if(e.lengthComputable) {
		triggerEvent(document, 'navigateProgress', {
			progress: e.loaded / e.total
		});
	}
}

export function navigateError() {
	triggerEvent(document, 'navigateError');
}

function loadHtml(html) {
	const newDoc = document.implementation.createHTMLDocument();
	newDoc.documentElement.innerHTML = html;

	const newPage = newDoc.querySelector('mara-page');
	const dialog = newDoc.querySelector('mara-dialog');
	const notification = newDoc.querySelector('mara-notification');

	let container = getActiveContainer();

	let url;
	if(newPage && ! dialog) {
		container.parentNode.replaceChild(newPage, container);

		setActiveContainer(newPage);

		url = newPage.getAttribute('url');
	}

	const oldDialogs = document.querySelectorAll('mara-dialog');
	for(const oldDialog of oldDialogs) {
		oldDialog.close();
	}

	const page = ! dialog && ! notification ? newPage : document.querySelector('mara-page');

	if(dialog) {
		url = dialog.getAttribute('url');
		page.after(dialog);
	} else if(notification) {
		notification.dialogs = oldDialogs;

		url = page.getAttribute('url');
		page.after(notification);
	} else {
		document.body.scrollTop = 0;
		document.documentElement.scrollTop = 0;

		if(history.state) {
			page.pageState = history.state;
		}
	}

	if(url && document.location != url) {
		history.replaceState(history.state, "", url, '');
	}

	setTimeout(() => {
		if(! dialog && ! notification) {
			let focus = page.query('[autofocus]');
			if(focus) focus.focus();
		}

		triggerEvent(document, 'navigateDone', {
			page: page,
			dialog: dialog
		});
	}, 0);
}


import { triggerEvent } from 'mara/events';
import { getActiveContainer } from './container';
import Page from './page';

const handlers = [];

export function addContentHandler(handler) {
	handlers.push(handler);
}

let loadStart = 0;
let minLoadTime = 0;

export function setMinimumLoadTime(ms) {
	minLoadTime = ms;
}

export function navigateStart(url, from, reload) {
	loadStart = Date.now();
	triggerEvent(document, 'navigate:start', {
		url: url,
		from: from,
		reload: reload
	});
}

export function navigateResolveCustom(method, url, data=undefined) {
	return new Promise((resolve, reject) => {
		const loadVia = promise => {
			eventData.isHandled = true;

			promise.then(data => {
				if(! data) {
					// The custom handler did not resolve any data
					resolve(false);
					return;
				}

				const now = Date.now();

				if(now - loadStart > minLoadTime) {
					load(data);

					resolve(true);
				} else {
					setTimeout(() => {
						load(data);

						resolve(true);
					}, minLoadTime - (now - loadStart));
				}
			}).catch(reject);
		};

		const eventData = {
			method: method,
			url: url,
			data: data,
			loadVia: loadVia,
			isHandled: false
		};

		// Send the event
		triggerEvent(document, 'navigate:custom', eventData);

		if(! eventData.isHandled) {
			// No custom handler resolved
			resolve(false);
		}
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
		load(html);
	} else {
		setTimeout(() => load(html), minLoadTime - (now - loadStart));
	}
}

export function navigateProgress(e) {
	if(e.lengthComputable) {
		triggerEvent(document, 'navigate:progress', {
			progress: e.loaded / e.total
		});
	}
}

export function navigateError(err) {
	console.error('Unable to navigate', err);

	triggerEvent(document, 'navigate:error');
	triggerEvent(document, 'navigate:done', {
		error: true,
		success: false
	});
}

handlers.push(function resolveHTML(html) {
	// Check that the input is a string
	if(typeof html !== 'string') return;

	const newDoc = document.implementation.createHTMLDocument();
	newDoc.documentElement.innerHTML = html;

	return newDoc.body;
});

handlers.push(function resolveElementish(doc) {
	// Check that the input is a HTML element or document
	if(! (doc instanceof HTMLDocument
		|| doc instanceof HTMLElement
		|| doc instanceof DocumentFragment)) return;

	const pages = doc.querySelectorAll('mara-page');

	if(pages.length) {
		// Map every mara-page found into a Page object
		const items = [];

		for(const page of pages) {
			items.push(new Page({
				node: page,
				title: page.pageTitle || page.getAttribute('page-title') || page.dataset.pageTitle,
				url: page.url || page.getAttribute('url') || page.dataset.pageUrl
			}));
		}

		return items;
	} else {
		// Return the root element as the page
		let root;
		if(doc.body) {
			root = document.createElement('div');
			root.dataset.pageTitle = doc.body.dataset.pageTitle;
			root.dataset.pageUrl = doc.body.dataset.pageUrl;
		} else {
			root = doc;
		}

		return new Page({
			node: root,
			title: root.dataset.pageTitle,
			url: root.dataset.pageUrl
		});
	}
});

function resolvePages(data, lastIndex=-1) {
	for(let i=0; i<handlers.length; i++) {
		if(lastIndex === i) continue;

		const resolved = handlers[i](data);
		if(! resolved) continue;

		// The handler did resolve data
		if(resolved instanceof Page) return [ resolved ];
		if(Array.isArray(resolved)) return resolved;

		// No page - asks handlers to resolve again
		return resolvePages(resolved, i);
	}

	return [];
}

function load(data) {
	const pages = resolvePages(data);
	if(! pages || pages.length === 0) {
		throw new Error('No pages found');
	}

	let container = getActiveContainer();

	// TODO: Merging algorithm for partial pages

	// Remove all of the current pages
	for(const page of container.pages) {
		container.removePage(page);
	}

	// Add the new pages
	let lastPage;
	for(const page of pages)  {
		container.addPage(page);

		lastPage = page;
	}

	// Update the title of the document
	document.title = lastPage.title;

	if(lastPage.url && document.location != lastPage.url) {
		// Update the URL with the URL of the page
		history.replaceState(history.state, "", lastPage.url, '');
	}

	setTimeout(() => {
		// TODO: Should auto-focus live in here or in the container?
		let focus = lastPage.node.querySelector('[autofocus]');
		if(focus) focus.focus();

		triggerEvent(document, 'navigate:load', {
			page: lastPage
		});

		triggerEvent(document, 'navigate:done', {
			error: false,
			success: true,
			page: lastPage
		});
	}, 0);
}

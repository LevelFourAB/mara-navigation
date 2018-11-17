import { HTMLCustomElement, InitialRender, ChildrenReady, define } from 'mara';

import { hasActiveContainer, setActiveContainer, Container } from './internal/container';
import enhance from './internal/enhance';
import Page from './internal/page';
import { navigateStart, navigateError, navigateResolveCustom } from './internal/result';

/**
 * Container for page instances.
 */
export class PageContainer extends HTMLCustomElement.with(InitialRender, ChildrenReady) {

	createdCallback() {
		super.createdCallback();

		this._container = new ContainerImpl(this);
		this._loadCustom = this._loadCustom.bind(this);
	}

	connectedCallback() {
		super.connectedCallback();

		if(hasActiveContainer()) {
			throw new Error('Only one container can be used');
		}

		setActiveContainer(this._container);

		window.addEventListener('load', this._loadCustom);
	}

	initialRenderCallback() {
		super.initialRenderCallback();

		const entireWindow = this.hasAttribute('window');
		if(! entireWindow) {
			// Only intercept events within this container
			enhance(this);
		} else {
			// Intercept events in the entire window
			enhance(window.document.documentElement);
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		setActiveContainer(null);

		window.removeEventListener('load', this._loadCustom);
	}

	childrenReadyCallback() {
		super.childrenReadyCallback();

		for(const child of this.children) {
			if(child.hasAttribute('custom')) {
				// This is a <mara-page> with a custom=true used as a placeholder
				this._needsCustomLoad = true;
			} else {
				this._container.pages.push(new Page({
					node: child
				}));
			}
		}

		if(this._needsCustomLoad && document.readyState === 'complete') {
			// If custom load is needed and the document is ready
			this._loadCustom();
		}
	}

	pageRemoved(page) {
		this.removeChild(page.node);
	}

	pageAdded(page) {
		this.appendChild(page.node);
	}

	_loadCustom() {

		// Only do a custom load if needed
		if(! this._needsCustomLoad) return;
		this._needsCustomLoad = false;

		const url = String(document.location);

		navigateStart(url, undefined, false);

		navigateResolveCustom('GET', url)
			.catch(navigateError);
	}
}

class ContainerImpl extends Container {

	constructor(parent) {
		super();

		this.parent = parent;
		this.pages = [];
	}

	removePage(page) {
		const idx = this.pages.indexOf(page);
		if(idx >= 0) {
			this.pages.splice(idx, 1);
		}

		this.parent.pageRemoved(page);
	}

	addPage(page) {
		this.parent.pageAdded(page);

		this.pages.push(page);
	}

}

// Export as mara-page-container
define('mara-page-container', PageContainer);

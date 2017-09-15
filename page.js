
import { HTMLCustomElement, InitialRender, define } from 'mara/ce';

import { hasActiveContainer, setActiveContainer } from './internal/container';
import enhance from './internal/enhance';

export class MaraPage extends HTMLCustomElement.with(InitialRender) {
	get pageTitle() {
		return this.getAttribute('page-title');
	}

	get url() {
		return this.getAttribute('url');
	}

	initialRenderCallback() {
		super.initialRenderCallback();

		const entireWindow = this.hasAttribute('window');
		if(! entireWindow) {
			// Only intercept events within this page
			enhance(this);
		}

		this._stateElements = [];
		this._stateUniqueId = 0;

		if(hasActiveContainer()) return false;

		if(entireWindow) {
			// Intercept events in the entire window
			enhance(window.document.documentElement);
		}

		//api.url = this.getAttribute('url');
		setActiveContainer(this);
	}

	connectedCallback() {
		super.connectedCallback();

		document.title = this.pageTitle;
		//api.lastPage = this.url;
	}

	addPageState(stateObject) {
		if(! stateObject.id) {
			stateObject.id = 'mara-' + (++this._stateUniqueId);
		}

		this._stateElements.push(stateObject);
	}

	get pageState() {
		const result = {};
		this._stateElements.forEach(function(stateObject) {
			result[stateObject.id] = stateObject.pageState;
		});
		return result;
	}

	set pageState(state) {
		if(! state) return;

		this._stateElements.forEach(function(stateObject) {
			stateObject.pageState = state[stateObject.id];
		});
	}
}
define('mara-page', MaraPage);

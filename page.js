
import { HTMLCustomElement, InitialRender, define } from 'mara';

export class MaraPage extends HTMLCustomElement.with(InitialRender) {
	get pageTitle() {
		return this.getAttribute('page-title');
	}

	get url() {
		return this.getAttribute('url');
	}

	get custom() {
		return this.hasAttribute('custom');
	}

	initialRenderCallback() {
		super.initialRenderCallback();

		this._stateElements = [];
		this._stateUniqueId = 0;
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

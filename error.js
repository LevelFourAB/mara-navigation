'use strict';

import { reload } from './';
import { HTMLCustomElement, define } from 'mara/ce';
import { delegateEventListener } from 'mara/events';

export class NavigationError extends HTMLCustomElement {
	createdCallback() {
		super.createdCallback();

		this.navigateStart = this.navigateStart.bind(this);
		this.navigateError = this.navigateError.bind(this);

		delegateEventListener(this, 'click', 'button[extended-type]', function(e) {
			e.preventDefault();
			switch(this.getAttribute('extended-type')) {
				case 'reload':
					document.location.reload(true);
					break;
				case 'try-again':
					reload();
					break;
			}
		});
	}

	connectedCallback() {
		super.connectedCallback();

		document.addEventListener('navigate:start', this.navigateStart);
		document.addEventListener('navigate:error', this.navigateError);
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		document.removeEventListener('navigate:start', this.navigateStart);
		document.removeEventListener('navigate:error', this.navigateError);
	}

	navigateStart() {
		this.classList.remove('active');
	}

	navigateError() {
		this.classList.add('active');
	}
}

define('mara-navigation-error', NavigationError);

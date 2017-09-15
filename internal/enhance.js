import { delegateEventListener } from 'mara/events';
import { rootURL, resolveURL } from '../url';

import formSerialize from './form-serialize';
import get from './get';
import post from './post';

export default function enhance(el) {
	delegateEventListener(el, 'click', 'a', function(e) {
		if((typeof e.which != 'undefined' && e.which != 1) || e.metaKey || e.ctrlKey || e.altKey) return;

		var href = typeof this.href.animVal !== 'undefined' ? this.href.animVal : this.href;
		if(href.indexOf(rootURL) !== 0 || this.matches('.mara-external')) return;

		e.preventDefault();
		e.stopImmediatePropagation();

		get(href, this, document.location == href);
	});

	delegateEventListener(el, 'submit', 'form', function(e) {
		const href = resolveURL(e.target.getAttribute('action') || document.location.toString());
		if(String(href).indexOf(rootURL) !== 0) return;
		if(this.matches('.mara-external')) return;

		e.preventDefault();
		e.stopImmediatePropagation();

		var method = e.target.method ? e.target.method.toUpperCase() : 'GET';
		if(method == 'GET') {
			get(href + '?' + formSerialize(e.target), e.target, false);
		} else {
			let data;
			if(e.target.enctype === 'multipart/form-data') {
				data = new FormData(e.target);
				if(e.target.files) {
					e.target.files.forEach(file => data.append(file.id, file.file));
				}
			} else {
				data = formSerialize(e.target);
			}

			post(href, data, e.target);
		}
	});
}

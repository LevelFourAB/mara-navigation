/**
 * Serialize the given form to application/x-www-form-urlencoded.
 *
 * @param {HTMLFormElement} form
 */
export default function formSerialize(form) {
	if(! form || form.nodeName !== 'FORM') return;

	let result = [];
	let push = function(el, value) {
		result.push(el.name + '=' + encodeURIComponent(value || el.value));
	};

	for(let i=0, n=form.elements.length; i<n; i++) {
		let el = form.elements[i];
		if(el.name === '') continue;

		switch(el.nodeName) {
			case 'INPUT':
				switch(el.type) {
					case 'checkbox':
					case 'radio':
						if(el.checked) push(el);
						break;
					default:
						push(el);
				}
				break;
			case 'TEXTAREA':
				push(el);
				break;
			case 'SELECT':
				switch(el.type) {
					case 'select-one':
						push(el);
						break;
					case 'select-multiple':
						for(var j=0, m=el.options.length; j<m; j++) {
							push(el, el.options[j].value);
						}
						break;
				}
				break;
		}
	}

	return result.join('&');
}

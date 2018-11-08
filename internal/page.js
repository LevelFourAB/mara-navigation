
export default class Page {
	constructor(options) {
		if(! options) {
			throw new Error('Options must be specified');
		}

		this.node = options.node;
		this.title = options.title;
		this.url = options.url;
		this.partial = options.partial;
	}
}

// made by dst212

/*
 * Dynamic update of content on a static page.
 *
 * Visit https://github.com/dst212/dst212.github.io/ to get more details.
 */

'use strict';

const Page = {
	onloadAlways() {}, //should not be edited from fetched scripts, use onload() instead
	onload() {},
	unload() {},
	error(params = {url: '', status: '0'}, where = document.body.getElementsByTagName('MAIN')[0]) {
		document.title = '' + params.status + ' - ' + (params.statusText ? params.statusText : 'Error');
		document.getElementById('title').innerHTML = document.title;
		where.innerHTML = '<div style="display:block; width:100%; text-align: center;"><span style="display:block; font-size: 4em; margin: 0.5em auto;">:(</span><span>The page <i>' + (params.url ? params.url : name) + '</i> couldn\'t be reached.</span></div>';
		if(params.url)
			window.history.replaceState({page: 0}, document.title, params.url);
	},
	refresh: function(e = null) {
		let onloadPage = {}, pageUrl = new URL(document.URL);
		onloadPage.status = pageUrl.searchParams.get('error');
		onloadPage.page = pageUrl.searchParams.get('page');
		if(onloadPage.status) {
			onloadPage.url = pageUrl.searchParams.get('url');
			if(onloadPage.status === 404)
				onloadPage.statusText = 'Not found';
			Page.error(onloadPage);
		} else {
			Page.fetch(onloadPage.page || 'home', {skipOnload: false, forceFetch: false, dontPush: true});
		}
	},
	fetch: (function() {
		let scriptsToRemove = [];
		const now = (new Date()).getTime();

		return function(name, flags = {skipOnload: false, forceFetch: false, dontPush: false}, where = document.body.getElementsByTagName('MAIN')[0]) {
			let file, xhttp, cacheBusting, that = this;
			flags || (flags = {});
			flags.skipOnload !== undefined || (flags.skipOnload = false);
			flags.forceFetch !== undefined || (flags.forceFetch = false);
			cacheBusting = flags.forceFetch ? (new Date()).getTime() : now;
			file = '/pages/' + name + ((name[name.length - 1] === '/') ?  'index.html' :  '.html');
			xhttp = new XMLHttpRequest();

			xhttp.onreadystatechange = function() {
				let newpage, parser, scripts, script, i;
				if(this.readyState === 4) {
					console.log('Fetch of ' + file + ' results: ' + this.status + ' (' + this.statusText + ')');
					//unfocus the clicked element
					document.activeElement.blur();
					//go back on the top of the page
					window.scrollTo(0, 0);
					if(this.status === 200) {
						parser = new DOMParser();
						newpage = parser.parseFromString(this.responseText, 'text/html');
						document.title = newpage.title;
						document.getElementById('title').innerHTML = newpage.title;
						where.innerHTML = newpage.body.innerHTML;
						if(!flags.skipOnload) {
							that.unload && that.unload();
							that.unload = undefined;
							//remove old scripts
							while(script = scriptsToRemove.pop()) {
								console.log('Removing script ' + (script.getAttribute('src') || 'from HTML file.'));
								script.remove();
							}
							//add all the javascript scripts from the source page's head
							scripts = newpage.head.getElementsByTagName('SCRIPT');
							for(i = 0; i < scripts.length; i++) {
								//just adding the script from the collection won't work, a new script element has to be added
								console.log('Adding script ' + (scripts[i].getAttribute('src') || 'from HTML file.'));
								script = document.createElement('SCRIPT');
								script.setAttribute('type', scripts[i].getAttribute('type'));
								scripts[i].getAttribute('src') && script.setAttribute('src', scripts[i].getAttribute('src') + '?v=' + cacheBusting);
								document.head.appendChild(script);
								script.innerHTML = scripts[i].innerHTML;
								scriptsToRemove.push(script);
								script = undefined;
							}
							that.onloadAlways();
							that.onload && that.onload();
							that.onload = undefined;
						}
						//update the browser's search-bar
						if(!flags.dontPush)
							window.history.pushState({page: 0}, document.title, '?page=' + name);
					} else {
						that.error({status: this.status, statusText: this.statusText, url: document.URL}, where);
					}
				}
			}
			xhttp.open('GET', file + '?v=' + cacheBusting, true);
			xhttp.send();
		};
	})(),
}

window.onpopstate = Page.refresh;
window.onload = addFunction(window.onload, Page.refresh);

//END

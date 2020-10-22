// made by dst212

/*
 * Dynamic update of content on a static page.
 *
 * Visit https://github.com/dst212/dst212.github.io/ to get more details.
 */

'use strict';

var pageOnload = () => {};
var pageUnload = () => {};

function pageError(params = {url: '', status: '0'}, where = document.body.getElementsByTagName('MAIN')[0]) {
	document.title = '' + params.status + ' - ' + (params.statusText ? params.statusText : 'Error');
	document.getElementById('title').innerHTML = document.title;
	where.innerHTML = '<div style="display:block; width:100%; text-align: center;"><span style="display:block; font-size: 4em; margin: 0.5em auto;">:(</span><span>The page <i>' + (params.url ? params.url : name) + '</i> couldn\'t be reached.</span></div>';
	if(params.url)
		window.history.replaceState({page: 0}, document.title, params.url);
}

const pageFetch = (function() {
	let scriptsToRemove = [];
	const now = (new Date()).getTime();
	return function(name, flags = {skipOnload: false, forceFetch: false}, where = document.body.getElementsByTagName('MAIN')[0]) {
		var file, xhttp;
		let cacheBusting;
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
						pageUnload && pageUnload();
						pageUnload = undefined;
						pageOnload();
						//remove old scripts
						while(script = scriptsToRemove.pop()) {
							console.log('Removing script ' + (script.getAttribute('src') || 'from HTML file.'));
							script.remove();
						}
						//add all the javascript scripts from the source page
						scripts = newpage.getElementsByTagName('SCRIPT');
						for(i = 0; i < scripts.length; i++) {
							//just adding the script from the collection won't work, a new script element has to be added
							console.log('Adding script ' + (scripts[i].getAttribute('src') || 'from HTML file.'));
							script = document.createElement('SCRIPT');
							script.setAttribute('type', scripts[i].getAttribute('type'));
							scripts[i].getAttribute('src') && script.setAttribute('src', scripts[i].getAttribute('src') + '?v=' + cacheBusting);
							document.body.appendChild(script);
							script.innerHTML = scripts[i].innerHTML;
							scriptsToRemove.push(script);
							script = undefined;
						}
					}
					//update the browser's search-bar
					window.history.pushState({page: 0}, document.title, '?page=' + name);
				} else {
					pageError({status: this.status, statusText: this.statusText, url: document.URL}, where);
				}
			}
		}
		xhttp.open('GET', file + '?v=' + cacheBusting, true);
		xhttp.send();
	};
})();

window.onpopstate = function(e) {
	location.reload();
}

window.onload = addFunction(window.onload, function(){
	let onloadPage = {}, page_url = new URL(document.URL);
	onloadPage.status = page_url.searchParams.get('error');
	onloadPage.page = page_url.searchParams.get('page');
	if(onloadPage.status) {
		onloadPage.url = page_url.searchParams.get('url');
		if(onloadPage.status === 404) onloadPage.statusText = 'Not found';
		pageError(onloadPage);
	} else {
		if(!onloadPage.page) {
			onloadPage.page = 'home';
		}
		pageFetch(onloadPage.page);
	}
});

//END

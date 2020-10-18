// made by dst212

/*
 * Dynamic update of content on a static page.
 *
 * Visit https://github.com/dst212/dst212.github.io/ to get more details.
 */

var pageOnload = () => {};

function pageError(params = {url: '', status: '0'}, where = document.body.getElementsByTagName('MAIN')[0]) {
	document.title = '' + params.status + ' - ' + (params.statusText ? params.statusText : 'Error');
	document.getElementById('title').innerHTML = document.title;
	where.innerHTML = '<div style="display:block; width:100%; text-align: center;"><span style="display:block; font-size: 4em; margin: 0.5em auto;">:(</span><span>The page <i>' + (params.url ? params.url : name) + '</i> couldn\'t be reached.</span></div>';
	if(params.url)
		window.history.replaceState({page: 0}, document.title, params.url);
}

function pageFetch(name, skipOnload = false, where = document.body.getElementsByTagName('MAIN')[0]) {
	var file, xhttp;
	file = '/pages/' + name + ((name[name.length - 1] == '/') ?  'index.html' :  '.html');
	xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		var newpage, parser, scripts, script, i;
		if(this.readyState == 4) {
			console.log('Fetch of ' + file + ' results: ' + this.status + ' (' + this.statusText + ')');
			//unfocus the clicked element
			document.activeElement.blur();
			//go back on the top of the page
			window.scrollTo(0, 0);
			if(this.status == 200) {
				parser = new DOMParser();
				newpage = parser.parseFromString(this.responseText, 'text/html');
				document.title = newpage.title;
				document.getElementById('title').innerHTML = newpage.title;
				where.innerHTML = newpage.body.innerHTML;
				if(!skipOnload) {
					pageOnload();
					//add all the javascript scripts from the source page
					scripts = newpage.getElementsByTagName('SCRIPT');
					for(i = 0; i < scripts.length; i++) {
						//just adding the script from the collection won't work, a new script element has to be added
						script = document.createElement('SCRIPT');
						script.setAttribute('type', scripts[i].getAttribute('type'));
						script.setAttribute('src', scripts[i].getAttribute('src'));
						document.body.appendChild(script);
						script.innerHTML = scripts[i].innerHTML;
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
	//Math.random() makes the link different each time, so the file will be downloaded even if cached
	xhttp.open('GET', file + '?' + ('' + Math.random()).replace(/\./gi, ''), true);
	xhttp.send();
}

window.onpopstate = (e) => location.reload();

window.onload = addFunction(window.onload, function(){
	var onloadPage = {}, page_url = new URL(document.URL);
	onloadPage.status = page_url.searchParams.get('error');
	onloadPage.page = page_url.searchParams.get('page');
	if(onloadPage.status) {
		onloadPage.url = page_url.searchParams.get('url');
		if(onloadPage.status == 404) onloadPage.statusText = 'Not found';
		pageError(onloadPage);
	} else {
		if(!onloadPage.page) {
			onloadPage.page = 'home';
		}
		pageFetch(onloadPage.page);
	}
});

//END

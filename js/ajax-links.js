// made by dst212

/*
 * Dynamic update of content on a static page.
 *
 * Visit https://github.com/dst212/dst212.github.io/ to get more details.
 */

var page_onload = () => {};

function page_error(params = {url: '', status: '0'}, where = document.body.getElementsByTagName('MAIN')[0]) {
	document.title = '' + params.status + ' - ' + (params.statusText ? params.statusText : 'Error');
	document.getElementById('title').innerHTML = document.title;
	where.innerHTML = '<div style="display:block; width:100%; text-align: center;"><span style="display:block; font-size: 4em; margin: 0.5em auto;">:(</span><span>The page <i>' + (params.url ? params.url : name) + '</i> couldn\'t be reached.</span></div>';
	if(params.url)
		window.history.replaceState({page: 0}, document.title, params.url);
}

function fetch_page(name, skip_onload = false, where = document.body.getElementsByTagName('MAIN')[0]) {
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
				if(!skip_onload) {
					page_onload();
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
				page_error({status: this.status, statusText: this.statusText, url: document.URL}, where);
			}
		}
	}
	//Math.random() makes the link different each time, so the file will be downloaded even if cached
	xhttp.open('GET', file + '?' + ("" + Math.random()).replace(/./gi, ''), true);
	xhttp.send();
}

window.onpopstate = (e) => location.reload();

window.onload = addFunction(window.onload, function(){
	var onload_page = {}, page_url = new URL(document.URL);
	onload_page.status = page_url.searchParams.get('error');
	if(onload_page.status) {
		onload_page.page = page_url.searchParams.get('page');
		onload_page.url = page_url.searchParams.get('url');
		if(onload_page.status == 404) onload_page.statusText = 'Not found';
		page_error(onload_page);
	} else {
		if(!onload_page.page) {
			onload_page.page = 'home';
		}
		fetch_page(onload_page.page);
	}
});

//END

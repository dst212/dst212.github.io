// made by dst212

/*
 * Dynamic update of content on a static page.
 *
 * Visit https://github.com/dst212/dst212.github.io/ to get more details.
 */

var page_onload = () => {};

function fetch_page(name, skip_onload = false, where = document.body.getElementsByTagName('MAIN')[0]) {
	var file = '/pages/' + name + '.html';
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		var newpage, parser;
		if(this.readyState == 4) {
			console.log(file + ' fetched:');
			console.log('Status: ' + this.status);
			console.log('Status text: ' + this.statusText);
			//unfocus the clicked element
			document.activeElement.blur();
			//go back on the top of the page
			window.scrollTo(0, 0);
			if(this.status == 200) {
				parser = new DOMParser;
				newpage = parser.parseFromString(this.responseText, 'text/html');
				document.title = newpage.title;
				document.getElementById('title').innerHTML = newpage.title;
				where.innerHTML = newpage.body.innerHTML;
				if(!skip_onload)
					page_onload();
			} else {
				// fetch_page('status/' + this.status);
				document.title = '' + this.status + ' - ' + this.statusText;
				document.getElementById('title').innerHTML = document.title;
				where.innerHTML = '<div style="display:block; width:100%; text-align: center;"><span style="display:block; font-size: 4em; margin: 0.5em auto;">:(</span><span>The page <i>' + name + '</i> couldn\'t be reached.</span></div>';
			}
			//update the browser's search-bar
			window.history.pushState({page: 0}, document.title, '?page=' + name);
		}
	}
	xhttp.open('GET', file, true);
	xhttp.send();
}

window.onload = addFunction(window.onload, function(){
	let onload_page = new URL(document.URL).searchParams.get('page');
	if(!onload_page)
		onload_page = 'home';
	fetch_page(onload_page);
});

//END

// made by dst212

/*
 * Magic stuff.
 *
 * Visit https://github.com/dst212/dst212.github.io/ to get more details.
 */

function fetch_section(file, className) {
	var collection = document.getElementsByClassName(className), i;
	if(collection.length > 0) {
		for(i = 0; i < collection.length; i++)
			collection[i].innerHTML = '<div class="loading-anim"><span></span><span></span><span></span></div>';
		fetch('/res/html/' + file)
			.then(response => response.text())
			.then(data => {for(i = 0; i < collection.length; i++) collection[i].innerHTML = data;});
	}
}

function coverPage(color = 'transparent', id = 'cover-page-id') {
	var div = document.createElement('DIV');
	div.style.position = 'fixed'; //note: <body> must have absolute or relative position
	div.style.top = '0';
	div.style.left = '0';
	div.style.display = 'block';
	div.style.height = '100vh';
	div.style.width = '100vw';
	div.style.backgroundColor = color;
	div.style.zIndex = 1; //everything above won't be hidden below
	div.setAttribute('id', id);
	document.body.appendChild(div);
	return div;
}
function uncoverPage(id = 'cover-page-id') {
	var div = document.getElementById(id);
	if(div)
		document.body.removeChild(div);
}

page_onload = addFunction(page_onload, () => {
	fetch_section('logo.html', 'fetch-dst212-logo');
	fetch_section('copyright.html', 'fetch-copyright-notice');
	fetch_section('cc.html', 'fetch-cc-content');
	fetch_section('contacts.html', 'fetch-contacts');
	document.title += ' - dst212';
	init_tooltips();
});

//END

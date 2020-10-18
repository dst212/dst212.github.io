// made by dst212

/*
 * Magic stuff.
 *
 * Visit https://github.com/dst212/dst212.github.io/ to get more details.
 */

function fetchSection(file, className) {
	var collection = document.getElementsByClassName(className), i;
	if(collection.length > 0) {
		for(i = 0; i < collection.length; i++)
			collection[i].innerHTML = '<div class="loading-anim"><span></span><span></span><span></span></div>';
		fetch('/res/html/' + file)
			.then(response => response.text())
			.then(data => {for(i = 0; i < collection.length; i++) collection[i].innerHTML = data;});
	}
}

pageOnload = addFunction(pageOnload, () => {
	fetchSection('logo.html', 'fetch-dst212-logo');
	fetchSection('copyright.html', 'fetch-copyright-notice');
	fetchSection('cc.html', 'fetch-cc-content');
	fetchSection('contacts.html', 'fetch-contacts');
	document.title += ' - dst212';
	initTooltips();
});

window.onload = addFunction(window.onload, () => {
	initMagnifier();
});

//END

// made by dst212

/*
 * Magic stuff.
 *
 * Visit https://github.com/dst212/dst212.github.io/ to get more details.
 */

'use strict';

function fetchSection(file, className) {
	let collection = document.getElementsByClassName(className), i;
	if(collection.length > 0) {
		for(i = 0; i < collection.length; i++)
			collection[i].innerHTML = '<div class="loading-anim"><span></span><span></span><span></span></div>';
		fetch('/res/html/' + file)
			.then(response => response.text())
			.then(data => {
				while(collection.length > 0) {
					collection[0].innerHTML = data;
					collection[0].classList.remove(className);
				}
			});
	}
}

Page.onloadAlways = addFunction(Page.onloadAlways, function() {
	let d = (new Date()).valueOf();
	fetchSection('logo.html?' + d, 'fetch-dst212-logo');
	fetchSection('copyright.html?' + d, 'fetch-copyright-notice');
	fetchSection('cc.html?' + d, 'fetch-cc-content');
	fetchSection('contacts.html?' + d, 'fetch-contacts');
	document.title += ' - dst212';
	initTooltips();
});

window.onload = addFunction(window.onload, function() {
	initMagnifier();
	Chat.init();
});

//END

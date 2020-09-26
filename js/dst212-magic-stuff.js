// made by dst212

/*
 * Magic stuff.
 *
 * Visit https://github.com/dst212/dst212.github.io/ to get more details.
 */

function lighting() {
	var lightingEl = document.getElementById('lighting');
	lightingEl.style.opacity = '1';
// 	playAudio("lighting-audio");
	setTimeout(function() {
		lightingEl.style.opacity = '0';
	}, 175);
}

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

page_onload = addFunction(page_onload, () => {
	fetch_section('logo.html', 'fetch-dst212-logo');
	fetch_section('copyright.html', 'fetch-copyright-notice');
	fetch_section('cc.html', 'fetch-cc-content');
	fetch_section('contacts.html', 'fetch-contacts');
	document.title += ' - dst212';
	init_tooltips();
});

//END

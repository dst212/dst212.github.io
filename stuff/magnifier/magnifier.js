// made by dst212

/*
 * Functions in this script make possible to open a photo viewer, which will show the photo passed as
 * argument in its original resolution (if it fits in the viewport).
 * Ensure you also use style-properties in https://dst212.github.io/stuff/magnifier/magnifier.css to make the
 * magnifier working in your website.
 *
 * Visit https://github.com/dst212/dst212.github.io/ to get more details.
 */

'use strict';

function magnifyPhoto(elem) {
	let mag = document.getElementById('magnifier');
	document.getElementById('magnifier-img').src = elem.src;
	document.getElementById('magnifier-content').innerHTML = elem.title;
	mag.style.bottom = '0';
	mag.style.opacity = '1';
}
function minimizePhoto() {
	let mag = document.getElementById('magnifier');
	mag.style.bottom = '-100%';
	mag.style.opacity = '0';
}

function initMagnifier() {
	let mag = document.createElement('DIV');
	mag.setAttribute('id', 'magnifier');
	mag.innerHTML = '<img id="magnifier-img"><div id="magnifier-content"></div><button class="exit square material-icons md-same" onclick="minimizePhoto();">close</button>'
	document.body.appendChild(mag);
	console.log('Photo magnifier appended.');
};

//END

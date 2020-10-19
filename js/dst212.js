// made by dst212

/*
 * This script adds some nice functions to make it easier for me to write other scripts.
 *
 * Visit https://github.com/dst212/dst212.github.io/ to get more details.
 */

function addFunction(f, t) {	//concatenate functions
	return t ? (f ? () => {f(); t();} : t) : (f ? f : () => {});
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
//END

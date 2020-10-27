// made by dst212

/*
 * This script allows to place some floating windows around the website.
 *
 * Visit https://github.com/dst212/dst212.github.io/ to get more details.
 */

'use strict';

/*var mousePos = (function() {
	let pos = {x: 0, y: 0};
	document.onmousemove = function(e) {
		pos.x = e.clientX;
		pos.y = e.clientY;
	};
	return function() { return pos; };
})();*/

var win = (function() {
	let winCount = 0;
	return function(title, content, buttons = [], onclose = '', disablePage = false, width = undefined, left = undefined, top = undefined) {
		let newWin = document.createElement('DIV'), id = 'window-' + (winCount++), closeWinStr = 'document.getElementById(\'' + id + '\').remove();' + onclose + ';';
		let i, buttonsHTML = '';
		if(disablePage) {
			coverPage();
			closeWinStr += 'uncoverPage();';
		}
		newWin.setAttribute('id', id);
		newWin.classList.add('window-element');
		newWin.style.maxWidth = width || 'calc(var(--font-size) * 26)';
		newWin.innerHTML = '<div class="titlebar"><b>' + title + '</b></div><div class="content">' + content + '</div>';
		if(buttons.length) {
			buttonsHTML += '<div class="buttons">';
			for(i = 0; i < buttons.length; i++) {
				if(!buttons[i].onclick) buttons[i].onclick = closeWinStr;
				else buttons[i].onclick += ';' + closeWinStr;
				buttonsHTML += '<button ';
				if(buttons[i].properties) buttonsHTML += buttons[i].properties + ' ';
				buttonsHTML += 'onclick="' + buttons[i].onclick + '">' + buttons[i].innerHTML + '</button>';
			}
			buttonsHTML += '</div>';
		}
		newWin.innerHTML += buttonsHTML + '<button class="close material-icons md-same" onclick="' + (buttons.length ? buttons[--i].onclick : closeWinStr) +'">close</button>';
		document.body.appendChild(newWin);
		top || top === 0 || (top = 'calc((100vh - ' + newWin.offsetHeight + 'px) / 2)');
		left || left === 0 || (left = 'calc((100vw - ' + newWin.offsetWidth + 'px) / 2)');
		newWin.style.top = top;
		newWin.style.left = left;
		newWin.style.zIndex = 1;
		return newWin;
	};
})();

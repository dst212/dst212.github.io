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
	return function(title, content, buttons = [], onclose = undefined, disablePage = false, width = undefined, left = undefined, top = undefined) {
		let i, buttonsDiv, button, closeWinFun, newWin = document.createElement('DIV'), id = 'window-' + (winCount++);
		closeWinFun = function() {
			newWin.remove();
			disablePage && uncoverPage();
			onclose && onclose();
		};
		disablePage && coverPage();
		newWin.id = id;
		newWin.classList.add('window-element');
		newWin.style.maxWidth = width || 'calc(var(--font-size) * 26)';
		newWin.innerHTML = '<div class="titlebar"><b>' + title + '</b></div><div class="content">' + content + '</div>';

		if(buttons.length) {
			buttonsDiv = document.createElement('DIV');
			buttonsDiv.classList.add('buttons');
			for(i = 0; i < buttons.length; i++) {
				if(!buttons[i].onclick)
					buttons[i].onclick = closeWinFun;
				else
					buttons[i].onclick = addFunction(buttons[i].onclick, closeWinFun);
				button = document.createElement('BUTTON');
				button.innerHTML = buttons[i].innerHTML;
				button.addEventListener('click', buttons[i].onclick);
				buttonsDiv.appendChild(button);
			}
			newWin.appendChild(buttonsDiv);
		}

		button = document.createElement('BUTTON');
		button.classList.add('close', 'material-icons', 'md-same');
		button.addEventListener('click', buttons.length ? buttons[--i].onclick : closeWinFun);
		button.innerHTML = 'close';

		newWin.appendChild(button);
		document.body.appendChild(newWin);

		top || top === 0 || (top = 'calc((100vh - ' + newWin.offsetHeight + 'px) / 2)');
		left || left === 0 || (left = 'calc((100vw - ' + newWin.offsetWidth + 'px) / 2)');
		newWin.style.top = top;
		newWin.style.left = left;
		newWin.style.zIndex = 1;

		return newWin;
	};
})();

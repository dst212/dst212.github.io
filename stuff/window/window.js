// made by dst212

/*
 * This script allows to place some floating windows around the website.
 *
 * Visit https://github.com/dst212/dst212.github.io/ to get more details.
 */

var win = (function() {
	let winCount = 0;
	return function(title, content, buttons = [], onclose = '', disablePage = false, width = undefined, left = undefined, top = undefined) {
		var newWin = document.createElement('DIV'), id = 'window-' + (winCount++), closeWinStr = 'document.getElementById(\'' + id + '\').remove();' + onclose + ';';
		var buttonsHTML = '';
		let i;
		if(disablePage) {
			coverPage();
			closeWinStr += 'uncoverPage();';
		}
		newWin.setAttribute('id', id);
		newWin.classList.add('window-element');
		newWin.style.maxWidth = width ? width : 'calc(var(--font-size) * 26)';
		newWin.innerHTML = '<div class="titlebar"><b>' + title + '</b></div>' + content;
		if(buttons.length) {
			buttonsHTML += '<div class="buttons">';
			for(i = 0; i < buttons.length; i++) {
				if(!buttons[i].onclick) buttons[i].onclick = closeWinStr;
				else buttons[i].onclick += ';' + closeWinStr;
				buttonsHTML += '<button onclick="' + buttons[i].onclick + '">' + buttons[i].innerHTML + '</button>';
			}
			buttonsHTML += '</div>';
		}
		newWin.innerHTML += buttonsHTML + '<button class="close material-icons md-same" onclick="' + (buttons.length ? buttons[--i].onclick : closeWinStr) +'">close</button>';
		document.body.appendChild(newWin);
		newWin.style.top = top ? top : 'calc((100vh - ' + newWin.offsetHeight + 'px) / 2)';
		newWin.style.left = left ? left : 'calc((100vw - ' + newWin.offsetWidth + 'px) / 2)';
		newWin.style.zIndex = 1;
		return newWin;
	};
})();

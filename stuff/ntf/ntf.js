// made by dst212

/*
 * This script makes possible to show up a sort of notifications.
 * Use it with https://dst212.github.io/stuff/notify/notify.css.
 *
 * Visit https://github.com/dst212/dst212.github.io to get more details.
 */

'use strict';

var ntf = (function() {
	let id = 0;
	return function(title, content, buttons = [{innerHTML: 'OK', onclick: 'ntfClose(' + (++id) + ')'}], fg = 'var(--body-fg)', bg = 'var(--body-bg)') {
		let x = document.createElement('DIV'), ntfArea = document.getElementById('notifications');
		let i, buttonsHTML = '';
		x.setAttribute('id', 'ntf-' + id);
		x.style.color = fg;
		x.style.background = bg;
		if(buttons.length) {
			buttonsHTML = '<div class="btn">';
			for(i = 0; i < buttons.length; i++) {
				if(!buttons[i].onclick) buttons[i].onclick = 'ntfClose(' + id + ');';
				else buttons[i].onclick += ';' + 'ntfClose(' + id + ');';
				buttonsHTML += '<button ';
				if(buttons[i].properties) buttonsHTML += buttons[i].properties + ' ';
				buttonsHTML += 'onclick="' + buttons[i].onclick + '">' + buttons[i].innerHTML + '</button>';
			}
			buttonsHTML += '</div>';
		}
		x.innerHTML = '<small><big class="title">' + title + '</big><div class="msg">' + content + '</div>' + buttonsHTML + '</small>';
		x.style.display = 'block';
		ntfArea.append(x);
		//show up the notification
		x.style.maxWidth = '100%';
		x.style.maxHeight = '11em';
		x.style.opacity = '1';
		return x;
	};
})();

function ntfClose(id) {
	let x = document.getElementById('ntf-' + id);
	if(x) {
		x.style.maxWidth = '0';
		x.style.maxHeight = '0';
		x.style.opacity = '0';
		x.remove();
	}
}

function initNotifications() {
	let x = document.getElementById('notifications');
	if(!x) {
		x = document.createElement('DIV');
		x.setAttribute('id', 'notifications');
		document.body.appendChild(x);
		console.log('Notifications\' area appended.');
	}
	return x;
}

//END

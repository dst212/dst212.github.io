// made by dst212

/*
 * This script makes possible to show up a sort of notifications.
 * Use it with https://dst212.github.io/stuff/notify/notify.css.
 *
 * Visit https://github.com/dst212/dst212.github.io to get more details.
 */

function notify(id, title, msg, btn = '<input type="button" value="Ok" onclick="closeNtf(\''+id+'\')"/>', fg = 'var(--body-fg)',bg = 'var(--body-bg)') {
	var x=document.createElement('DIV');
	x.setAttribute('id', id);
	x.style.color = fg;
	x.style.background = bg;
	x.innerHTML = '<small><big class="title">' + title + '</big><div class="msg">' + msg + '</div><div class="btn">' + btn + '</div></small>';
	x.style.display = 'block';
	document.getElementById('notifications').appendChild(x);
	//show up the notification
	x.style.maxWidth = '100%';
	x.style.maxHeight = '11em';
	x.style.opacity = '1';
}
function closeNtf(id) {
	var x = document.getElementById(id);
	if(x){
		//hide
		x.style.maxWidth = '0';
		x.style.maxHeight = '0';
		x.style.opacity = '0';
		//remove from <body>
		x.remove();
	} else console.log('Unable to find element ' + x);
}

function initNotifications() {
	var x = document.createElement('DIV');
	x.setAttribute('id', 'notifications');
	document.body.appendChild(x);
	console.log('Notifications\' area appended.');
}

//END

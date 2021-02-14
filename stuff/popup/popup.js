// made by dst212
// This script allows to place some popups around the website.

'use strict';

const Popup = function(title, content, buttons = [], flags = {autoSpawn: false, coverBelow: false, draggable: false}, onclose = null, style = {}) {
	let i, key, btn;

	let shown = flags.autoSpawn;
	let element = document.createElement('DIV');

	this.show = function() {
		shown = true;
		element.style.zIndex = 4;
		element.style.opacity = '';
	}
	this.hide = function() {
		shown = false;
		element.style.zIndex = -1;
		element.style.opacity = 0;
	}
	this.isUp = () => shown;

	//what to perform when the popup is open/closed
	this.onopen = null;
	this.onclose = onclose;
	this.restoreOnclose = function() {
		this.onclose = onclose;
	};

	//open the window
	this.open = function() {
		this.onopen?.();
		if(flags.coverBelow)
			coverPage();
		this.show();
		if(!element.style.top && !element.style.left)
			center(element);
	}.bind(this);

	//close the window and run last button's action if runOnclose == true
	this.close = function(runOnclose = true) {
		this.hide();
		if(flags.coverBelow)
			uncoverPage();
		this.onclose?.();
	}.bind(this);

	this.kill = function() {
		for(let key in this)
			delete this[key];
		element?.remove();
	}.bind(this);

	element.classList.add('popup-element');

	element.style.zIndex = -1;
	this.style = function(s = style) {
		for(let key in s)
			element.style[key] = s[key];
	}
	this.style();

	this.title = document.createElement('DIV');
	this.title.classList.add('titlebar');
	this.title.innerHTML = '<strong>' + title + '</strong>';
	element.appendChild(this.title);

	this.content = document.createElement('DIV');
	this.content.innerHTML = content;
	this.content.classList.add('content');
	element.appendChild(this.content);

	this.buttons = document.createElement('DIV');
	this.buttons.classList.add('buttons');
	for(i = 0; i < buttons.length; i++) {
		btn = document.createElement('BUTTON');
		if(typeof buttons[i].onclick !== 'function')
			buttons[i].onclick = this.close;
		else if(!buttons[i].keepOpen)
			buttons[i].onclick = addFunction(this.close, buttons[i].onclick);
		for(key in buttons[i])
			btn[key] = buttons[i][key];
		this.buttons.appendChild(btn);
	}
	element.appendChild(this.buttons);

	btn = document.createElement('BUTTON');
	btn.classList.add('close', 'material-icons', 'md-same');
	btn.addEventListener('click', buttons.length ? buttons[--i].onclick : this.close);
	btn.innerHTML = 'close';

	element.appendChild(btn);

	if(!shown)
		this.hide();
	if(flags.draggable) {
		this.title.classList.add('dragbar');
		this.title.style.cursor = 'move';
		draggable(element);
	}

	if(document.body)
		document.body.appendChild(element);
	else
		window.onload = addFunction(window.onload, () => document.body.appendChild(element));
	return this;
}

const popup = (title, content, buttons, flags, onclose, style) => {
	let p = new Popup(title, content, buttons, flags, addFunction(onclose, () => p.kill()), style);
	p.open();
}

// made by dst212
// This script allows to place some popups around the website.

'use strict';

const Popup = function(title, content, buttons = [], flags = {autoSpawn: false, coverBelow: false}, onclose = null, style = {}) {
	let i, key, btn;

	let shown = flags.autoSpawn;
	let element = document.createElement('DIV');

	this.show = function() {
		shown = true;
		element.style.display = '';
		if(element.style.top === '')
			element.style.top = 'calc((100vh - ' + element.offsetHeight + 'px) / 2)';
		if(element.style.left === '')
			element.style.left = 'calc((100vw - ' + element.offsetWidth + 'px) / 2)';
		element.style.zIndex = 1;
	}
	this.hide = function() {
		shown = false;
		element.style.display = 'none';
	}
	this.isUp = () => shown;

	//open the window
	this.open = function() {
		if(flags.coverBelow)
			coverPage();
		this.show();
		element.style.zIndex = 2;
	}.bind(this);

	//close the window and run last button's action if runOnclose == true
	this.close = function(runOnclose = true) {
		this.hide();
		if(flags.coverBelow)
			uncoverPage();
		onclose?.();
		element.style.zIndex = 1;
	}.bind(this);

	element.classList.add('popup-element');

	element.style.zIndex = 1;
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
		else
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

	if(document.body)
		document.body.appendChild(element);
	else
		window.onload = addFunction(window.onload, () => document.body.appendChild(element));
	return this;
}

const popup = (title, content, buttons, flags, onclose, style) => (new Popup(title, content, buttons, flags, onclose, style)).open();

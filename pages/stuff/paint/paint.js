// made by dst212

/*
 * Basic painting program.
 *
 * Visit https://github.com/dst212/dst212.github.io/ to get more details.
 */

'use strict';

function decToHex(int) {
	let hex = '', r;
	while(int) {
		r = int % 16;
		int = (int - r) / 16;
		hex += r < 10 ? r : String.fromCharCode('A'.charCodeAt(0) - 10 + r);
	}
	return hex.split('').reverse().join('') || '0';
}
function hexToDec(hex) {
	let dec = 0, v, i;
	hex = hex.toUpperCase();
	for(i = 0; i < hex.length; i++) {
		v = isNaN(hex[i] * 1) ? hex.charCodeAt(i) - 'A'.charCodeAt() + 10 : hex[i] * 1;
		dec = (dec * 16) + (v);
	}
	return dec;
}
let twoDigits = v => v.length === 2 ? v : v.length === 1 ? '0' + v : '00';
let rgbaArray = (rgba) => rgba.slice((rgba.toLowerCase().search('rgba') !== -1 ? 'rgba(' : 'rgb(').length, rgba.length - 1).split(',');
function rgbaToHex(rgba) { //rgba(0, 0, 0, 1) turns #FF000000
	let i, hex = rgbaArray(rgba); //omit 'rgba('
	for(i = 0; i < hex.length; i++) {
		if(i === 3)
			hex[i] = decToHex(Math.round(parseFloat(hex[i]) * 255));
		else
			hex[i] = decToHex(parseInt(hex[i]));
	}
	return '#' + (hex[3] !== undefined && hex[3] !== 'FF'? twoDigits(hex[3]) : '') + twoDigits(hex[0]) + twoDigits(hex[1]) + twoDigits(hex[2]);
}
function hexToRgba(hex) { //#FF000000 turns rgba(0, 0, 0, 1)
	let offset;
	hex.length === 4 && (hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]);
	offset = hex.length === 9 ? 2 : 0;
	return 'rgba(' + hexToDec(hex.slice(1 + offset, 3 + offset)) + ', ' + hexToDec(hex.slice(3 + offset, 5 + offset)) + ', ' + hexToDec(hex.slice(5 + offset, 7 + offset)) + (offset ? ', ' + (hexToDec(hex.slice(1, 3)) / 255) : '') + ')';
}

var Paint = {
	coordsElem: document.createElement('DIV'),
	initVal() {
		this.stroking = false;
		this.action = 0;
		this.color = 'black';
		this.color2 = (Theme && Theme.get('accent')) || 'white';
		this.lineWidth = 5;
		this.lineJoin = 'round';
		this.lineCap = 'round';
		this.x = 0;
		this.y = 0;
	},
	initDefaultColors() {
		let i, newButton, that = this, defaultColors = [
			'rgb(000, 000, 000)', 'rgb(051, 000, 000)', 'rgb(051, 026, 000)', 'rgb(051, 051, 000)', 'rgb(000, 051, 000)', 'rgb(000, 051, 051)', 'rgb(000, 000, 051)', 'rgb(051, 000, 051)',
			'rgb(026, 026, 026)', 'rgb(102, 000, 000)', 'rgb(102, 051, 000)', 'rgb(102, 102, 000)', 'rgb(000, 102, 000)', 'rgb(000, 102, 102)', 'rgb(000, 000, 102)', 'rgb(102, 000, 102)',
			'rgb(051, 051, 051)', 'rgb(153, 000, 000)', 'rgb(153, 077, 000)', 'rgb(153, 153, 000)', 'rgb(000, 153, 000)', 'rgb(000, 153, 153)', 'rgb(000, 000, 153)', 'rgb(153, 000, 153)',
			'rgb(077, 077, 077)', 'rgb(204, 000, 000)', 'rgb(204, 102, 000)', 'rgb(204, 204, 000)', 'rgb(000, 204, 000)', 'rgb(000, 204, 204)', 'rgb(000, 000, 204)', 'rgb(204, 000, 204)',
			'rgb(102, 102, 102)', 'rgb(230, 000, 000)', 'rgb(230, 115, 000)', 'rgb(230, 230, 000)', 'rgb(000, 230, 000)', 'rgb(000, 230, 230)', 'rgb(000, 000, 230)', 'rgb(230, 000, 230)',
			'rgb(128, 128, 128)', 'rgb(255, 000, 000)', 'rgb(255, 128, 000)', 'rgb(255, 255, 000)', 'rgb(000, 255, 000)', 'rgb(000, 255, 255)', 'rgb(000, 000, 255)', 'rgb(255, 000, 255)',
			'rgb(153, 153, 153)', 'rgb(255, 051, 051)', 'rgb(255, 153, 051)', 'rgb(255, 255, 051)', 'rgb(051, 255, 051)', 'rgb(051, 255, 255)', 'rgb(051, 051, 255)', 'rgb(255, 051, 255)',
			'rgb(179, 179, 179)', 'rgb(255, 102, 102)', 'rgb(255, 179, 102)', 'rgb(255, 255, 102)', 'rgb(102, 255, 102)', 'rgb(102, 255, 255)', 'rgb(102, 102, 255)', 'rgb(255, 102, 255)',
			'rgb(204, 204, 204)', 'rgb(255, 153, 153)', 'rgb(255, 204, 153)', 'rgb(255, 255, 153)', 'rgb(153, 255, 153)', 'rgb(153, 255, 255)', 'rgb(153, 153, 255)', 'rgb(255, 153, 255)',
			'rgb(230, 230, 230)', 'rgb(255, 204, 204)', 'rgb(255, 230, 204)', 'rgb(255, 255, 204)', 'rgb(204, 255, 204)', 'rgb(204, 255, 255)', 'rgb(204, 204, 255)', 'rgb(255, 204, 255)',
			'rgb(255, 255, 255)', 'rgb(255, 230, 230)', 'rgb(255, 242, 230)', 'rgb(255, 255, 230)', 'rgb(230, 255, 230)', 'rgb(230, 255, 255)', 'rgb(230, 230, 255)', 'rgb(255, 230, 255)',
		];
		for(i = 0; i < defaultColors.length; i++) {
			newButton = document.createElement('input');
			newButton.type = 'button';
			newButton.value = '';
			newButton.style.backgroundColor = defaultColors[i];
			newButton.onclick = function() {
				that.color = this.style.backgroundColor;
				that.updateInputContent();
				that.updateSliders();
				that.updateBackgrounds();
			};
			this.defaultColors && this.defaultColors.appendChild(newButton);
		}
	},
	initInput() {
		let that = this;
		this.dialogs = document.getElementsByClassName('paint-dialog');
		this.dialog = {
			colors: document.getElementById('paint-color-chooser'),
			image: document.getElementById('paint-image-dialog'),
			stroke: document.getElementById('paint-stroke-dialog'),
			square: document.getElementById('paint-square-dialog'),
			circle: document.getElementById('paint-circle-dialog'),
			text: document.getElementById('paint-text-dialog'),
		};
		this.input = {
			slider: that.dialog.colors.getElementsByTagName('INPUT'),
			image: that.dialog.image.getElementsByTagName('INPUT'),
			stroke: that.dialog.stroke.getElementsByTagName('INPUT'),
			square: that.dialog.square.getElementsByTagName('INPUT'),
			circle: that.dialog.circle.getElementsByTagName('INPUT'),
			text: that.dialog.text.getElementsByTagName('INPUT'),
		};
	},
	initFileLoader() {
		let that = this;
		this.fileLoader = document.getElementById('paint-file-loader');
		this.fileReader = new FileReader();

		this.fileLoader.onchange = function() {
			that.fileReader.readAsDataURL(this.files[0]);
		}

		this.fileReader.onload = function() {
			that.setImage(this.result);
		};
		this.fileReader.onerror = function() {
			win('Paint', 'Couldn\'t load the selected file:<br>' + this.error, [{innerHTML: 'Ok'}]);
		};
	},
	init(body = document.body) {
		let that = this;

		Page && (Page.unload = (function() {
			//restore onkeydown and onkeyup functions when page is changed
			//see https://dst212.github.io/js/page.js
			let onkeydown = document.onkeydown;
			let onkeyup = document.onkeyup;
			return function() {
				document.onkeydown = onkeydown;
				document.onkeyup = onkeyup;
			};
		})());

		this.canvas && this.canvas.remove();
		this.canvas = document.createElement('canvas');
		this.canvas.width = 1000;
		this.canvas.height = 750;
		this.ctx = this.canvas.getContext('2d');
		this.canvas.style = 'max-height: 75vh; max-width: 100%; display: block; margin: auto; border: var(--general-border) solid var(--accent); background-color: white; cursor: url(\'/res/images/pencil.png\') 0 15, auto';
		this.canvas.oncontextmenu = () => false;

		document.onkeydown = function(e) {
			if(document.activeElement.nodeName !== 'INPUT' && 37 <= e.keyCode && e.keyCode <= 40)
			 	return false;
		};
		document.onkeyup = function(e) {
			;
		};

		this.canvas.onmousemove = function(e) {
			that.setxy(e);
			that.draw();
			that.updateCoords();
		};
		this.canvas.onmousedown = function(e) {
			that.setxy(e);
			that.startStroke();
		};
		this.canvas.onmouseup = function(e) {
			that.setxy(e);
			that.stopStroke();
		};
		this.canvas.onmouseout = function(e) {
			that.canvas.onmousemove(e);
			that.canvas.onmouseup(e);
		};

		this.initVal();
		this.initInput();
		this.defaultColors = this.dialog.colors.getElementsByClassName('colors')[0];
		this.strokePreview = document.getElementById('paint-stroke-preview');
		this.initDefaultColors();
		this.initFileLoader();

		body.insertBefore(this.canvas, body.childNodes[0]);

		//need canvas's client-sizes
		this.resetStroke();
		this.updateCoords();
	},

	div() {
		let div = document.createElement('DIV');
		div.setAttribute('id', 'paint-canvas');
		div.style.textAlign = 'center';
		div.append(this.coordsElem);
		document.body.getElementsByTagName('MAIN')[0].append(div);
		return div;
	},

	draw() {
		if(this.stroking) switch(this.action) {
			case 0:
				this.ctx.lineCap = this.lineCap;
				this.ctx.lineJoin = this.lineJoin;
				this.ctx.lineWidth = this.lineWidth;
				this.ctx.strokeStyle = this.color;
				this.ctx.lineTo(this.x, this.y);
				this.ctx.stroke();
				break;
			default:
				break;
		}
	},

	startStroke() {
		this.stroking = true;
		this.ctx.beginPath();
		this.ctx.moveTo(this.x, this.y);
	},

	stopStroke() {
		this.stroking = false;
	},

	setxy(e) {
		let target = e.target.getBoundingClientRect();
		this.x = e.offsetX / e.target.clientWidth * e.target.width;
		this.y = e.offsetY / e.target.clientHeight * e.target.height;
	},

	updateCoords() {
		this.coordsElem.innerHTML = 'X: ' + Math.round(this.x) + ' Y: ' + Math.round(this.y) + ' - ' + this.canvas.width + 'x' + this.canvas.height;
	},

	updateBackgrounds() {
		this.input.slider[4].style.backgroundColor = this.color;
		if(this.input.slider[0].value > 160 || this.input.slider[1].value > 127)
			this.input.slider[4].style.color = 'black';
		else
			this.input.slider[4].style.color = 'white';
		this.input.slider[0].style.backgroundImage = 'linear-gradient(to right, rgb(0, ' + this.input.slider[1].value + ', ' + this.input.slider[2].value + '), rgb(255, ' + this.input.slider[1].value + ', ' + this.input.slider[2].value + ')';
		this.input.slider[1].style.backgroundImage = 'linear-gradient(to right, rgb(' + this.input.slider[0].value + ', 0, ' + this.input.slider[2].value + '), rgb(' + this.input.slider[0].value + ', 255, ' + this.input.slider[2].value + ')';
		this.input.slider[2].style.backgroundImage = 'linear-gradient(to right, rgb(' + this.input.slider[0].value + ', ' + this.input.slider[1].value + ', 0), rgb(' + this.input.slider[0].value + ', ' + this.input.slider[1].value + ', 255)';
		this.input.slider[3].style.backgroundImage = 'linear-gradient(to right, transparent, rgb(' + this.input.slider[0].value + ', ' + this.input.slider[1].value + ', ' + this.input.slider[2].value + ')';
	},
	updateInputContent() {
		this.input.slider[4].value = rgbaToHex(this.color);
	},
	updateSliders() {
		let colors = rgbaArray(this.color);
		this.input.slider[0].value = parseInt(colors[0]);
		this.input.slider[1].value = parseInt(colors[1]);
		this.input.slider[2].value = parseInt(colors[2]);
		colors[3] && (this.input.slider[3].value = parseInt(Math.round(colors[3] * 100)));
	},
	updateColorFromInput() {
		this.color = hexToRgba(this.input.slider[4].value);
		this.updateSliders();
		this.updateBackgrounds();
	},
	updateColorFromSliders() {
		this.color = 'rgba(' + this.input.slider[0].value + ', ' + this.input.slider[1].value + ', ' + this.input.slider[2].value + ', ' + (this.input.slider[3].value * 1 / 100) +')';
		this.updateInputContent();
		this.updateBackgrounds();
	},

	updateStroke() {
		this.setStrokePreview(this.lineWidth = this.input.stroke[0].value);
	},
	setStrokePreview(to) {
		this.input.stroke[1].value = to;
		this.strokePreview.style.height = ((this.canvas.clientHeight / this.canvas.height) * to + 1) + 'px';
		this.strokePreview.style.width = this.strokePreview.style.height;
	},
	resetStroke() {
		this.setStrokePreview(this.input.stroke[0].value = this.lineWidth = 5);
	},

	addRect(x = undefined, y = undefined, width = undefined, height = undefined) {
		this.ctx.beginPath();
		this.ctx.fillStyle = this.color2;
		this.ctx.strokeStyle = this.color;
		this.ctx.rect(x || this.input.square[0].value, y || this.input.square[1].value, width || this.input.square[2].value, height || this.input.square[3].value);
		this.ctx.fill();
		this.ctx.stroke();
		this.ctx.closePath();
	},


	addCircle(x = undefined, y = undefined, ray = undefined) {
		this.ctx.beginPath();
		this.ctx.fillStyle = this.color2;
		this.ctx.strokeStyle = this.color;
		this.ctx.arc(x || this.input.circle[0].value, y || this.input.circle[1].value, ray || this.input.circle[2].value, 0, 2 * Math.PI);
		this.ctx.fill();
		this.ctx.stroke();
		this.ctx.closePath();
	},

	setImage(src = undefined) {
		let that;
		//if undefined, leave the previous image
		if(src && src.search('data:') === 0 && src.search('image/') !== 5) {
			win('Paint', 'The current format is not an image (<code>' + src.slice(5, src.search(';')) + '</code>). Please, choose a valid image format.', [{innerHTML: 'Ok'}], () => {}, true);
		} else if(!src && (!this.img || !this.img.src)) {
			win('Paint', 'Load an image first.', [{innerHTML: 'Ok'}], () => {}, true);
		} else {
			that = this;
			if(src) {
				this.img || (this.img = document.getElementById('paint-img'));
				this.img.src = src;
			}

			this.img.onload = function() {
				that.input.image[0].value = src || that.img.src;
				that.input.image[1].value = 0;
				that.input.image[2].value = 0;
				that.input.image[3].value = that.img.width || 100;
				that.input.image[4].value = that.img.height || 100;
			}

			this.img.src && this.openOnly(this.dialog.image);
			!src && this.img.onload();
		}
	},

	addImage(x = undefined, y = undefined, width = undefined, height = undefined) {
		if(this.img && this.img.src) {
			this.ctx.drawImage(this.img, x || this.input.image[1].value, y || this.input.image[2].value, width || this.input.image[3].value, height || this.input.image[4].value);
		} else {
			win('Paint', 'Load an image first.', [{innerHTML: 'Ok'}], () => {}, true);
		}
	},

	addText(x = undefined, y = undefined, fontSize = undefined, fontFamily = undefined, customText = undefined) {
		this.ctx.beginPath();
		this.ctx.fillStyle = this.color;
		this.ctx.font = (fontSize || this.input.text[2].value) + 'px ' + (fontFamily || this.input.text[3].value);
		this.ctx.fillText(customText || this.input.text[4].value, x || this.input.text[0].value, y || this.input.text[1].value);
		this.ctx.fill();
		this.ctx.stroke();
		this.ctx.closePath();
	},

	clear() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},

	new() {
		let that = this;
		win('Paint', 'Discard the current drawing and create a new one?', [{onclick: that.clear.bind(that), innerHTML: 'Yes'}, {innerHTML: 'No'}], undefined, true);
	},

	link() {
		return this.canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
	},

	save() {
		window.open(this.link(), '_self');
	},

	showLink() {
		win('Paint - Image data', 'Copy this string now and use it later as <code>image source</code> when adding an image to restore current state:<br><textarea style="width: 100%; height: 10em;" disabled>' + this.link() + '</textarea>');
	},

	//dialog function
	toggle(what, where = 'right') {
		if(what.style.getPropertyValue(where) === '1em')
			this.close(what, where);
		else
			this.openOnly(what, where);
	},
	open(what, where = 'right') {
		what.style.setProperty(where, '1em');
	},
	close(what, where = 'right') {
		what.style.setProperty(where, '');
	},
	openOnly(what, where = 'right') {
		let i;
		for(i = 0; i < this.dialogs.length; i++) {
			if(this.dialogs[i] === what)
				what.style.setProperty(where, '1em');
			else
				this.dialogs[i].style.setProperty(where, '');
		}
	},

	help() {
		win('Paint - No', 'No, there\'s no help about this paint program.', [{innerHTML: 'I hate you'}], () => {}, true);
	},
}

Paint.init(Paint.div());

//END

// made by dst212

/*
 * This script adds some nice functions to make it easier for me to write other scripts.
 *
 * Visit https://github.com/dst212/dst212.github.io/ to get more details.
 */

'use strict';

function addFunction(f, t) {	//concatenate functions
	return t ? (f ? () => {f(); t();} : t) : (f ? f : () => {});
}

function coverPage(color = 'transparent', id = 'cover-page-id') {
	let div = document.createElement('DIV');
	div.style = 'position: fixed; top: 0; left: 0; display: block; height: 100vh; width: 100vw; z-index: 1';
	div.style.backgroundColor = color;
	//everything z-indexed above 1 will be accessible
	div.setAttribute('id', id);
	document.body.appendChild(div);
	return div;
}
function uncoverPage(id = 'cover-page-id') {
	let div = document.getElementById(id);
	div && document.body.removeChild(div);
}

const Beep = (function() {
	let ctx, osc;
	return {
		ctx: () => ctx || (ctx = new (window.AudioContext || window.webkitAudioContext)()),
		start(freq = 1000) {
			this.ctx().resume().then(function() {
				osc = ctx.createOscillator();
				osc.frequency.value = freq;
				osc.start(ctx.currentTime);
				osc.connect(ctx.destination);
			});
		},
		stop() {
			osc.stop(ctx.currentTime);
			osc.disconnect(ctx.destination);
			osc = null;
			ctx.suspend();
		},
	};
})();

function beep(freq = 1000, ms = 500, type = 'sine') {
	let osc;
	Beep.ctx().resume().then(function() {
		osc = Beep.ctx().createOscillator();
		osc.type = type;
		osc.frequency.value = freq;
		osc.start(Beep.ctx().currentTime);
		osc.stop(Beep.ctx().currentTime + (ms / 1000));
		osc.connect(Beep.ctx().destination);
		osc.onended = () => Beep.ctx().suspend();
	});
}

function draggable(elem) {
	if(elem) {
		let x, y;
		let xn, yn;
		//set the transition duration of top and left to 0, so that it moves instantly
		elem.style.transition = 'all var(--duration), top 0s, left 0s';
		//if there's a "dragbar" element, it is used, else the whole element acts like the drag-bar
		(elem.getElementsByClassName('dragbar')[0] || elem).onmousedown = function(e) {
			let docmouseup = document.onmouseup;
			let docmousemove = document.onmousemove;
			document.documentElement.style.cursor = 'move';
			x = e.clientX;
			y = e.clientY;
			//the element follows the mouse
			document.onmousemove = function(e) {
				//move element
				if(0 <= e.clientY && e.clientY < document.documentElement.clientHeight) // if(0 <= elem.offsetTop - y + e.clientY && elem.offsetTop - y + e.clientY + elem.clientHeight < document.documentElement.clientHeight)
					elem.style.top = (yn = elem.offsetTop - y + (y = e.clientY)) + 'px';
				if(0 <= e.clientX && e.clientX < document.documentElement.clientWidth) // if(0 <= elem.offsetLeft - x + e.clientX && elem.offsetLeft - x + e.clientX + elem.clientWidth < document.documentElement.clientWidth)
					elem.style.left = (xn = elem.offsetLeft - x + (x = e.clientX)) + 'px';

				//avoid escaping the viewport
				//top and bottom sides
				if(yn < 0)
					elem.style.top = '0px';
				else if(document.documentElement.clientHeight - elem.clientHeight < yn)
					elem.style.top = document.documentElement.clientHeight - elem.clientHeight + 'px';
				//left and right sides
				if(xn < 0)
					elem.style.left = '0px';
				else if(document.documentElement.clientWidth - elem.clientWidth < xn)
					elem.style.left = document.documentElement.clientWidth - elem.clientWidth + 'px';

				return false;
			}
			//the element stops following the mouse
			document.onmouseup = function(e) {
				document.documentElement.style.cursor = '';
				document.onmouseup = docmouseup;
				document.onmousemove = docmousemove;
			}
			return false;
		}
	}
}

function center(elem) {
	if(elem) {
		elem.style.top = (document.documentElement.clientHeight - elem.clientHeight) / 2 + 'px';
		elem.style.left = (document.documentElement.clientWidth - elem.clientWidth) / 2 + 'px';
	}
}

function addStyleSheet(location, custom = {}) {
	let stylesheet = document.createElement('LINK');
	stylesheet.href = location;
	for(let key in custom)
		stylesheet[key] = custom[key];
	if(!stylesheet.rel)
		stylesheet.rel = 'stylesheet';
	if(!stylesheet.type)
		stylesheet.type = 'text/css';
	document.head.appendChild(stylesheet);
}

//END

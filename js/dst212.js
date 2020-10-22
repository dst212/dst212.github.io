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

const Beep = {
	ctx: new (window.AudioContext || window.webkitAudioContext)(),
	osc: null,
	start: function(freq = 1000) {
		this.osc = this.ctx.createOscillator();
		this.osc.frequency.value = freq;
		this.osc.start(this.ctx.currentTime);
		this.osc.connect(this.ctx.destination);
	},
	stop: function() {
		this.osc.stop(this.ctx.currentTime);
		this.osc.disconnect(this.ctx.destination);
		this.osc = null;
	},
};

var beep = (function() {
	let ctx = Beep.ctx;
	return function(freq = 1000, ms = 500, type = 'sine') {
		let osc = ctx.createOscillator();
		osc.type = type;
		osc.frequency.value = freq;
		osc.start(ctx.currentTime);
		osc.stop(ctx.currentTime + (ms/1000));
		osc.connect(ctx.destination);
	};
})();

//END

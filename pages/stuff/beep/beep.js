// made by dst212 - https://github.com/dst212/dst212.github.io/
'use strict';

(function() {
	let ctx, customWaves;
	function init() {
		ctx = new (AudioContext || webkitAudioContext)();
		customWaves = {
			//should've been something similar to a piano sound, but I'm not into sound waves
			'piano': ctx.createPeriodicWave(new Float32Array([0, Math.sqrt(3)/2, 0, 0]), new Float32Array([0, 0.25, 0, -0.25])),
		};
	}

	//they're not constant because can be modified in future
	let TYPE = 'square';
	let A = 440;
	const frequency = (n, customA) => (customA || A) * Math.pow(2, n / 12);

	const noteDiv = document.getElementById('beep-current-note');
	//0 → A, 2 → B, -1 → G#...
	function noteToString(note) {
		let out;
		switch(note % 12) {
			case 0: out = 'A'; break;
			case 1: case -11: out = 'A#'; break;
			case 2: case -10: out = 'B'; break;
			case 3: case -9: out = 'C'; break;
			case 4: case -8: out = 'C#'; break;
			case 5: case -7: out = 'D'; break;
			case 6: case -6: out = 'D#'; break;
			case 7: case -5: out = 'E'; break;
			case 8: case -4: out = 'F'; break;
			case 9: case -3: out = 'F#'; break;
			case 10: case -2: out = 'G'; break;
			case 11: case -1: out = 'G#'; break;
		};
		return out || '';
	}
	const isBlack = note => noteToString(note)[1] === '#'; //is a black key

	//symbol of a given key code
	function symbolOf(key) {
		let out;
		switch(key) {
			default: out = key.slice(-1); break;
			case 'Minus': out = '-'; break;
			case 'Equal': out = '='; break;
			case 'Backspace': out = '←'; break;
			case 'BracketLeft': out = '['; break;
			case 'BracketRight': out = ']'; break;
			case 'Semicolon': out = ';'; break;
			case 'Quote': out = '\''; break;
			case 'Comma': out = ','; break;
			case 'Period': out = '.'; break;
			case 'Slash': out = '/'; break;
			case 'IntlBackslash': out = '\\'; break;
		}
		return out || '';
	}

	const keyboard = document.getElementById('beep-keyboard'); //div containing piano keys
	let offset = -12; //the first note in assign[]. 0 is A (La)
	let assign = [['IntlBackslash'], ['KeyA'], ['KeyZ', 'KeyS'], ['KeyX'], ['KeyD'], ['KeyC'], ['KeyF'], ['KeyV', 'KeyG'], ['KeyB'], ['KeyH'], ['KeyN'], ['KeyJ', 'Digit1'], ['KeyM', 'KeyQ'], ['KeyK', 'Digit2'], ['KeyW', 'KeyL', 'Comma', 'Digit3'], ['KeyE', 'Period'], ['Digit4', 'Semicolon'], ['KeyR', 'Slash'], ['Digit5', 'Quote'], ['KeyT', 'Digit6'], ['KeyY'], ['Digit7'], ['KeyU'], ['Digit8'], ['KeyI'], ['Digit9'], ['KeyO', 'Digit0'], ['KeyP'], ['Minus'], ['BracketLeft'], ['Equal'], ['BracketRight', 'Backspace']];
	const keys = {}; //keys with respective buttons

	//oscillators and their object
	let oscillators = {};
	function oscillator(key) { //reach an oscillator by its note (key)
		let osc = oscillators[key];
		if(!osc) {
			osc = oscillators[key] = ctx.createOscillator();
			osc.frequency.value = frequency(key);
			osc.start(ctx.currentTime);
		}
		return osc;
	}

	(function() {
		function appendKey(i) {
			let value = i + offset, el = document.createElement('BUTTON');
			el.value = value;
			if(isBlack(value))
				el.classList.add('beep-black');
			el.ontouchstart = el.onmouseover = el.onmousedown = function(e) {
				if(!ctx)
					init();
				if(((e.buttons > 0 && e.button === 0) || e.code || e.touches?.length > 0) && !this.active) {
					this.classList.add('beep-active');
					this.osc = oscillator(value + shift.value() * 12);
					this.active = true;
					if(customWaves[TYPE])
						this.osc.setPeriodicWave(customWaves[TYPE]);
					else
						this.osc.type = TYPE;
					this.osc.connect(ctx.destination);
					noteDiv.innerHTML = noteToString(value);
					return false;
				}
			}
			el.ontouchcancel = el.ontouchend = el.onmouseout = el.onmouseup = function(e) {
				if(this.active) {
					this.classList.remove('beep-active');
					this.osc.disconnect();
					this.active = false;
					if(noteDiv.innerHTML === noteToString(value))
						noteDiv.innerHTML = '';
					return false;
				}
			}
			return keyboard.appendChild(el);
		}

		//assign each note to the respective key
		for(let i = 0; i < assign.length; i++) {
			let el = appendKey(i);
			el.innerHTML = symbolOf(assign[i][0]);
			for(let j = 0; j < assign[i].length; j++)
				keys[assign[i][j]] = el;
		}
	})();

	//octave shift (1 == 12 semitones above, -1 == 12 semitones below)
	const shift = (function() {
		let s = 0;
		const min = -2, max = 3;
		const div = document.getElementById('beep-octave');
		const clearActive = () => div.childNodes.forEach(item => item.classList.remove('beep-active'));
		for(let i = min; i <= max; i++) {
			let cur = i, btn = document.createElement('BUTTON');
			btn.innerHTML = cur + 4;
			if(cur === 0)
				btn.classList.add('beep-active');
			btn.classList.add('margin', 'square');
			btn.onclick = function(e) {
				s = cur;
				clearActive();
				this.classList.add('beep-active');
			};
			div.appendChild(btn);
		}
		return {
			value: () => s,
			min: () => min,
			max: () => max,
			left() {
				if(s > min) {
					--s;
					clearActive();
					div.childNodes[s - min].classList.add('beep-active');
				}
			},
			right() {
				if(s < max) {
					++s;
					clearActive();
					div.childNodes[s - min].classList.add('beep-active');
				}
			},
			reset() {
				s = 0;
				clearActive();
				div.childNodes[s - min].classList.add('beep-active');
			},
		};
	})();

	//key action check
	function pressed(e) {
		switch(e.code) {
			case 'ArrowLeft': shift.left(); break;
			case 'ArrowRight': shift.right(); break;
			case 'Space': shift.reset(); break;
			default:
				if(keys[e.code])
					keys[e.code].onmousedown(e);
				else
					return false;
		}
		return true;
	}
	function released(e) {
		if(keys[e.code]) {
			keys[e.code].onmouseup(e);
			return true;
		}
	}

	//events
	(function() {
		let onkeyup = document.onkeyup;
		let onkeydown = document.onkeydown;
		document.onkeydown = function(e) {
			if(
				document.activeElement.nodeName !== 'INPUT' &&
				document.activeElement.nodeName !== 'TEXTAREA' &&
				pressed(e)
			)
				return false;
		};
		document.onkeyup = function(e) {
			if(
				document.activeElement.nodeName !== 'INPUT' &&
				document.activeElement.nodeName !== 'TEXTAREA' &&
				released(e)
			)
				return false;
		};
		//restore old events when the page gets unloaded
		Page.unload = function() {
			document.onkeyup = onkeyup;
			document.onkeydown = onkeydown;
		};
	})();

	//settings popup
	let settingsPopup = new Popup('Beep - Settings', `
		<div class="radio margin-bottom">Wave type:</div><br>
		<div class="checkbox margin-bottom"></div>
	`, [{innerHTML: 'Ok'}], {draggable: true});

	//print a radio input for each wave type
	(function() {
		let label, input, div = settingsPopup.content.getElementsByClassName('radio')[0];
		['sine', 'square', 'sawtooth', 'triangle'].forEach((item, i) => {
			label = document.createElement('LABEL');
			label.innerHTML = item[0].toUpperCase() + item.slice(1);
			input = document.createElement('INPUT');
			input.type = 'radio';
			input.name = 'beep-settings-wave';
			input.value = item;
			input.onclick = function(e) {
				TYPE = this.value;
				this.blur();
			};
			if(TYPE === item)
				input.setAttribute('checked', '');
			label.appendChild(input);
			label.appendChild(document.createElement('SPAN'));
			div.appendChild(label);
		});

		//hide key references on keyboard's keys and hints above the keyboard
		const hide = () =>  document.getElementById('beep-hints').style.maxHeight = keyboard.style.fontSize = '0px';
		const show = () =>  document.getElementById('beep-hints').style.maxHeight = keyboard.style.fontSize = '';
		div = settingsPopup.content.getElementsByClassName('checkbox')[0];
		label = document.createElement('LABEL');
		label.innerHTML = 'Hide hints';
		input = document.createElement('INPUT');
		input.type = 'checkbox';
		input.onchange = function(e) {
			this.blur();
			if(this.checked) {
				localStorage.setItem('beep-clean-keys', '1');
				hide();
			} else {
				localStorage.removeItem('beep-clean-keys');
				show();
			}
		}
		if(localStorage.getItem('beep-clean-keys')) {
			hide();
			input.setAttribute('checked', '');
		}
		label.appendChild(input);
		label.appendChild(document.createElement('SPAN'));
		div.appendChild(label);
	})();

	//settings button
	(function() {
		let btn = document.createElement('BUTTON');
		btn.innerHTML = 'settings';
		btn.classList.add('material-icons', 'md-same', 'square', 'margin');
		btn.onclick = e => settingsPopup.open();
		noteDiv.parentNode.insertBefore(btn, noteDiv);
	})();
})();

//END

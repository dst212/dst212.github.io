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
		for(let key in keys) if(keys[key] !== 'br')
			keys[key].osc = oscillator(keys[key].value * 1);
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

	let keyboard = document.getElementById('beep-keyboard'); //div containing keys
	let offset = -11; //the first note in assign[]. 0 is A (La)
	let assign = ['KeyA', ['KeyZ', ['KeyS']], 'KeyX', 'KeyD', 'KeyC', 'KeyF', ['KeyV', ['KeyG']], 'KeyB', 'KeyH', 'KeyN', ['KeyJ', 'Digit1'], ['KeyM', 'KeyQ'], ['KeyK', 'Digit2'], ['Comma', 'KeyW', ['KeyL', 'Digit3']], ['Period', 'KeyE'], ['Semicolon', 'Digit4'], ['Slash', 'KeyR'], ['Quote', 'Digit5'], ['KeyT', ['Digit6']], 'KeyY', 'Digit7', 'KeyU', 'Digit8', 'KeyI', 'Digit9', ['KeyO', ['Digit0']], 'KeyP', 'Minus', 'BracketLeft', 'Equal', ['BracketRight', ['Backspace']]];
	//keyboard layout object
	let keys = {
		'a': 'br', 'Digit1': null, 'Digit2': null, 'Digit3': null, 'Digit4': null, 'Digit5': null, 'Digit6': null, 'Digit7': null, 'Digit8': null, 'Digit9': null, 'Digit0': null,    'Minus': null, 'Equal': null, 'Backspace': null,
		'b': 'br', 'KeyQ': null,   'KeyW': null,   'KeyE': null,   'KeyR': null,   'KeyT': null,   'KeyY': null,   'KeyU': null,   'KeyI': null,   'KeyO': null,   'KeyP': null,      'BracketLeft': null,'BracketRight': null,
		'c': 'br', 'KeyA': null,   'KeyS': null,   'KeyD': null,   'KeyF': null,   'KeyG': null,   'KeyH': null,   'KeyJ': null,   'KeyK': null,   'KeyL': null,   'Semicolon': null, 'Quote': null,
		'd': 'br', 'KeyZ': null,   'KeyX': null,   'KeyC': null,   'KeyV': null,   'KeyB': null,   'KeyN': null,   'KeyM': null,   'Comma': null,  'Period': null, 'Slash': null,
		'e': 'br'
	};
	//assign each note to the respective key
	for(let i = 0; i < assign.length; i++) {
		if(typeof assign[i] === 'object') {
			for(let j = 0; j < assign[i].length; j++) {
				if(typeof assign[i][j] === 'object') {
					for(let k = 0; k < assign[i][j].length; k++) //duplicated keys
						keys[assign[i][j][k]] = (i + offset).toString();
				} else
					keys[assign[i][j]] = i + offset;
			}
		} else
			keys[assign[i]] = i + offset;
	}

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

	//"light up" the keys
	function turnOn(value) {
		let i = value - offset;
		if(typeof assign[i] === 'object') {
			for(let j = 0; j < assign[i].length; j++)
				if(typeof assign[i][j] === 'string')
					keys[assign[i][j]].classList.add('beep-active');
		} else
			keys[assign[i]].classList.add('beep-active');
	}
	function turnOff(value) {
		let i = value - offset;
		if(typeof assign[i] === 'object') {
			for(let j = 0; j < assign[i].length; j++)
				if(typeof assign[i][j] === 'string')
					keys[assign[i][j]].classList.remove('beep-active');
		} else
			keys[assign[i]].classList.remove('beep-active');
	}

	//create keys from object and append to keyboard
	for(let key in keys) {
		let el, value = keys[key]; //value has to be local
		if(value === 'br') {
			el = document.createElement('BR');
		} else {
			el = document.createElement('BUTTON');
			el.id = 'beep-' + key;
			switch(key) {
				default: el.innerHTML = key.slice(-1); break;
				case 'Minus': el.innerHTML = '-'; break;
				case 'Equal': el.innerHTML = '='; break;
				case 'Backspace': el.innerHTML = '←'; break;
				case 'BracketLeft': el.innerHTML = '['; break;
				case 'BracketRight': el.innerHTML = ']'; break;
				case 'Semicolon': el.innerHTML = ';'; break;
				case 'Quote': el.innerHTML = '\''; break;
				case 'Comma': el.innerHTML = ','; break;
				case 'Period': el.innerHTML = '.'; break;
				case 'Slash': el.innerHTML = '/'; break;
			}
			if(typeof value === 'string') //duplicated button
				value *= 1, el.style.opacity = '0.5';
			if(typeof value === 'number') { //if value is a number, then it's a valid note
				let lower, upper;
				if((el.value = value) === 0)
					el.classList.add('invalid', 'btn');
				el.active = false;
				el.onmousedown = function(e) {
					this.active = true;
					if(e.shiftKey) {
						lower = oscillator(value - 12);
						lower.type = TYPE;
						lower.connect(ctx.destination);
					}
					if(customWaves[TYPE])
						this.osc.setPeriodicWave(customWaves[TYPE]);
					else
						this.osc.type = TYPE;
					this.osc.connect(ctx.destination);
					turnOn(value);
					noteDiv.innerHTML = noteToString(value);
				}
				el.onmouseup = function(e) {
					lower?.disconnect();
					this.osc.disconnect();
					this.active = false;
					turnOff(value);
					if(noteDiv.innerHTML === noteToString(value))
						noteDiv.innerHTML = '';
				}
			} else { //if value is null, it's not a clickable button
				el.setAttribute('disabled', '');
			}
			//replacing the old value with the button reference (to reach them quickly)
			keys[key] = el;
		}
		keyboard.appendChild(el);
	}

	let settingsPopup = new Popup('Beep - Settings', `
		<div class="radio">
			Wave type:
		</div>
	`, [{innerHTML: 'Ok'}], {draggable: true});

	//print a radio input for each wave type
	(function() {
		let radio = settingsPopup.content.getElementsByClassName('radio')[0];
		['sine', 'square', 'sawtooth', 'triangle'].forEach((item, i) => {
			let label, input;
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
			radio.appendChild(label);
		});
	})();

	//settings button
	(function() {
		let btn = document.createElement('BUTTON');
		btn.innerHTML = 'settings';
		btn.classList.add('material-icons', 'md-same');
		btn.onclick = e => settingsPopup.open();
		keyboard.appendChild(btn);
	})();

	//events
	(function() {
		let onkeyup = document.onkeyup;
		let onkeydown = document.onkeydown;
		let onmousedown = document.onmousedown;
		document.onmousedown = function(e) {
			init();
			(document.onmousedown = onmousedown)?.();
		}
		//trigger keys when they are pressed
		document.onkeydown = function(e) {
			if(!ctx)
				document.onmousedown(e);
			if(
				document.activeElement.nodeName !== 'INPUT' &&
				document.activeElement.nodeName !== 'TEXTAREA' &&
				keys[e.code]?.active === false
			) {
				keys[e.code].onmousedown(e);
				return false;
			}
		};
		document.onkeyup = function(e) {
			if(keys[e.code]?.active) {
				keys[e.code].onmouseup(e);
				return false;
			}
		};
		//restore old events when the page gets unloaded
		Page.unload = function() {
			document.onkeyup = onkeyup;
			document.onkeydown = onkeydown;
		};
	})();
})();

//END

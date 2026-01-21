// Made by dst212 - https://github.com/dst212/dst212.github.io/
'use strict';

/* global Popup, Page */

(function () {
	const ctx = new AudioContext();

	// They're not constant because can be modified in future
	let TYPE = 'square';
	let TEMPERAMENT = 'equal';
	let A = 440;
	let REFERENCE_KEY = 0; // 0 is A
	const CUSTOM_WAVES = {
		'custom-1': ctx.createPeriodicWave(new Float32Array([0, Math.sqrt(3) / 2, 0, 0]), new Float32Array([0, 0.25, 0, -0.25])),
	};
	const AVAILABLE_WAVES = [
		{name: 'Sine', value: 'sine'},
		{name: 'Square', value: 'square'},
		{name: 'Sawtooth', value: 'sawtooth'},
		{name: 'Triangle', value: 'triangle'},
		{name: 'Custom (1)', value: 'custom-1'},
	];
	const AVAILABLE_TEMPERAMENTS = [
		{name: 'Equal', value: 'equal'},
		{name: 'Pythagorean (4th+)', value: 'pyth-4'},
		{name: 'Pythagorean (5th-)', value: 'pyth-5'},
	];

	const pyth4 = [
		1, // Unison
		256 / 243, // Minor second
		9 / 8, // Major second
		32 / 27, // Minor third
		81 / 64, // Major third
		4 / 3, // Perfect fourth
		729 / 512, // Augmented fourth
		3 / 2, // Perfetct fifth
		128 / 81, // Minor sixth
		27 / 16, // Major sixth
		16 / 9, // Minor seventh
		243 / 128, // Major seventh
	];

	const pyth5 = [
		1, // Unison
		256 / 243, // Minor second
		9 / 8, // Major second
		32 / 27, // Minor third
		81 / 64, // Major third
		4 / 3, // Perfect fourth
		1024 / 729, // Diminished fifth
		3 / 2, // Perfetct fifth
		128 / 81, // Minor sixth
		27 / 16, // Major sixth
		16 / 9, // Minor seventh
		243 / 128, // Major seventh
	];
	function frequency(n, a, temp, ref = null) {
		if (ref === null) {
			ref = REFERENCE_KEY;
		}

		let ratio;
		switch (temp) {
			case 'pyth-4':
				n -= ref;
				ratio = pyth4[((n % 12) + 12) % 12];
				// Multiplying by 2**(n//12) gives the octave shift of A
				// Dividing by the ratio between ref and A allows arranging the ratios starting from ref rather than A
				// TODO: fix the octave beign shifted one below when changing REFERENCE_KEY
				return ratio * a / pyth4[(12 - ref) % 12] * (2 ** Math.floor(n / 12));
			case 'pyth-5':
				n -= ref;
				ratio = pyth5[((n % 12) + 12) % 12];
				return ratio * a / pyth5[(12 - ref) % 12] * (2 ** Math.floor(n / 12));
			default: // Equal
				return a * (2 ** (n / 12));
		}
	}

	const noteDiv = document.getElementById('beep-current-note');
	// 0 → A, 2 → B, -1 → G#...
	function noteToString(note) {
		switch (((note % 12) + 12) % 12) {
			case 0: return 'A';
			case 1: return 'A#';
			case 2: return 'B';
			case 3: return 'C';
			case 4: return 'C#';
			case 5: return 'D';
			case 6: return 'D#';
			case 7: return 'E';
			case 8: return 'F';
			case 9: return 'F#';
			case 10: return 'G';
			case 11: return 'G#';
			default: return '?';
		}
	}

	const isBlack = note => noteToString(note)[1] === '#'; // Is a black key

	// Symbol of a given key code
	function symbolOf(key) {
		switch (key) {
			case 'Minus': return '-';
			case 'Equal': return '=';
			case 'Backspace': return '←';
			case 'BracketLeft': return '[';
			case 'BracketRight': return ']';
			case 'Semicolon': return ';';
			case 'Quote': return '\'';
			case 'Comma': return ',';
			case 'Period': return '.';
			case 'Slash': return '/';
			case 'IntlBackslash': return '\\';
			default: return key.slice(-1);
		}
	}

	const keyboard = document.getElementById('beep-keyboard'); // Div containing piano keys
	const offset = -12; // The first note in assign[]. 0 is A (La)
	const assign = [['IntlBackslash'], ['KeyA'], ['KeyZ', 'KeyS'], ['KeyX'], ['KeyD'], ['KeyC'], ['KeyF'], ['KeyV', 'KeyG'], ['KeyB'], ['KeyH'], ['KeyN'], ['KeyJ', 'Digit1'], ['KeyM', 'KeyQ'], ['KeyK', 'Digit2'], ['KeyW', 'KeyL', 'Comma', 'Digit3'], ['KeyE', 'Period'], ['Digit4', 'Semicolon'], ['KeyR', 'Slash'], ['Digit5', 'Quote'], ['KeyT', 'Digit6'], ['KeyY'], ['Digit7'], ['KeyU'], ['Digit8'], ['KeyI'], ['Digit9'], ['KeyO', 'Digit0'], ['KeyP'], ['Minus'], ['BracketLeft'], ['Equal'], ['BracketRight', 'Backspace']];
	const keys = {}; // Keys with respective buttons

	// Create an oscillator
	function oscillator(freq, type, duration = null) {
		const osc = ctx.createOscillator();
		osc.frequency.value = freq;
		if (CUSTOM_WAVES[type]) {
			osc.setPeriodicWave(CUSTOM_WAVES[type]);
		} else {
			osc.type = type;
		}

		osc.connect(ctx.destination);
		osc.start(ctx.currentTime);

		if (typeof duration === 'number') {
			const stop = ctx.currentTime + duration;
			osc.stop(stop);
			setTimeout(() => osc.disconnect(), stop * 1000);
		}

		return osc;
	}

	(function () {
		function appendKey(i) {
			const value = i + offset;
			const el = document.createElement('BUTTON');
			el.value = value;
			if (isBlack(value)) {
				el.classList.add('beep-black');
			}

			function playNote(e) {
				if (((e.buttons > 0 && e.button === 0) || e.code || e.touches?.length > 0) && !this.active) {
					const key = value + (shift.value * 12);
					const freq = frequency(key, A, TEMPERAMENT);
					this.active = true;
					this.classList.add('beep-active');
					console.log(`Creating oscillator: key ${key}, A ${A}, temperament ${TEMPERAMENT}, ${freq} Hz`);
					this.osc = oscillator(freq, TYPE);
					noteDiv.innerHTML = noteToString(value);
					return false;
				}
			}

			el.addEventListener('touchstart', playNote);
			el.addEventListener('mouseover', playNote);
			// Setting the value here is needed because it will manually be called later
			el.onmousedown = playNote;

			function stopNote(_e) {
				if (this.active) {
					this.classList.remove('beep-active');
					this.osc.stop(ctx.currentTime);
					delete this.osc;
					this.active = false;
					if (noteDiv.innerHTML === noteToString(value)) {
						noteDiv.innerHTML = '';
					}

					return false;
				}
			}

			el.addEventListener('touchcancel', stopNote);
			el.addEventListener('touchend', stopNote);
			el.addEventListener('mouseout', stopNote);
			el.onmouseup = stopNote;

			return keyboard.appendChild(el);
		}

		// Assign each note to the respective key
		for (let i = 0; i < assign.length; i++) {
			const el = appendKey(i);
			el.innerHTML = symbolOf(assign[i][0]);
			for (let j = 0; j < assign[i].length; j++) {
				keys[assign[i][j]] = el;
			}
		}
	})();

	// Octave shift (1 == 12 semitones above, -1 == 12 semitones below)
	const shift = (function () {
		let s = 0;
		const min = -2;
		const max = 3;
		const div = document.getElementById('beep-octave');
		const clearActive = () => div.childNodes.forEach(item => item.classList.remove('beep-active'));
		for (let i = min; i <= max; i++) {
			const cur = i;
			const btn = document.createElement('BUTTON');
			btn.innerHTML = cur + 4;
			if (cur === 0) {
				btn.classList.add('beep-active');
			}

			btn.classList.add('margin', 'square');
			btn.onclick = function (_e) {
				s = cur;
				clearActive();
				this.classList.add('beep-active');
			};

			div.appendChild(btn);
		}

		return {
			get value() {
				return s;
			},
			get min() {
				return min;
			},
			get max() {
				return max;
			},
			left() {
				if (s > min) {
					--s;
					clearActive();
					div.childNodes[s - min].classList.add('beep-active');
				}
			},
			right() {
				if (s < max) {
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

	// Key action check
	function pressed(e) {
		switch (e.code) {
			case 'ArrowLeft': shift.left();
				break;
			case 'ArrowRight': shift.right();
				break;
			case 'Space': shift.reset();
				break;
			default:
				if (keys[e.code]) {
					keys[e.code].onmousedown(e);
				} else {
					return false;
				}
		}

		return true;
	}

	function released(e) {
		if (keys[e.code]) {
			keys[e.code].onmouseup(e);
			return true;
		}
	}

	// Events
	(function () {
		const {onkeyup} = document;
		const {onkeydown} = document;
		document.onkeydown = function (e) {
			if (
				document.activeElement.nodeName !== 'INPUT'
				&& document.activeElement.nodeName !== 'TEXTAREA'
				&& pressed(e)
			) {
				return false;
			}
		};

		document.onkeyup = function (e) {
			if (
				document.activeElement.nodeName !== 'INPUT'
				&& document.activeElement.nodeName !== 'TEXTAREA'
				&& released(e)
			) {
				return false;
			}
		};

		// Restore old events when the page gets unloaded
		Page.unload = function () {
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

	// Settings button
	(function () {
		const btn = document.createElement('BUTTON');
		btn.innerHTML = 'settings';
		btn.classList.add('material-icons', 'md-same', 'square', 'margin');
		btn.onclick = _e => settingsPopup.isUp() ? settingsPopup.close() : settingsPopup.open();
		noteDiv.parentNode.insertBefore(btn, noteDiv);
	})();
})();

// END

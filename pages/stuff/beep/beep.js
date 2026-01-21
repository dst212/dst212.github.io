// Made by dst212 - https://github.com/dst212/dst212.github.io/
'use strict';

/* global popup, Popup, Page */

(function () {
	const ctx = new AudioContext();

	let DEFAULT_GAIN = 0.3;
	let FIX_GAIN = false; // Lower the gain the more oscillators are playing
	let QUICK_FADE = true; // Quickly lower the gain before stopping an oscillator to avoid audio clicking
	const MAGIC_NUMBER = 0.015; // Remove audio clicking when stopping an oscillator
	const masterGain = ctx.createGain();
	const compressor = ctx.createDynamicsCompressor();
	const activeNodes = []; // Playing oscillators, needed to display ratios between frequencies etc.

	function resetGain() {
		masterGain.gain.setTargetAtTime(FIX_GAIN ? DEFAULT_GAIN / (activeNodes.length || 1) : DEFAULT_GAIN, ctx.currentTime, MAGIC_NUMBER);
	}

	function lowerGain(osc) {
		activeNodes.push(osc);
		if (FIX_GAIN) {
			masterGain.gain.setTargetAtTime(DEFAULT_GAIN / (activeNodes.length || 1), ctx.currentTime, MAGIC_NUMBER);
		}
	}

	function increaseGain(osc) {
		activeNodes.pop(osc);
		if (FIX_GAIN) {
			masterGain.gain.setTargetAtTime(DEFAULT_GAIN / (activeNodes.length || 1), ctx.currentTime, MAGIC_NUMBER);
		}
	}

	masterGain.connect(compressor).connect(ctx.destination);
	resetGain();

	// They're not constant because can be modified in future
	let TYPE = 'square';
	let TEMPERAMENT = 'equal';
	let A = 440;
	let REFERENCE_KEY = 0; // 0 is A
	let USE_DIM_5TH = false; // Use the diminished fifth instead of the augmented fourth
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
		{name: 'Pythagorean', value: 'pyth'},
		{name: '5-limit (symmetric)', value: '5-limit-sym'},
		{name: '5-limit (asymmetric extended)', value: '5-limit-asym'},
		{name: '7-limit', value: '7-limit'},
		{name: '17-limit', value: '17-limit'},
	];

	const ratios = {
		pyth: [
			1, // Unison
			256 / 243, // Minor second
			9 / 8, // Major second
			32 / 27, // Minor third
			81 / 64, // Major third
			4 / 3, // Perfect fourth
			// Augmented fourth , Diminished fifth
			[729 / 512, 1024 / 729],
			3 / 2, // Perfetct fifth
			128 / 81, // Minor sixth
			27 / 16, // Major sixth
			16 / 9, // Minor seventh
			243 / 128, // Major seventh
		],
		'5-limit-sym': [
			1, // Unison
			16 / 15, // Minor second
			9 / 8, // Major second
			6 / 5, // Minor third
			5 / 4, // Major third
			4 / 3, // Perfect fourth
			// Augmented fourth , Diminished fifth
			[45 / 32, 64 / 45],
			3 / 2, // Perfetct fifth
			8 / 5, // Minor sixth
			5 / 3, // Major sixth
			16 / 9, // Minor seventh
			15 / 8, // Major seventh
		],
		'5-limit-asym': [
			1, // Unison
			16 / 15, // Minor second
			9 / 8, // Major second
			6 / 5, // Minor third
			5 / 4, // Major third
			4 / 3, // Perfect fourth
			// Augmented fourth , Diminished fifth
			[25 / 18, 36 / 25],
			3 / 2, // Perfetct fifth
			8 / 5, // Minor sixth
			5 / 3, // Major sixth
			9 / 5, // Minor seventh
			15 / 8, // Major seventh
		],
		'7-limit': [
			1, // Unison
			15 / 14, // Minor second
			8 / 7, // Major second
			6 / 5, // Minor third
			5 / 4, // Major third
			4 / 3, // Perfect fourth
			// Augmented fourth , Diminished fifth
			[7 / 5, 10 / 7],
			3 / 2, // Perfetct fifth
			8 / 5, // Minor sixth
			5 / 3, // Major sixth
			7 / 4, // Minor seventh
			15 / 8, // Major seventh
		],
		'17-limit': [
			1, // Unison
			14 / 13, // Minor second
			8 / 7, // Major second
			6 / 5, // Minor third
			5 / 4, // Major third
			4 / 3, // Perfect fourth
			// Augmented fourth , Diminished fifth
			[17 / 12, 24 / 17],
			3 / 2, // Perfetct fifth
			8 / 5, // Minor sixth
			5 / 3, // Major sixth
			7 / 4, // Minor seventh
			13 / 7, // Major seventh
		],
	};

	function frequency(n, a, temp, ref = null) {
		if (ref === null) {
			ref = REFERENCE_KEY;
		}

		if (temp === 'equal') {
			return a * (2 ** (n / 12));
		}

		// Retrieve the ratios table given the temperament
		const table = ratios[temp];

		if (!table) {
			throw Error('Temperament "' + temp + '" not found.');
		} else if (ref) {
			n += 12 - ref;
		}

		let ratioN = table[((n % 12) + 12) % 12];
		let ratioRef = table[(12 - ref) % 12];
		if (typeof ratioN !== 'number') {
			ratioN = ratioN[USE_DIM_5TH ? 1 : 0];
		}

		if (typeof ratioRef !== 'number') {
			ratioRef = ratioRef[USE_DIM_5TH ? 1 : 0];
		}

		// Dividing by the ratio between ref and A allows arranging the ratios starting from ref rather than A
		// (ratio between n and ref) / (ratio between ref and A) * (frequency of A) * (octave shift)
		return ratioN / ratioRef * a * (2 ** Math.floor(n / 12));
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
		const gainNode = ctx.createGain();
		osc.frequency.value = freq;
		if (CUSTOM_WAVES[type]) {
			osc.setPeriodicWave(CUSTOM_WAVES[type]);
		} else {
			osc.type = type;
		}

		/// gainNode.connect(masterGain);
		osc.connect(gainNode).connect(masterGain);
		osc.gain = gainNode;
		lowerGain(osc);
		osc.start(ctx.currentTime);
		osc.onended = () => {
			increaseGain(osc);
		};

		if (typeof duration === 'number') {
			let stop = ctx.currentTime + duration;
			if (QUICK_FADE) {
				gainNode.gain.setTargetAtTime(0, stop, MAGIC_NUMBER);
				stop += MAGIC_NUMBER * 5;
			}

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

					if (recording.running) {
						this.recIndex = recording.add(key);
					}

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
					if (QUICK_FADE) {
						this.osc.gain.gain.setTargetAtTime(0, ctx.currentTime, MAGIC_NUMBER);
						this.osc.stop(ctx.currentTime + (MAGIC_NUMBER * 5));
					} else {
						this.osc.stop(ctx.currentTime);
					}

					delete this.osc;
					this.active = false;
					if (noteDiv.innerHTML === noteToString(value)) {
						noteDiv.innerHTML = '';
					}

					if (recording.running) {
						recording.write(this.recIndex);
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
				if (e.code === 'KeyS' && e.ctrlKey) {
					recBtn.click();
				} else if (keys[e.code]) {
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

	// Settings popup
	const settingsPopup = new Popup('Beep - Settings', `
	<input id="beep-settings-0" type="radio" name="beep-settings" checked></div>
	<label for="beep-settings-0">Wave</label>
	<section></section>
	<input id="beep-settings-1" type="radio" name="beep-settings"></div>
	<label for="beep-settings-1">Tuning</label>
	<section></section>
	<input id="beep-settings-2" type="radio" name="beep-settings"></div>
	<label for="beep-settings-2">UI</label>
	<section></section>
	<input id="beep-settings-4" type="radio" name="beep-settings"></div>
	<label for="beep-settings-4">About</label>
	<section><div>
		More about temperaments:<br>
		<a target="_blank" href="https://en.wikipedia.org/wiki/Musical_temperament">What is temperament?</a><br>
		<a target="_blank" href="https://en.wikipedia.org/wiki/Equal_temperament">Equal temperament</a><br>
		<a target="_blank" href="https://en.wikipedia.org/wiki/Pythagorean_tuning">Pythagorean tuning</a><br>
		<a target="_blank" href="https://en.wikipedia.org/wiki/Five-limit_tuning#The_just_ratios">5-, 7-, and 17-limit tables</a>
	</div></section>
	`, [{innerHTML: 'Ok'}], {draggable: true});
	settingsPopup.content.classList.add('sections');

	const sections = settingsPopup.content.querySelectorAll('section');

	(function () {
		const newBR = () => document.createElement('BR');

		const radios = [
			{
				id: 'beep-settings-wave',
				label: 'Wave type:',
				items: AVAILABLE_WAVES,
				category: 0,
				set(value) {
					TYPE = value;
				},
				get value() {
					return TYPE;
				},
			},
			{
				id: 'beep-settings-temperament',
				label: 'Temperament:',
				items: AVAILABLE_TEMPERAMENTS,
				category: 1,
				set(value) {
					TEMPERAMENT = value;
				},
				get value() {
					return TEMPERAMENT;
				},
			},
		];

		for (let i = 0; i < radios.length; i++) {
			const div = document.createElement('DIV');
			const r = radios[i];
			const value = localStorage.getItem(r.id);
			div.innerHTML = r.label;
			div.classList.add('radio', 'margin-botom');
			if (value) {
				r.set(value);
			}

			for (let j = 0; j < r.items.length; j++) {
				const item = r.items[j];
				const label = document.createElement('LABEL');
				const input = document.createElement('INPUT');
				label.innerHTML = item.name;
				input.type = 'radio';
				input.name = r.id;
				input.value = item.value;
				input.onclick = function (_e) {
					this.blur();
					r.set(this.value);
					localStorage.setItem(r.id, r.value);
					console.log(r.id, '=', r.value);
				};

				if (r.value === item.value) {
					input.setAttribute('checked', '');
				}

				label.appendChild(input);
				label.appendChild(document.createElement('SPAN'));
				div.appendChild(label);
			}

			sections[r.category].appendChild(div);
			sections[r.category].appendChild(newBR());
		}

		// Boolean settings
		const bools = [
			{
				// Hide key references on keyboard's keys and hints above the keyboard
				id: 'beep-clean-keys',
				label: 'Hide hints',
				tooltip: 'Hide key references on the keyboard and the explanation above for a cleaner UI.',
				category: 2,
				set(value) {
					keyboard.style.setProperty(
						'font-size',
						document.getElementById('beep-hints').style.maxHeight = value ? '0px' : '',
					);
				},
				get value() {
					return keyboard.style.getPropertyValue('font-size') !== '';
				},
			},
			{
				id: 'beep-fix-gain',
				label: 'Fix gain',
				tooltip: 'When playing multiple notes, reduce amplitude to produce a more harmonic sound.',
				category: 0,
				set(value) {
					FIX_GAIN = value;
					// Reset gain if oscillators are playing
					resetGain();
				},
				get value() {
					return FIX_GAIN;
				},
			},
			{
				id: 'beep-quick-fade',
				label: 'Quick fade',
				tooltip: 'Quickly lower the gain before stopping an oscillator to avoid audio clicking.',
				category: 0,
				set(value) {
					QUICK_FADE = value;
				},
				get value() {
					return QUICK_FADE;
				},
			},
			{
				id: 'beep-use-diminished-5th',
				label: 'Use diminished fifth',
				tooltip: 'Use the diminished fifth instead of the augmented fourth in non-equal tunings.',
				category: 1,
				set(value) {
					USE_DIM_5TH = value;
				},
			},
		];

		const checkboxes = [];
		for (let i = 0; i < sections.length; i++) {
			checkboxes[i] = document.createElement('DIV');
			checkboxes[i].classList.add('checkbox', 'margin-bottom');
			sections[i].appendChild(checkboxes[i]);
			sections[i].appendChild(newBR());
		}

		for (let i = 0; i < bools.length; i++) {
			const item = bools[i];
			const label = document.createElement('LABEL');
			const input = document.createElement('INPUT');
			const value = localStorage.getItem(item.id);
			label.innerHTML = item.label;
			label.title = item.tooltip;
			label.style.setProperty('cursor', 'help');
			input.type = 'checkbox';
			input.name = item.name;
			input.onchange = function (_e) {
				this.blur();
				item.set(this.checked);
				if (this.checked) {
					localStorage.setItem(item.id, '1');
				} else {
					localStorage.setItem(item.id, '0');
				}

				console.log(item.id, '=', this.checked);
			};

			if (value) {
				item.set(value === '1');
			} else {
				localStorage.setItem(item.id, item.value ? '1' : '0');
			}

			if (item.value) {
				input.setAttribute('checked', '');
			}

			label.appendChild(input);
			label.appendChild(document.createElement('SPAN'));
			checkboxes[item.category].appendChild(label);
		}

		const options = [
			{
				id: 'beep-reference-key',
				label: 'Reference note for temperament:',
				options: [
					{id: 0, name: 'A'},
					{id: 1, name: 'A#'},
					{id: 2, name: 'B'},
					{id: 3, name: 'C'},
					{id: 4, name: 'C#'},
					{id: 5, name: 'D'},
					{id: 6, name: 'D#'},
					{id: 7, name: 'E'},
					{id: 8, name: 'F'},
					{id: 9, name: 'F#'},
					{id: 10, name: 'G'},
					{id: 11, name: 'G#'},
				],
				category: 1,
				set(value) {
					REFERENCE_KEY = typeof value === 'number' ? value : parseInt(value, 10);
				},
				get value() {
					return REFERENCE_KEY;
				},
			},
		];

		for (let i = 0; i < options.length; i++) {
			const item = options[i];
			const label = document.createElement('LABEL');
			const select = document.createElement('SELECT');
			const value = localStorage.getItem(item.id);
			label.innerHTML = options[i].label;
			if (value) {
				item.set(value);
			}

			for (let j = 0; j < item.options.length; j++) {
				const option = document.createElement('OPTION');
				option.value = item.options[j].id;
				option.innerHTML = item.options[j].name;
				if (item.value === item.options[j].id) {
					option.setAttribute('selected', '');
				}

				select.appendChild(option);
			}

			select.onchange = function (_e) {
				item.set(this.value);
				localStorage.setItem(item.id, item.value);
				console.log(item.id, '=', item.value);
			};

			sections[item.category].appendChild(label);
			sections[item.category].appendChild(newBR());
			sections[item.category].appendChild(select);
			sections[item.category].appendChild(newBR());
			sections[item.category].appendChild(newBR());
		}

		const numeric = [
			{
				id: 'beep-gain',
				label: 'Volume (gain):',
				slider: true,
				step: 0.0000000000000001,
				min: -1,
				max: 1,
				minInc: true,
				maxInc: true,
				category: 0,
				parse: value => parseFloat(value, 10),
				set(value) {
					DEFAULT_GAIN = value;
				},
				get value() {
					return DEFAULT_GAIN;
				},
			},
			{
				id: 'beep-a-frequency',
				label: 'Frequency of A:',
				step: 0.0000000000000001,
				min: 0,
				max: Infinity,
				minInc: false,
				maxInc: false,
				category: 1,
				parse: value => parseFloat(value, 10),
				set(value) {
					A = value;
					if (value < 20 || value > 20000) {
						console.warn('A frequency of', value, ' Hz won\'t probably be heard by any regular human.');
					}
				},
				get value() {
					return A;
				},
			},
		];

		function numericIsValid(value, item) {
			return !(
				(item.minInc && value < item.min)
				|| (item.minExc && value <= item.min)
				|| (item.maxInc && value > item.max)
				|| (item.maxExc && value >= item.max)
			);
		}

		function constraintsToString(item) {
			if (item.min === -Infinity && item.max === Infinity) {
				return 'Any real number';
			}

			const low = item.minExc ? '&lt;' : '&lt;=';
			const high = item.maxExc ? '&lt;' : '&lt;=';

			if (item.min === -Infinity) {
				return `value ${high} ${item.max}`;
			}

			if (item.max === Infinity) {
				return `${item.min} ${low} value`;
			}

			return `${item.min} ${low} value ${high} ${item.max}`;
		}

		for (let i = 0; i < numeric.length; i++) {
			const item = numeric[i];
			const input = document.createElement('INPUT');
			const label = document.createElement('LABEL');
			let value = localStorage.getItem(item.id);
			// Input.type = item.slider ? 'range' : 'number';
			input.type = 'number';
			input.min = item.min;
			input.max = item.max;
			if (item.step !== undefined) {
				input.step = item.step;
			}

			label.innerHTML = item.label;
			if (value) {
				try {
					value = item.parse(value);
					if (numericIsValid(value, item)) {
						item.set(value);
					}
				} catch (e) {
					console.error(e);
				}
			}

			input.value = item.value;
			input.onchange = function (_e) {
				this.blur();
				const value = item.parse(this.value);
				if (numericIsValid(value, item)) {
					item.set(value);
					localStorage.setItem(item.id, item.value);
				} else {
					popup('Beep', 'Invalid value. Constraints:<br><div class="center"><code>' + constraintsToString(item) + '</code></div>', [{innerHTML: 'Ok'}]);
				}
			};

			sections[item.category].appendChild(label);
			sections[item.category].appendChild(newBR());
			sections[item.category].appendChild(input);
			sections[item.category].appendChild(newBR());
		}
	})();

	// Settings button
	(function () {
		const btn = document.createElement('BUTTON');
		btn.innerHTML = 'settings';
		btn.classList.add('material-icons', 'md-same', 'square', 'margin');
		btn.onclick = _e => settingsPopup.isUp() ? settingsPopup.close() : settingsPopup.open();
		noteDiv.parentNode.insertBefore(btn, noteDiv);
	})();

	// Autoplaying files and recordings
	let track;
	let playing;

	// File loading
	const fileLoader = document.createElement('INPUT');
	const fileReader = new FileReader();
	fileLoader.type = 'file';
	fileLoader.accept = 'application/json';

	fileLoader.onchange = function () {
		fileReader.readAsText(this.files[0]);
	};

	fileReader.onload = function () {
		track = JSON.parse(this.result);
	};

	fileReader.onerror = function () {
		popup('Beep', 'Couldn\'t load the selected file:<br>' + this.error, [{innerHTML: 'Ok'}]);
	};

	// Play the loaded file
	const playTrack = (function () {
		function stopPlaying() {
			playBtn.innerHTML = 'play_arrow';
			playing = null;
		}

		// Step for music notes in tracks while playing a macro.
		// "timeMod" is the multiplier of the durations.
		// Since values are saved in the json file in seconds and setTimeouts accepts milliseconds, it defaults to 1000
		// Same logic applied below in playNext()
		// "timeMod" can be modified to alter the tempo of a track
		function playMacro(notes, timeMod = 1000, i = 0) {
			if (typeof notes[i][0] === 'number') {
				console.log(`Autoplay (macro): ${notes[i][0]} starting at ${notes[i][1]} for ${notes[i][2]} seconds.`);
				const fakeEvent = {code: assign[notes[i][0] - offset - (shift.value * 12)]?.[0]};
				if (pressed(fakeEvent)) {
					console.log('Assigned key:', fakeEvent.code);
					setTimeout(released, notes[i][2] * timeMod, fakeEvent);
				} else {
				// The assigned key doesn't exist, just beep with the current settings
					oscillator(frequency(notes[i][0], A, TEMPERAMENT), TYPE, notes[i][2]);
				}
			} else {
				console.error('Unrecognized note (first item is not a number):', notes[i]);
			}

			if (i < notes.length - 1) {
				playing = setTimeout(playMacro, (notes[i + 1][1] - notes[i][1]) * timeMod, notes, timeMod, i + 1);
			} else {
				console.log('Macro ended.');
				setTimeout(stopPlaying, notes[i][2] * timeMod);
			}
		}

		// Step for music notes in tracks
		function playNext(notes, {timeMod = 1000, a = 440, temp = 'equal', i = 0}) {
			if (typeof notes[i][0] === 'number') {
				oscillator(frequency(notes[i][0], a, temp), TYPE, notes[i][2]);
			} else {
				console.error('Unrecognized note (first item is not a number):', notes[i]);
			}

			if (i < notes.length) {
				playing = setTimeout(playNext, (notes[i + 1][1] - notes[i][1]) * timeMod, notes, {timeMod, a, temp, i: i + 1});
			} else {
				setTimeout(stopPlaying, notes[i][2] * timeMod);
			}
		}

		return function (t, macro = false) {
			if (!t && t !== track) {
				t = track;
			}

			if (t?.n?.length > 0) {
				if (macro) {
					console.log('Now playing a macro.');
				} else {
					console.log('Now playing a track in the background.');
				}

				playing = macro ? setTimeout(playMacro, t.n[0][1] || 0, t.n, t.m) : setTimeout(playNext, t.n[0][1], t.n, {timeMod: t.m, a: t.a});
			} else {
				popup('Beep', 'The track is empty or invalid.', [{innerHTML: 'Ok'}]);
				playBtn.innerHTML = 'play_arrow';
			}
		};
	})();

	// Recording object
	const recording = (function () {
		let save;
		let start;
		let startOffset; // Keep track of pauses
		let ongoing = false;
		const newRec = () => ({
			n: [], // Array of [value of note, start, duration]
			a: A, // Value of A in Hz (defaults to 440)
			m: 1000, // Time modifier (1000 equals 1x)
			t: TYPE, // Wave type (defaults to square)
			temp: TEMPERAMENT, // Temperament used (defaults to equal)
		});
		const fileSaver = document.createElement('A');
		return {
			get running() {
				return ongoing;
			},
			pause() {
				startOffset = ctx.currentTime;
				ongoing = false;
			},
			resume() {
				ongoing = true;
				start -= ctx.currentTime - startOffset;
			},
			start() {
				save = newRec();
				// eslint-disable-next-line
				start = startOffset = ctx.currentTime;
				this.resume();
			},
			stop() {
				this.pause();
				this.save();
			},
			save() {
				fileSaver.target = '_self';
				fileSaver.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(save));
				fileSaver.download = 'beep-recording-' + (new Date()).toISOString().slice(0, 19).replace(/(-|:)/g, '').replace('T', '-') + '.json';
				fileSaver.click();
			},
			add(value) {
				save.n.push([value, ctx.currentTime - start, 0]);
				return save.n.length - 1;
			},
			write(i) {
				if (save.n[i]) {
					save.n[i][2] = ctx.currentTime - start - save.n[i][1];
				}
			},
		};
	})();

	// Start/stop recording button
	const recBtn = (function () {
		const btn = document.createElement('BUTTON');
		btn.innerHTML = 'mic';
		btn.classList.add('material-icons', 'md-same', 'square', 'margin');
		btn.onclick = function (_e) {
			if (recording.running) {
				recording.stop();
				btn.innerHTML = 'mic';
				this.classList.remove('blink', 'red');
			} else {
				btn.innerHTML = 'fiber_manual_record';
				this.classList.add('blink', 'red');
				recording.start();
			}
		};

		noteDiv.parentNode.insertBefore(btn, noteDiv);
		return btn;
	})();

	// Play/pause button
	const playBtn = (function () {
		const btn = document.createElement('BUTTON');
		btn.innerHTML = 'play_arrow';
		btn.classList.add('material-icons', 'md-same', 'square', 'margin');
		btn.onclick = function (_e) {
			if (playing) {
				clearTimeout(playing);
				btn.innerHTML = 'play_arrow';
				playing = undefined;
				console.log('Player stopped.');
			} else {
				btn.innerHTML = 'pause';
				playTrack(track, true);
			}
		};

		noteDiv.parentNode.insertBefore(btn, noteDiv);
		return btn;
	})();

	// Download button
	(function () {
		const btn = document.createElement('BUTTON');
		btn.innerHTML = 'file_download';
		btn.classList.add('material-icons', 'md-same', 'square', 'margin');
		btn.onclick = _e => recording.save();
		noteDiv.parentNode.insertBefore(btn, noteDiv);
	})();

	// Upload button
	(function () {
		const btn = document.createElement('BUTTON');
		btn.innerHTML = 'file_upload';
		btn.classList.add('material-icons', 'md-same', 'square', 'margin');
		btn.onclick = _e => !recording.running && fileLoader.click();
		noteDiv.parentNode.insertBefore(btn, noteDiv);
	})();
})();

// END

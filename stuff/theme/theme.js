// made by dst212, https://github.com/dst212/dst212.github.io/

/*
 * Website theme customization.
 * Themes stored on https://dst212.github.io/stuff/theme/theme.css
 */

'use strict';

const Theme = (function() {
	let that;
	//theme list for disco mode
	const themes = ['red-theme', 'orange-theme', 'yellow-theme', 'lime-theme', 'cyan-theme', 'blue-theme', 'magenta-theme'];
	//temp mode (no saves are performed)
	let tempModeColor = localStorage.themeColor;
	//disco song (useless for now since altervista is amazing)
	let disco = new Audio(localStorage.discoModeMusic || 'https://dst.altervista.org/files/audios/disco.mp3');
	disco.loop = true;
	//computed style of document.documentElement
	let computedStyle = null;
	//custom values
	let custom = JSON.parse(localStorage.getItem('theme-custom-values')) || {
		'header-bg':	'var(--accent)',
		'header-fg':	'var(--background)',
		'title-bg':		'var(--accent-dark)',
		'title-fg':		'var(--foreground)',
		'body-bg':		'var(--background)',
		'body-fg':		'var(--foreground)',
	};

	//remove certain classes from document
	function removeClasses(what = 'theme') {
		what = '-' + what;
		document.documentElement.classList.forEach((item) => {
			if(item.search(what) !== -1) //class is a theme
				document.documentElement.classList.remove(item);
		});
	}
	//set disco moode
	function discoMode(mode, wait, count = 0) {
		if(localStorage.themeColor === mode || mode === tempModeColor) {
			document.documentElement.classList.remove(themes[count++]);
			if(count >= themes.length)
				count = 0;
			document.documentElement.classList.add(themes[count]);
			computedStyle = null; //make it always null so that the function getComputedStyle() will be triggered each time Theme.getComputedStyle() will be called
			localStorage.resumeMusic = disco.currentTime;
			setTimeout(discoMode, wait, mode, wait, count);
		}
	}

	//actual object
	that = {
		update(color, mode) {
			if(!color)
				color = localStorage.themeColor;
			tempModeColor = color;
			if(!mode)
				mode = localStorage.themeMode;

			removeClasses('theme');
			if(color === 'disco') {
				let sleep = that.getComputedStyle().getPropertyValue('--duration').slice(0, this.length-1);

				//music stuff
				if(localStorage.playDisco != 1 && localStorage.playDisco != 0)
					localStorage.playDisco = 1; //will be used for settings in future
				if(localStorage.playDisco == 1) {
					disco.currentTime = !localStorage.resumeMusic ? 0 : localStorage.resumeMusic * 1;
					//if the disco song is available, play it
					if(disco.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA)
						disco.play();
				}

				// console.log('Starting disco mode: ' + sleep + 's delay, ' + disco.currentTime + 's resume');
				discoMode('disco', sleep === '' ? 350 : sleep * 1000);
			} else {
				if(!disco.paused)
					disco.pause();
				if(color === 'quiet')
					discoMode('quiet', 5000);
				else {
					document.documentElement.classList.add(color + '-theme');
					//toggle white mode if it's (not) the current one
					if(
						(mode === 'white' && !document.documentElement.classList.contains('white-mode')) ||
						(mode !== 'white' && document.documentElement.classList.contains('white-mode'))
					)
						document.documentElement.classList.toggle('white-mode');
				}
				computedStyle = null;
			}
		},
		getComputedStyle: () => computedStyle || (computedStyle = getComputedStyle(document.documentElement)),
		//manage modes (black or white)
		background: {
			get: () => that.getComputedStyle().getPropertyValue('--body-fg'),
			set(id, save = true) {
				if((localStorage.themeMode !== id || !save) && (id === 'white' || id === 'black')) {
					if(save)
						localStorage.themeMode = id;
					that.update(null, id);
				}
			},
			toggle(save = true) {
				if(save) {
					if(localStorage.themeMode === 'white')
						localStorage.themeMode = 'black';
					else
						localStorage.themeMode = 'white';
				}
				document.documentElement.classList.toggle('white-mode');
				that.update(null, document.documentElement.classList.contains('white-mode') ? 'white' : 'black');
			},
			//background intensity/brightness
			intensity: {
				get: () => that.getComputedStyle().getPropertyValue('--bg-delta') || '0',
				set(value = 0, save = true) {
					if(save)
						localStorage.setItem('theme-background-intensity', value);
					document.documentElement.style.setProperty('--bg-delta', value);
					computedStyle = null;
				},
			}
		},
		//manage color schemes
		color: {
			get: () => that.getComputedStyle().getPropertyValue('accent'),
			set(id, save = true) {
				if(localStorage.themeColor !== id || !save) {
					if(save)
						localStorage.themeColor = id;
					that.update(id);
				}
			},
		},
		//manage styles (default, mono, custom...)
		style: {
			set(id, save = true) {
				if(!id)
					id = 'default';
				else if(id === 'custom') {
					//create the custom theme if needed
					that.custom.update();
					if(save)
						that.custom.save();
				}
				if(!document.documentElement.classList.contains(id + '-style')) {
					removeClasses('style');
					document.documentElement.classList.add(id + '-style');
					if(save)
						localStorage.themeStyle = id;
				}
				computedStyle = null;
			}
		},
		custom: {
			get: () => custom,
			set: (key, value) => custom[key] = value,
			update: (function() {
				//create/update the custom style sheet
				let customStyleElem;
				return function() {
					let innerHTML;
					if(!customStyleElem) {
						customStyleElem = document.createElement('STYLE');
						customStyleElem.rel = 'stylesheet';
						customStyleElem.type = 'text/css';
						document.head.appendChild(customStyleElem);
					}
					innerHTML = '.custom-style {'
					for(let key in custom)
						innerHTML += '--' + key + ':' + custom[key] + ';'
					innerHTML += '}';
					customStyleElem.innerHTML = innerHTML;
				}
			})(),
			save() {
				localStorage.setItem('theme-custom-values', JSON.stringify(custom));
			},
		},
		get: prop => that.getComputedStyle().getPropertyValue('--' + prop),
		set(prop, value) {
			if(prop) {
				document.documentElement.style.setProperty('--' + prop, value);
				computedStyle = null;
			}
		},
	};

	//set a background intensity if set
	document.documentElement.style.setProperty('--bg-delta', localStorage.getItem('theme-background-intensity') || '0');
	//set style
	that.style.set(localStorage.themeStyle, false);

	//default theme
	if(!localStorage.themeMode)
	 	localStorage.themeMode = 'black';
	if(!localStorage.themeColor)
		that.color.set('lime');
	else
		that.update();

	return that;
})();

//END

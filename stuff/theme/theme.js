// made by dst212, https://github.com/dst212/dst212.github.io/

/*
 * Website theme customization.
 * Themes stored on https://dst212.github.io/stuff/theme/theme.css
 */

'use strict';

var Theme = {
	update: (function () {
		const themes = ['red-theme', 'orange-theme', 'yellow-theme', 'lime-theme', 'cyan-theme', 'blue-theme', 'magenta-theme'];
		let tempMode = false, tempModeTheme = localStorage.theme;
		let disco = new Audio(localStorage.discoModeMusic || 'https://dst.altervista.org/files/audios/disco.mp3');
		disco.loop = true;
		function removeClasses() {
			document.documentElement.classList.forEach((item) => {
				if(item !== 'white-mode')
					document.documentElement.classList.remove(item);
			});
		}
		function discoMode(mode, wait, count = 0) {
			if(localStorage.themeColor === mode || tempMode) {
				document.documentElement.classList.remove('dark-' + themes[count], 'light-' + themes[count++]);
				if(count >= themes.length)
					count = 0;
				if(localStorage.theme === 'black' || (tempMode && tempModeTheme === 'black'))
					document.documentElement.classList.add('light-' + themes[count]);
				else if(localStorage.theme === 'white' || (tempMode && tempModeTheme === 'white'))
					document.documentElement.classList.add('dark-' + themes[count]);
				Theme.computedStyle = null; //make it always null so that the function getComputedStyle() will be triggered each time Theme.getComputedStyle() will be called
				localStorage.resumeMusic = disco.currentTime;
				setTimeout(discoMode, wait, mode, wait, count);
			}
		}
		return function(color, mode) {
			tempMode = !(!color && !mode); //if both color and mode are not set, tempMode == false
			if(!color)
				color = localStorage.themeColor;
			if(!mode)
				mode = localStorage.theme;
			else
				tempModeTheme = mode;

			removeClasses();
			if(color === 'disco') {
				let sleep = Theme.getComputedStyle().getPropertyValue('--duration').slice(0, this.length-1);
				if(localStorage.playDisco != 1 && localStorage.playDisco != 0)
					localStorage.playDisco = 1; //will be used for settings in future
				if(localStorage.playDisco == 1) {
					disco.currentTime = !localStorage.resumeMusic ? 0 : localStorage.resumeMusic * 1;
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
					document.documentElement.classList.add((mode === 'white' ? 'dark-' : 'light-') + color + '-theme');
					if(
						(mode === 'white' && !document.documentElement.classList.contains('white-mode')) ||
						(mode !== 'white' && document.documentElement.classList.contains('white-mode'))
					)
						document.documentElement.classList.toggle('white-mode');
				}
				Theme.computedStyle = getComputedStyle(document.documentElement);
			}
		}
	})(),
	computedStyle: null,
	getComputedStyle: () => (Theme.computedStyle) || (Theme.computedStyle = getComputedStyle(document.documentElement)),
	background: {
		get: () => Theme.getComputedStyle().getPropertyValue('--body-fg'),
		set(id, save = true) {
			if((localStorage.theme !== id || !save) && (id === 'white' || id === 'black')) {
				if(save)
					localStorage.theme = id;
				Theme.update(null, id);
			}
		},
		toggle(save = true) {
			if(save) {
				if(localStorage.theme === 'white')
					localStorage.theme = 'black';
				else
					localStorage.theme = 'white';
			}
			document.documentElement.classList.toggle('white-mode');
			Theme.update(null, document.documentElement.classList.contains('white-mode') ? 'white' : 'black');
		},
	},
	color: {
		get: () => Theme.getComputedStyle().getPropertyValue('--accent'),
		set(id, save = true) {
			if(localStorage.themeColor !== id || !save) {
				if(save)
					localStorage.themeColor = id;
				Theme.update(id);
			}
		},
	},
	get: (prop) => Theme.getComputedStyle().getPropertyValue('--' + prop),
};

//default theme
if(localStorage.theme === 'white')
	document.documentElement.classList.toggle('white-mode');
else if(localStorage.theme !== 'black')
	localStorage.theme = 'black';
if(!localStorage.themeColor)
	Theme.color.set('lime');
else
	Theme.update();

//END

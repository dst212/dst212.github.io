// made by dst212, https://github.com/dst212/dst212.github.io/

/*
 * Website theme customization.
 * Themes stored on https://dst212.github.io/stuff/theme/theme.css
 */

'use strict';

var Theme = {
	update: (function () {
		const darkThemes =	['dark-black-theme',	'dark-white-theme',	'dark-red-theme',	'dark-yellow-theme',	'dark-lime-theme',	'dark-cyan-theme',	'dark-blue-theme',	'dark-magenta-theme'];
		const lightThemes =	['light-black-theme',	'light-white-theme','light-red-theme',	'light-yellow-theme',	'light-lime-theme',	'light-cyan-theme',	'light-blue-theme',	'light-magenta-theme'];
		var disco = new Audio(localStorage.discoModeMusic || 'https://dst.altervista.org/files/audios/disco.mp3');
		disco.loop = true;
		function removeClasses() {
			document.documentElement.classList.forEach((item) => {
				if(item !== 'white-mode') document.documentElement.classList.remove(item);
			});
		}
		function discoMode(mode, wait, count = 2) {
			if(localStorage.themeColor === mode) {
				document.documentElement.classList.remove(darkThemes[count], lightThemes[count++]);
				if(count >= darkThemes.length) count = 2;
				if(localStorage.theme === 'white') document.documentElement.classList.add(darkThemes[count]);
				else if(localStorage.theme === 'black') document.documentElement.classList.add(lightThemes[count]);
				Theme.computedStyle = undefined; //make it always undefined so that the function getComputedStyle() will be triggered each time the method getComputedStyle() of Theme will be called
				localStorage.resumeMusic = disco.currentTime;
				setTimeout(discoMode, wait, mode, wait, count);
			}
		}
		return function() {
			removeClasses();
			if(localStorage.themeColor === 'disco') {
				let sleep = Theme.getComputedStyle().getPropertyValue('--duration').slice(0, this.length-1);
				if(localStorage.playDisco != 1 && localStorage.playDisco != 0) localStorage.playDisco = 1; //will be used for settings in future
				if(localStorage.playDisco == 1) {
					disco.currentTime = !localStorage.resumeMusic ? 0 : localStorage.resumeMusic * 1;
					disco.play();
				}
				// console.log('Starting disco mode: ' + sleep + 's delay, ' + disco.currentTime + 's resume');
				discoMode('disco', (sleep === '') ? 350 : sleep * 1000);
			} else {
				if(!disco.paused) disco.pause();
				if(localStorage.themeColor === 'quiet') discoMode('quiet', 5000);
				else if(localStorage.theme === 'white') document.documentElement.classList.add('dark-' + localStorage.themeColor + '-theme');
				else document.documentElement.classList.add('light-' + localStorage.themeColor + '-theme');
				Theme.computedStyle = getComputedStyle(document.documentElement);
			}
		}
	})(),
	computedStyle: undefined,
	getComputedStyle: () => (Theme.computedStyle) || (Theme.computedStyle = getComputedStyle(document.documentElement)),
	background: {
		get: () => Theme.getComputedStyle().getPropertyValue('--body-fg'),
		set(id) {
			if(localStorage.theme != id && (id === 'white' || id === 'black')) {
				localStorage.theme = id;
				Theme.update();
			}
		},
		toggle() {
			if(localStorage.theme === 'white') localStorage.theme = 'black';
			else localStorage.theme = 'white';
			document.documentElement.classList.toggle('white-mode');
			Theme.update();
		},
	},
	color: {
		get: () => Theme.getComputedStyle().getPropertyValue('--accent'),
		set(id) {
			if(localStorage.themeColor !== id) {
				localStorage.themeColor = id;
				Theme.update();
			}
		},
	},
	get: (prop) => Theme.getComputedStyle().getPropertyValue('--' + prop),
};

//default theme
if(localStorage.theme === 'white') document.documentElement.classList.toggle('white-mode');
else if(localStorage.theme !== 'black') localStorage.theme = 'black';
if(!localStorage.themeColor) Theme.color.set('lime');
else Theme.update();

//END

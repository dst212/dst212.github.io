// made by dst212

/*
 * This script contains some functions to customize the website's theme.
 * It does not work without https://dst212.github.io/stuff/theme/theme.css,
 * where all theme-schemes are stored.
 *
 * Visit https://github.com/dst212/dst212.github.io/ to get more details.
 */

var Theme = {
	update: (function () {
		var darkThemes =	['dark-black-theme',	'dark-white-theme',	'dark-red-theme',	'dark-yellow-theme',	'dark-lime-theme',	'dark-cyan-theme',	'dark-blue-theme',	'dark-magenta-theme'];
		var lightThemes =	['light-black-theme',	'light-white-theme','light-red-theme',	'light-yellow-theme',	'light-lime-theme',	'light-cyan-theme',	'light-blue-theme',	'light-magenta-theme'];
		// var disco = document.getElementById('disco-song');
		var disco = new Audio('https://dst.altervista.org/files/audios/disco.mp3');
		disco.loop = true;
		function removeClasses() {
			var i;
			for(i = 0; i < lightThemes.length; i++) {
				document.documentElement.classList.remove(lightThemes[i], darkThemes[i]);
			}
		}
		function discoMode(mode, wait, count = 2) {
			if(localStorage.themeColor == mode) {
				document.documentElement.classList.remove(darkThemes[count], lightThemes[count++]);
				if(count >= darkThemes.length) count = 2;
				if(localStorage.theme == 'white') document.documentElement.classList.add(darkThemes[count]);
				else if(localStorage.theme=='black') document.documentElement.classList.add(lightThemes[count]);
				localStorage.resumeMusic = disco.currentTime;
				setTimeout(discoMode, wait, mode, wait, count);
			}
		}
		return function() {
			removeClasses();
			if(localStorage.themeColor == 'disco') {
				var sleep = getComputedStyle(document.documentElement).getPropertyValue('--transition').slice(0, this.length-1);
				if(localStorage.playDisco != 1 && localStorage.playDisco != 0) localStorage.playDisco = 1; //will be used for settings in future
				if(localStorage.playDisco == 1) {
					disco.currentTime = (localStorage.resumeMusic == null || localStorage.resumeMusic == undefined) ? 0 : localStorage.resumeMusic * 1;
					disco.play();
				}
				console.log('Starting disco mode.');
				console.log('Delay: ' + sleep + 's');
				console.log('Resume: ' + disco.currentTime + 's');
				discoMode('disco', (sleep == '') ? 350 : sleep * 1000);
			} else {
				if(!disco.paused) disco.pause();
				if(localStorage.themeColor == 'quiet') discoMode('quiet', 5000);
				else if(localStorage.theme == 'white') document.documentElement.classList.add('dark-' + localStorage.themeColor + '-theme');
				else document.documentElement.classList.add('light-' + localStorage.themeColor + '-theme');
			}
		}
	})(),
	background: {
		get: () => {
			return getComputedStyle(document.documentElement).getPropertyValue('--body-fg');
		},
		set: (id) => {
			if(localStorage.theme != id && (id == 'white' || id == 'black')) {
				localStorage.theme = id;
				Theme.update();
			}
		},
		toggle: () => {
			if(localStorage.theme == 'white') localStorage.theme = 'black';
			else localStorage.theme = 'white';
			document.documentElement.classList.toggle('white-mode');
			Theme.update();
		},
	},
	color: {
		get: () => {
			return getComputedStyle(document.documentElement).getPropertyValue('--accent');
		},
		set: (id) => {
			if(localStorage.themeColor != id) {
				localStorage.themeColor = id;
				Theme.update();
			}
		},
	},
	get: (prop) => {
		return getComputedStyle(document.documentElement).getPropertyValue('--' + prop);
	},
};

//default theme
if(localStorage.theme == 'white') document.documentElement.classList.toggle('white-mode');
else if(localStorage.theme != 'black') localStorage.theme = 'black';
if(!localStorage.themeColor) Theme.color.set('lime');
else Theme.update();

//END

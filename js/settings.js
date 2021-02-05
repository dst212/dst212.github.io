// made by dst212, https://github.com/dst212/dst212.github.io/

const Settings = (function() {
	let pop, that, fileLoader, fileReader, customValues;

	function customValuesContent() {
		customValues = '';
		for(let key in Theme.custom.get()) {
			customValues += `<p class="clear">
				<label style="display: block; float: left;"><code>` + key + `</code>:</label>
				<input type="text" value="` + Theme.custom.get()[key] + `" onchange="Theme.custom.set('` + key + `', this.value); Theme.custom.update(); if(localStorage.themeStyle === 'custom') Theme.custom.save();" style="display: block; width: 50%; float: right;">
			</p>`;
		}
		customValues += '<div class="clear margin-bottom"></div>';
		return customValues;
	}

	fileLoader = document.createElement('INPUT');
	fileLoader.type = 'file';
	fileLoader.accept = 'application/json';
	fileReader = new FileReader();

	fileLoader.onchange = function() {
		fileReader.readAsText(this.files[0]);
	}

	fileReader.onload = function() {
		that.load(JSON.parse(this.result));
	};
	fileReader.onerror = function() {
		popup('Settings', 'Couldn\'t load the selected file:<br>' + this.error, [{innerHTML: 'Ok'}]);
	};

	pop = new Popup('Settings', '', [
		{innerHTML: 'Import', keepOpen: true, onclick: () => fileLoader.click()},
		{innerHTML: 'Export', keepOpen: true, onclick: () => that.save()},
		{innerHTML: 'Reset', keepOpen: true, onclick: () => {
			popup('Settings - Reset', `
				Reset the website settings?<br>
				All the preferences will be lost unless they have been exported.
			`, [
				{innerHTML: 'Yes', onclick: () => { localStorage.clear(); window.location.reload(); }},
				{innerHTML: 'NONONO'}
			]);
		}},
		{innerHTML: 'Close'}
	], {draggable: true});

	pop.content.classList.add('sections', 'margin-bottom');
	pop.content.style.height = '100vh';

	pop.onopen = () => {
		document.getElementById('settings-theme-' + (localStorage.themeStyle || 'default') + '-style-radio')?.setAttribute('checked','true');
	}

	fetch('/res/html/settings.html')
	.then(res => res.text())
	.then(data => {
		pop.content.innerHTML = data.replace(/&js:--bg-delta;/g, Theme.background.intensity.get()).replace(/&js:customvalues;/g, customValuesContent());
	});

	return that = {
		save(filename = window.location.hostname + '-settings-' + (new Date()).toISOString().slice(0, 10) + '.json') {
			let a = document.createElement('A');
			a.target = '_self';
			a.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(localStorage));
			a.download = filename;
			a.click();
		},
		load(ls) {
			if(ls) {
				for(let key in ls)
					localStorage.setItem(key, ls[key]);
				popup('Settings', 'Settings imported successfully.<br>Reloading the page is needed in order to apply the changes.<br>Reload now?', [{innerHTML: 'Yes', onclick: () => window.location.reload()}, {innerHTML: 'No'}])
			} else
				popup('Settings', 'Couldn\'t parse the provided file.', [{innerHTML: 'Ok'}]);
		},
		open: () => pop.open(),
		close: () => pop.close(),
		toggle: () => pop.isUp() ? pop.close() : pop.open(),
	};
})();

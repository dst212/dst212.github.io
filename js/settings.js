// made by dst212, https://github.com/dst212/dst212.github.io/

const Settings = (function() {
	let pop, that, fileLoader, fileReader;

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

	pop = new Popup('Settings', `
		<input type="radio" name="settings-sections" id="settings-sections-1" checked>
		<label for="settings-sections-1">Theme</label>
		<section>
			<p>Use the <label for="theme-menu-check" class="fakelink">theme menu</label> to change <strong>accent</strong>.</p>
			<p>
				Background intensity:<br>
				<div class="center-block" style="width: 10rem; max-width: 100%;">
					<div style="float: left;">` + Theme.background.intensity.min() + `</div>
					<div style="float: right;">` + Theme.background.intensity.max() + `</div>
					<input
						class="clear margin-top-bottom" style="width: 100%;"
						type="range"
						value="` + Theme.background.intensity.get() + `"
						min="` + Theme.background.intensity.min() + `"
						max="` + Theme.background.intensity.max() + `"
						onchange="Theme.background.intensity.set(this.value);"
					>
				</div>
			</p>
		</section>
	`, [
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

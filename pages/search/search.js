//made by dst212
'use strict';

(function() {
	let linksList; //list of saved links
	let presets; //some presets (will be fetched if necessary)
	let aliases; //aliases of link titles to call @ThisWay via the search bar

	let input; //form's input-boxes in the link editor
	let links = document.getElementById('search-page-links'); //links container
	let go = document.getElementById('search-page-go'); //the "go" key
	let searchbar = document.getElementById('search-page-bar'); //search bar on top of page

	//return an object (suitable for linksList) from input values
	let objFromInput = () => ({
		title: input[0].value,
		href: input[1].value,
		searchQueryURL: input[2].value,
		class: input[3].value,
		innerHTML: input[4].value,
		target: input[5].checked ? '_blank' : '_self',
	});

	//update the preview icon on the right of the input boxes in the link editor
	function updatePreview() {
		let preview = document.getElementById('search-page-preview');
		let props = objFromInput();

		for(let key in props) {
			if(key === 'class') {
				while(preview.classList.length > 0)
					preview.classList.remove(preview.classList[0]);
				props[key] && preview.classList.add(...props[key].split(' '));
			} else
				preview[key] = props[key];
		}
		preview.href = 'javascript:void(0);';
	}

	//auto-fill the input boxes from another object
	function fillInput(obj, skipTarget = false) {
		if(obj) {
			let i = 0;
			input[i++].value = obj.title || '';
			input[i++].value = obj.href || '';
			input[i++].value = obj.searchQueryURL || '';
			input[i++].value = obj.class || '';
			input[i++].value = obj.innerHTML || '';
			if(!skipTarget) {
				if(obj.target === '_blank')
					input[i++].setAttribute('checked', '');
				else
					input[i++].removeAttribute('checked');
			}
			updatePreview();
		}
	}

	//save links to localStorage
	let saveLinks = () => localStorage.setItem('search-page-links', JSON.stringify(linksList));

	//add a website to the list on the container (but don't save it to linksList)
	function addLink(item, pos = -1) {
		let a = document.createElement('A');
		for(let key in item) {
			if(key === 'class')
				item[key] && a.classList.add(...item[key].split(' '));
			else
				a[key] = item[key];
		}
		if(pos !== -1) //append it in a certain position
			links.insertBefore(a, links.childNodes[pos]);
		else
			links.appendChild(a);
	}

	//remove a website from the list
	function removeLink(pos) {
		links.getElementsByTagName('A')[pos]?.remove();
		linksList.splice(pos, 1);
		saveLinks();
	}

	//change order
	function moveLink(pos, shift) {
		let tmp, a;
		if(pos + shift >= 0 && pos + shift < linksList.length) {
			tmp = linksList[pos];
			linksList.splice(pos, 1);
			linksList.splice(pos + shift, 0, tmp);
			saveLinks();
			a = links.getElementsByTagName('A');
			tmp = a[pos].cloneNode(true);
			a[pos].remove();
			links.insertBefore(tmp, a[pos + shift]);
		}
	}

	//save aliases to localStorage
	let saveAliases = () => localStorage.setItem('search-page-aliases', JSON.stringify(aliases));

	//update title below the navbar
	let updateTitle = () => document.getElementById('title').innerHTML = localStorage.getItem('search-page-title') || 'Search';

	//dialogs
	//open the "add link" dialog
	function linkEditorOpen(i = -1/*future use, index of link to edit*/) {
		if(presets === undefined) { //presets still not fetched
			let loading = new Popup('', 'Downloading presets...');
			loading.open();
			//fetch presets then open the addLink dialog
			fetch('/pages/search/presets.json')
			.then(res => res.json())
			.then(data => {
				presets = data;
				loading.close();
				linkEditor.open();
			});
		} else //open directly the dialog
			linkEditor.open();
	}

	function newBtn(title, classList, innerHTML, onclick, disabled = false) {
		let btn = document.createElement('button');
		btn.title = title;
		classList && btn.classList.add(...classList.split(' '));
		btn.innerHTML = innerHTML;
		disabled && btn.setAttribute('disabled', '');
		btn.onclick = onclick;
		return btn;
	}
	function updateManageLinksContent() {
		let i, div, tmp;
		manageLinksPopup.content.innerHTML = '';
		manageLinksPopup.content.classList.add('search-page-editor');
		for(i = 0; i < linksList.length; i++) {
			let cur = i;
			div = document.createElement('DIV');
			div.innerHTML = '<a class="' + linksList[i].class + '" title="' + linksList[i]?.title + '">' + linksList[i]?.innerHTML + '</a>';
			//"move up/down", "edit" and "remove" buttons
			div.appendChild(newBtn('Move up', 'material-icons', 'expand_less', e => { moveLink(cur, -1); updateManageLinksContent(); }, i === 0));
			div.appendChild(newBtn('Move down', 'material-icons', 'expand_more', e => { moveLink(cur, 1); updateManageLinksContent(); }, i === linksList.length - 1));
			div.appendChild(newBtn('Edit', 'material-icons', 'edit', e => { fillInput(linksList[cur]); linkEditorOpen(cur); }));
			div.appendChild(newBtn('Remove', 'material-icons red btn', 'close', e => { removeLink(cur); updateManageLinksContent();}));
			//calling updateManageLinksContent() each time is an ugly solution, but it works, for now
			manageLinksPopup.content.appendChild(div);
		}
		manageLinksPopup.content.appendChild(newBtn('New link', 'material-icons', 'add', e => linkEditorOpen()));
		manageLinksPopup.content.appendChild(newBtn('Refresh', 'material-icons', 'refresh', e => updateManageLinksContent()));
	}

	function newAliasDiv(key) {
		let div = document.createElement('DIV'),
		alias = document.createElement('INPUT'),
		trigger = document.createElement('INPUT'),
		span = document.createElement('SPAN');

		alias.type = 'text';
		alias.style.width = '12ch';
		alias.value = key || '';
		alias.onkeydown = e => delete aliases[e.target.value];
		alias.onkeyup = e => e.target.value && (aliases[e.target.value] = trigger.value);

		span.innerHTML = ' → ';

		trigger.type = 'text';
		trigger.style.width = '12ch';
		trigger.value = aliases[key] || '';
		trigger.onkeyup = e => aliases[alias.value] = e.target.value;

		div.appendChild(alias);
		div.appendChild(span);
		div.appendChild(trigger);

		return div;
	}

	function updateAliasesEditorContent() {
		aliasesEditor.content.innerHTML = '<span>Trigger aliases with <code>@</code> or <code>!</code>.<br> E.g.: <code>!g how to use google</code>.</span>';
		aliasesEditor.content.style.marginBottom = '0.8rem';
		aliasesEditor.content.style.textAlign = 'center';
		for(let key in aliases)
			aliasesEditor.content.appendChild(newAliasDiv(key));
	}

	//the main settings dialog
	let settingsPopup = new Popup('Search page - Settings', '', [
		{innerHTML: 'Links', onclick: function() {
			updateManageLinksContent();
			manageLinksPopup.open();
		}},
		{innerHTML: 'Aliases', onclick: function() {
			updateAliasesEditorContent();
			aliasesEditor.open();
		}},
		{innerHTML: 'Title', onclick: function() { //change page title (below navbar)
			titlePopup.content.innerHTML = `
			<input type="text" value="` + document.getElementById('title').innerHTML + `" onkeyup="localStorage.setItem('search-page-title', this.value)">
			`;
			titlePopup.open();
		}},
		{innerHTML: 'Close'}
	], {draggable: true});

	//title editor popup
	let titlePopup = new Popup('Change title', '', [{innerHTML: 'Ok', onclick: () => updateTitle()}, {innerHTML: 'Cancel', onclick: e => { localStorage.setItem('search-page-title', document.getElementById('title').innerHTML); }}], {draggable: true});

	//link manager dialog
	let manageLinksPopup = new Popup('', '', [{innerHTML: 'Close'}], {draggable: true});

	//aliases manager dialog
	let aliasesEditor = new Popup('Aliases', '', [
		{innerHTML: 'New', onclick: () => aliasesEditor.content.appendChild(newAliasDiv('')), keepOpen: true},
		{innerHTML: 'Save', onclick: () => saveAliases()},
		{innerHTML: 'Cancel', onclick: () => aliases = JSON.parse(localStorage.getItem('search-page-aliases'))}
	], {draggable: true});

	//link editor dialog
	let linkEditor = new Popup('', '', [{innerHTML: 'Save', onclick: function() {
		linksList.push(objFromInput());
		if(manageLinksPopup.isUp())
			updateManageLinksContent();
		saveLinks();
		addLink(linksList[linksList.length - 1], links.childNodes.length - 1);
	}}, {innerHTML: 'Cancel'}], {draggable: true});

	linkEditor.content.innerHTML = `
		<div style="display: inline-block; width: calc(100% - 7rem)">
			<label>Title:</label><br>
			<input type="text" style="width: 100%; margin-bottom: 0.5rem;" name="title" placeholder="Google"><br>
			<label>URL:</label><br>
			<input type="text" style="width: 100%; margin-bottom: 0.5rem;" name="href" placeholder="https://google.com"><br>
			<label>Search query URL:</label><br>
			<input type="text" style="width: 100%; margin-bottom: 0.5rem;" name="href" placeholder="https://google.com/search?q="><br>
			<label>CSS classes:</label><br>
			<input type="text" style="width: 100%; margin-bottom: 0.5rem;" name="class" placeholder="fab fa-google"><br>
			<label>Inner text:</label><br>
			<input type="text" style="width: 100%; margin-bottom: 0.5rem;" name="innerHTML" placeholder=""><br>
			<div class="checkbox">
				<label>
					<input type="checkbox" name="target" checked><span></span>
					Open in a new window
				</label>
			</div>
		</div>
		<div class="search-page-links" style="position: absolute; display: inline-block; width: 7rem;">
			<span>Preview:</span><br>
			<a id="search-page-preview" href="javascript:void(0);"></a>
		</div>
		<div>
			Visit <a href="https://fontawesome.com/icons?d=gallery&m=free" target="_blank" title="Font Awesome">Font Awesome</a> or <a href="https://material.io/resources/icons/" target="_blank" title="Material Design icons">material.io</a> to find icons. Hover
			<span class="tooltip">
				<a href="javascript:void(0);" class="item" title="Examples of icons">here</a>
				<div class="content">
					<strong>Telegram's icon</strong><br>
					- CSS classes: <code>fab fa-telegram</code><br>
					<br>
					<strong>Settings' icon, (the gear):</strong><br>
					- CSS classes: <code>material-icons</code><br>
					- Inner text: <code>settings</code><br>
				</div>
			</span> to see some examples.
			Use custom classes and the inner text to set an icon. Here are some examples:<br>
			<br>
		</div>
	`;

	input = linkEditor.content.getElementsByTagName('INPUT');
	input[0].onkeyup = e => {
		let key = e.target.value.toLowerCase();
		fillInput(presets?.[key], true);
	}
	for(let i = 0; i < input.length; i++)
		input[i].onchange = e => updatePreview();

	//events
	function search() {
		let queryURL, query, winref, target = '_self';

		searchbar.value = searchbar.value.trim();
		if(searchbar.value[0] === '/')
			searchbar.value = 'https:/' + searchbar.value;

		if(
			searchbar.value.search('https://') === 0 ||
			searchbar.value.search('http://') === 0
		) {
			winref = window.open(searchbar.value, target);
		} else {
			//call a query URL by the @title of the website
			if(searchbar.value[0] === '@' || searchbar.value[0] === '!') {
				let title, index = searchbar.value.search(' ');
				if(index === -1)
					index = searchbar.value.length;

				//the title following @
				title = searchbar.value.slice(1, index).toLowerCase();
				//if the title is an alias use the trigger
				if(aliases[title])
					title = aliases[title];
				// the rest of the string
				query = searchbar.value.slice(index + 1);

				for(let i = 0; !queryURL && i < linksList.length; i++) {
					//search for valid websites by title and get the query URL
					if(linksList[i].title.toLowerCase() === title && (queryURL = linksList[i].searchQueryURL))
						target = linksList[i].target || target;
				}
			} else {
				//use the first link's search query URL
				query = searchbar.value;
				if(queryURL = linksList[0].searchQueryURL)
					target = linksList[0].target || target;
			}

			//if the query URL found was valid then use it, else use Google and the whole input string (searchbar.value)
			winref = window.open((queryURL || 'https://google.com/search?q=') + encodeURIComponent(queryURL ? query : searchbar.value), target);
		}
		if(!winref) {
			popup('Pop-up displaying not allowed', `
				To open links in a new tab, pop-up displaying permission is necessary.<br>
				Please, allow <em>` + window.location.origin + `</em> to display popups through the browser settings.<br>
				Altenratively, edit the target of the links to the same page in
				<i class="material-icons md-same">settings</i>Settings → Links → <i class="material-icons md-same">edit</i>Edit
				and uncheck <code>Open in a new window</code>.
			`, [{innerHTML: 'Ok'}]);
		}
	}

	go.onmousedown = e => e.button === 0 && search();

	searchbar.onkeyup = function(e) {
		if(e.code === 'Enter')
			search();
		else if(e.code === 'Escape')
			e.target.blur();
	}

	//load settings

	//set default links
	if(!localStorage.getItem('search-page-links')) {
		localStorage.setItem('search-page-links', JSON.stringify([
			{title: 'Google', href: 'https://google.com', searchQueryURL: 'https://google.com/search?q=', target: '_blank', class: 'fab fa-google', innerHTML: ''},
			{title: 'GitHub', href: 'https://github.com', searchQueryURL: 'https://github.com/search?q=', target: '_blank', class: 'fab fa-github', innerHTML: ''},
			{title: 'Spotify', href: 'https://open.spotify.com', searchQueryURL: 'https://open.spotify.com/search/', target: '_blank', class: 'fab fa-spotify', innerHTML: ''},
		]));
	}
	//loads saved links
	linksList = JSON.parse(localStorage.getItem('search-page-links'));
	linksList.forEach(item => addLink(item));
	//always add the settings' icon at the end of the list
	addLink({title: 'Settings', href: 'javascript:void(0)', onclick: settingsPopup.open, class: 'material-icons', innerHTML: 'settings'});

	//set default aliases
	if(!localStorage.getItem('search-page-aliases')) {
		localStorage.setItem('search-page-aliases', JSON.stringify({
			'g': 'google',
			'go': 'google',
			'gh': 'github',
			'sp': 'spotify',
		}));
	}
	//load saved aliases
	aliases = JSON.parse(localStorage.getItem('search-page-aliases'))

	updateTitle();

	//directly put focus on search bar if typing nowhere
	(function() {
		let onkeydown = document.body.onkeydown;

		document.body.onkeydown = e => {
			if(
				document.activeElement !== searchbar &&
				document.activeElement.nodeName !== 'INPUT' &&
				document.activeElement.nodeName !== 'TEXTAREA'
			)
				searchbar.focus();
			if(e.ctrlKey && e.shiftKey && e.code === 'KeyL') {
				//I'm feeling lucky
				let butt = document.getElementById('search-page-lucky');

				if(!butt) {
					let l = links.getElementsByTagName('A');
					function cycleLinks(steps, delay, i = 0) {
						if(typeof delay === 'undefined')
							delay = 10;
						if(typeof steps === 'undefined')
							steps = 50 - delay + Math.floor(Math.random() * (l.length - 1));
						l[i % (l.length - 1)].focus();
						if(steps > 0)
							setTimeout(cycleLinks, delay * 10, steps - 1, delay + (steps > 25 ? 0 : steps > 20 ? 1 : steps > 10 ? 2 : 3), i + 1);
						else setTimeout(() => {
							i %= (l.length - 1);
							if(!linksList[i].searchQueryURL)
								window.open(linksList[i].href, '_self');
							else {
								searchbar.value = '@' + linksList[i].title.toLowerCase() + ' ' + searchbar.value;
								search();
							}
						}, delay * 10);
					}

					butt = document.createElement('BUTTON');
					butt.id = 'search-page-lucky';
					butt.style.display = 'block';
					butt.style.margin = '1rem auto';
					butt.innerHTML = 'I\'m feeling lucky';
					butt.onclick = e => cycleLinks();
					document.getElementById('search-page-container').insertBefore(butt, links);
				}
				return false;
			}
		}

		//restore the default document.body.onkeydown function on unload
		if(typeof Page !== 'undefined')
			Page.unload = () => document.body.onkeydown = onkeydown;
	})();
})();

// made by dst212
// https://github.com/dst212/dst212.github.io/

'use strict';

var okokItIsFine = () => localStorage.okokItIsFine = 1;

var discoModeIncoming = () => ntf(
	'WARNING',
	'By enabling the Disco Mode, one declares to take full resposibility for the consequences that may derive from it.',
	[{innerHTML: 'Enable Anyway', onclick: 'Theme.color.set(\'disco\');', properties: 'class="normal btn"'}, /*{innerHTML: 'More details', onclick: 'pageFetch(\'settings/theme\');', properties: 'class="normal btn"'},*/ {innerHTML: 'Cancel', properties: 'class="normal btn"'}],
	'black', 'red'
);

window.onload = addFunction(window.onload, function() {
	initNotifications();
	if(localStorage.okokItIsFine != 1){
		ntf(
			'Welcome',
			'Welcome to dst212\'s website.<br>Use the navigation bar on top of the screen to access the various pages.<br>This website is hosted at <a href="https://github.io" target="_blank" title="GitHub Pages">GitHub Pages</a>. By visiting this website, visitors allow GitHub to collect data from them as mentioned <a href="https://docs.github.com/en/github/site-policy/github-privacy-statement#github-pages" target="_blank">here</a>.<br>By using this website, users agree to save data locally (on their devices) in order to remember the website\'s settings (such as the theme) and other stuff (such as the game data) and blah blah blah this is not a cookie notice blah blah blah nobody cares about this blah blah blah also check my GitHub profile, thanks blah blah blah if someone arrived here the website\'s author apologizes but he congratules on the patience.',
			[{innerHTML: 'Yes, yes, I don\'t care', onclick: 'okokItIsFine();'}]
		);
	}
});

//END

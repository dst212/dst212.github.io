// made by dst212
// https://github.com/dst212/dst212.github.io/

function acceptCookie() {
	localStorage.cookie4 = 214;
}
function discoModeIncoming() {
	ntf(
		'WARNING',
		'By enabling the Disco Mode, one declares to take full resposability for the consequences that may derive from it.',
		[{innerHTML: 'Enable Anyway', onclick: 'setTheme(\'disco\');', properties: 'class="normalButton"'}, {innerHTML: 'More details', onclick: 'pageFetch(\'settings/theme\');', properties: 'class="normalButton"'}, {innerHTML: 'Cancel', properties: 'class="normalButton"'}],
		//'<button class="normalButton" onclick="closeNtf(\'disco-mode-incoming\');setTheme(\'disco\');">Enable anyway</button> <button class="normalButton" onclick="pageFetch(\'settings/theme\');">More details</button> <button class="normalButton" onclick="closeNtf(\'disco-mode-incoming\');">Cancel</button>',
		'black', 'red'
	);
}

window.onload = addFunction(window.onload, function() {
	initNotifications();
	if(localStorage.cookie4 != 214){
		ntf(
			'Cookies',
			'By visiting this website, the use of the mystic and notorious <b>cookies</b> is agreed, <a href="https://creativecommons.org/creative-commons-cookies-notice/" target="_blank">from the gospel of terms and conditions under the Creative Commons license</a>.<br/>Keep calm: they don\'t bite, but they can hurt other ways.<br/>ACTUALLY no info of users are picked, the websites just stores on the visitors\' devices some data about theme and settings, nothing about ads, ID tracking or third party\'s services.',
			[{innerHTML: 'Agree', onclick: 'acceptCookie();'}]//'<button onclick="acceptCookie();">Agree</button>',
		);
	}
});

//END

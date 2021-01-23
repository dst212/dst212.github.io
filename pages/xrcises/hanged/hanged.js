var checkWord = (function(char = '') {
	let words = ['HELLO', 'WORLD', 'VANJA', 'T-SHIRT', 'UNPREDICTABLE', 'AMAZING', 'DISA', 'BISCARO', 'PULL DOWN', 'BLACKBOARD', 'EXPECTED', 'ALKSDLSKD', 'FISHING', 'RED PILL', 'CLOUD', 'BASKETBALL', 'NOTHING', 'WORD'];
	let i, errors, toGuess, outGuess, wrongAttempt;
	return function(char) {
		let i, button;
		if(!char) { //init
			toGuess = words[Math.floor(Math.random() * words.length)];
			outGuess='';
			for(i = 0; i < toGuess.length; i++)
				if('A'.charCodeAt() <= toGuess.charCodeAt(i) && toGuess.charCodeAt(i) <= 'Z'.charCodeAt())
					outGuess += "_";
				else
					outGuess += toGuess[i];
			errors = 0;
		} else { //check
			button = document.getElementById(char);
			wrongAttempt = true;
			for(i = 0; i < toGuess.length; i++)
				if(toGuess[i] == char)
					outGuess = outGuess.slice(0, i) + char + outGuess.slice(i + 1), wrongAttempt = false;
			if(wrongAttempt)
				errors++;
			if(button) {
				button.setAttribute('disabled', '');
				document.activeElement.blur();
			}
			document.getElementById('output').value = outGuess;
			document.getElementById('errors').innerHTML = errors;
			if(errors >= 5) {
				(new Popup('Game over!', 'The word was ' + toGuess + '.<br><br>A new word to guess will be given.', [{innerHTML: 'OK'}], {coverBelow: true})).open();
				initHanged();
			} else if(outGuess == toGuess) {
				(new Popup('You won!', 'You found the word: ' + toGuess + '!<br><br>A new word to guess will be given.', [{innerHTML: 'OK'}], {coverBelow: true})).open();
				initHanged();
			}
		}
		return outGuess;
	}
})();
function initButtons() {
	let i, buttons = document.getElementById('init-buttons');
	buttons.innerHTML = '';
	for(i = 'A'.charCodeAt(); i <= 'Z'.charCodeAt(); i++) {
		buttons.innerHTML += '<input type="button" id="' + String.fromCharCode(i) + '" value="' + String.fromCharCode(i) + '" onclick="checkWord(this.id)">';
	}
}
function initHanged() {
	document.getElementById('output').value = checkWord();
	document.getElementById('errors').innerHTML = 0;
	initButtons();
}
initHanged();

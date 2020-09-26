// made by dst212
// https://github.com/dst212/dst212.github.io

function playAudio(au) {
	var music = document.getElementById(au);
	music.play();
	console.log('Now playing ' + au + '.');
}
function pauseAudio(au) {
	document.getElementById(au).pause();
	console.log('Stopped ' + au + '.');
}
function showPlayer() {
	document.getElementById('music-player').display = 'block';
}
function hidePlayer() {
	document.getElementById("music-player").display = 'none';
}

//END

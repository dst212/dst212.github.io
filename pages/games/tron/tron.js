//js
'use strict';

var TronPlayer = function(canvas, x, y, color) {
	this.canvas = canvas || document.getElementsByTagName('CANVAS')[0];
	this.ctx = this.canvas.getContext('2d');
	this.color = color;
	//head's coordinates
	this.init = function() {
		this.x = x || Math.floor((this.canvas.width * 0.8) * Math.random());
		this.y = y || Math.floor((this.canvas.height * 0.8) * Math.random());
		//↑ = 0, → = 1, ↓ = 2, ← = 3
		/* quadrants:
			1	2
			4	3
		*/
		// this.dir = this.x < this.canvas.width / 2 ? 1 : 3;
		//the direction is
		if(this.x < this.canvas.width / 2 && this.y < this.canvas.height / 2) {
			//first quadrant
			this.dir = this.x < this.y ? 1 : 2;
		} else if(this.x >= this.canvas.width / 2 && this.y < this.canvas.height / 2) {
			//second quadrant
			this.dir = this.canvas.width - this.x < this.y ? 3 : 2;
		} else if(this.x >= this.canvas.width / 2 && this.y >= this.canvas.height / 2) {
			//third quadrant
			this.dir = this.canvas.width - this.x < this.canvas.height - this.y ? 3 : 0;
		} else {
			//fourth quadrant
			this.dir = this.x < this.canvas.height - this.y ? 1 : 0;
		}
		this.queueDir = this.dir;
		this.prevx = this.x;
		this.prevy = this.y;
		this.died = false; //has crashed somewhere
	};

	this.setDir = function(where) {
		if(this.dir !== where && this.dir + 2 !== where && this.dir - 2 !== where && 0 <= where && where < 4) {
			this.queueDir = where;
			beep(350 + 25 * where, 100);
		}
	};

	this.move = function() {
		this.prevx = this.x;
		this.prevy = this.y;
		this.dir = this.queueDir;
		switch(this.dir) {
			case 0:
				this.y--;
				break;
			case 1:
				this.x++;
				break;
			case 2:
				this.y++;
				break;
			case 3:
				this.x--;
				break;
			default:
				break;
		};
	};

	this.collide = function() {
		return this.x < 0 || this.y < 0 || this.x >= this.canvas.width || this.y >= this.canvas.height || this.ctx.getImageData(this.x, this.y, 1, 1).data[3] > 0;
	};

	this.print = function(color, head) {
		this.ctx.beginPath();
		this.ctx.fillStyle = color || this.color || Theme.get('accent');
		this.ctx.rect(this.prevx, this.prevy, 1, 1);
		this.ctx.fill();
		this.ctx.closePath();

		this.ctx.beginPath();
		this.ctx.fillStyle = head || (Theme && Theme.get('body-fg')) || 'white';
		this.ctx.rect(this.x, this.y, 1, 1);
		this.ctx.fill();
		this.ctx.closePath();
	};

	this.score = 0;
	this.init();
}

var Tron = {
	initVal() {
		this.delay = 50;
		this.state = 0; //game is running (0: no, 1: yes, 2: paused, -1: countdown or game over screen)
		this.button = document.getElementById('tron-start-button');
	},
	init(body = document.body) {
		let that = this;

		Page.unload = (function() {
			//restore onkeydown and onkeyup functions when page is changed
			//see https://dst212.github.io/js/page.js
			let onkeydown = document.onkeydown;
			return function() {
				document.onkeydown = onkeydown;
			};
		})();

		this.title = document.getElementById('title') || document.getElementsByTagName('H1')[0];
		this.gameOverAudio = new Audio('/res/audios/explosion.mp3');
		this.canvas && this.canvas.remove();
		this.canvas = document.createElement('CANVAS');
		this.canvas.width = 160;
		this.canvas.height = 90;
		this.canvas.style = 'image-rendering: crisp-edges; image-rendering: pixelated; max-width: 100%; display: block; margin: auto; border: var(--general-border) solid var(--accent); width: 100vh;';
		this.ctx = this.canvas.getContext('2d');

		document.onkeydown = function(e) {
			if(that.state === 0) switch (e.code) {
				case 'Enter': case 'Space':
					that.start();
					break;
				default:
					break;
			} else if(that.state === 1) switch(e.code) {
				case 'KeyW':
					that.player1.setDir(0);
					break;
				case 'KeyA':
					that.player1.setDir(3);
					break;
				case 'KeyS':
					that.player1.setDir(2);
					break;
				case 'KeyD':
					that.player1.setDir(1);
					break;
				case 'ArrowUp':
					that.player2.setDir(0);
					break;
				case 'ArrowLeft':
					that.player2.setDir(3);
					break;
				case 'ArrowDown':
					that.player2.setDir(2);
					break;
				case 'ArrowRight':
					that.player2.setDir(1);
					break;
				case 'Enter': case 'Space':
					that.state = 2;
					break;
				default:
					break;
			} else if(that.state === 2) switch(e.code) {
				case 'Enter': case 'Space':
					that.state = 1;
					that.refresh();
					break;
				default:
					break;
			}
			if(document.activeElement.nodeName !== 'INPUT' && (37 <= e.keyCode && e.keyCode <= 40 || e.keyCode === 32))
				return false;
		};

		this.player1 = new TronPlayer(this.canvas, this.canvas.width / 4, this.canvas.height / 2, 'rgb(255, 0, 255)');
		this.player2 = new TronPlayer(this.canvas, this.canvas.width / 4 * 3, this.canvas.height / 2, 'rgb(0, 255, 255)');
		this.initVal();
		this.refreshScore();

		body.insertBefore(this.canvas, body.childNodes[0]);
	},

	div() {
		let div = document.createElement('DIV'), main = document.body.getElementsByTagName('MAIN')[0];
		div.setAttribute('id', 'tron-game');
		div.style.textAlign = 'center';
		div.innerHTML = '<br><input id="tron-start-button" type="button" onclick="Tron.start();" value="Start">';
		main.insertBefore(div, main.childNodes[0]);
		return div;
	},

	},

	clear() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},

	countdown(i = 3, x = undefined, y = undefined) {
		this.state = -1;
		this.clear();
		this.player1.print();
		this.player2.print();
		beep(i ? 650 : 1300, i ? 100 : 500);
		if(i <= 0) i = 'GO!';
		// this.printText(i.toString(), undefined, undefined, x, y);
		this.title.innerHTML = i;
		if(i !== 'GO!') //continue counting
			setTimeout(this.countdown.bind(this), 1000, i - 1, x, y);
		else { //start the game
			setTimeout(function() {
				this.state = 1;
				this.clear();
				this.refreshScore();
				this.refresh();
			}.bind(this), 1000);
		}
	},

	refresh() {
		this.player1.move();
		this.player2.move();

		if(this.player1.x === this.player2.x && this.player1.y === this.player2.y) {
			this.player1.died = this.player2.died = true;
			this.player1.print('', 'red');
			this.player2.print('', 'red');
		} else {
			if(this.player1.collide()) {
				this.player1.died = true;
				this.player1.print('red', 'transparent');
			} else
				this.player1.print();

			if(this.player2.collide()) {
				this.player2.died = true;
				this.player2.print('red', 'transparent');
			} else
				this.player2.print();
		}

		if(!this.player1.died && !this.player2.died) {
			if(this.state === 1)
				setTimeout(this.refresh.bind(this), this.delay);
		} else {
			this.gameOver();
		}
	},

	start() {
		if(this.button) { //disable button
			this.button.setAttribute('disabled', 'true');
			this.button.blur();
		}
		this.reset();
		this.countdown();
	},

	gameOver() {
		this.state = 0;
		this.gameOverAudio.play();
		//check who's the winner
		if(this.player1.died && !this.player2.died)
			this.player2.score++;
		if(this.player2.died && !this.player1.died)
			this.player1.score++;

		this.refreshScore();

		if(this.button) {
			this.button.removeAttribute('disabled');
			this.button.setAttribute('value', 'Restart');
		}
	},

	reset() {
		this.initVal();
		this.player1.init();
		this.player2.init();
	},
}

Tron.init(Tron.div());
//END

// made by dst212

/*
 * Pong-like game.
 *
 * Visit https://github.com/dst212/dst212.github.io/ to get more details.
 */

'use strict';

function PongBall(canvas, x = undefined, y = undefined, speedx = undefined, speedy = undefined, ray = 20, color = undefined) {
	this.init = function() {
		let maxRandomDelta = 3;
		let randomDelta = Math.random() * maxRandomDelta;
		this.freq = 350;
		this.beeptime = 50;
		this.ctx = canvas.getContext('2d');
		this.x = x || canvas.width / 2;
		this.y = y || canvas.height / 2;
		this.baseSpeed = 9;
		this.maxSpeedDelta = 14;
		this.dx = speedx || (randomDelta + this.baseSpeed) * ((Math.random() < 0.5) ? -1 : 1); //delta x (x's speed)
		this.dy = speedy || -(maxRandomDelta - randomDelta + this.baseSpeed); //delta y (y's speed)
		//speed is Math.sqrt(Math.pow(Pong.ball.dy, 2) + Math.pow(Pong.ball.dx, 2)) if anyone wanted to know
		this.maxDx = Math.abs(this.dx) + this.maxSpeedDelta;
		this.maxDy = Math.abs(this.dy) + this.maxSpeedDelta;
		this.ray = ray;
	};

	this.cornerCollision = function(rect) {
		if( //collision with the rect's corner
			(this.x + this.dx < rect.minX() && this.dx > 0) || // left top corner
			(rect.maxX() < this.x + this.dx && this.dx < 0) //right top corner
		) {
			this.dx *= -1; //bounce
		}
	};

	this.collide = function(rect) {
		let collision = false;
		if(
			(
				rect.minY() < this.y + this.dy + this.ray &&
				this.y + this.dy - this.ray < rect.maxY()
			) && (
				rect.minX() < this.x + this.dx + this.ray &&
				this.x + this.dx - this.ray < rect.maxX()
			)
		) {
			if(this.y + this.ray < rect.minY()) //the ball bounces on the rect's horizontal sides
				this.dy *= -1; //bounce
			beep(this.freq + 150, this.beeptime);
			collision = true;
			this.cornerCollision(rect);
		}
		return collision;
	};

	this.move = function(side = undefined) {
		let ret = false;
		if(0 < this.x + this.dx - this.ray && this.x + this.dx + this.ray < canvas.width)
			this.x += this.dx;
		else {
			if(side !== undefined) if((side === 3 && this.x + this.dx - this.ray <= 0) || (side === 1 && canvas.width <= this.x + this.dx + this.ray))
				ret = true;
			this.dx *= -1;
			if(!ret) beep(this.freq, this.beeptime);
		}
		if(0 < this.y + this.dy - this.ray && this.y + this.dy + this.ray < canvas.height)
			this.y += this.dy;
		else {
			if(side !== undefined) if((side === 0 && this.y + this.dy - this.ray <= 0) || (side === 2 && canvas.height <= this.y + this.dy + this.ray))
				ret = true;
			this.dy *= -1;
			if(!ret) beep(this.freq, this.beeptime);
		}
		if(ret)	{
			beep(this.freq - 150, this.beeptime);
			beep(this.freq - 150, this.beeptime);
		}
		return ret;
	};

	this.print = function() {
		this.ctx.beginPath();
		this.ctx.arc(this.x, this.y, this.ray, 0, 2 * Math.PI);
		this.ctx.fillStyle = color || Theme.get('accent');
		this.ctx.fill();
	};

	this.init();
}

function PongPlayer(canvas, y = undefined, color = undefined, accent = undefined) {
	this.init = function() {
		this.ctx = canvas.getContext('2d');
		this.width = 150;
		this.height = 30;
		this.x = canvas.width / 2;
		this.y = y || canvas.height - (this.height * 2);
		this.minX = () => this.x - (this.width / 2);
		this.minY = () => this.y - (this.height / 2);
		this.maxX = () => this.x + (this.width / 2);
		this.maxY = () => this.y + (this.height / 2);
		this.speed = 9;
		this.disaIndex = 0;
		this.disa = ['KeyD', 'KeyI', 'KeyS', 'KeyA'];
		this.image = document.createElement('IMG');
		this.image.src = '/res/images/stickman.svg';
		this.image.height = 92;
		this.image.width = 30;
		this.left = true;
	};

	this.move = function(by) {
		if(0 <= this.x - (this.width / 2) + by && this.x + (this.width / 2) + by < canvas.width)
			this.x += by;
	};

	this.print = function(newAccent = undefined) {
		if(this.disaIndex < this.disa.length) {
			this.ctx.beginPath();
			this.ctx.rect(this.x - (this.width / 2), this.y - (this.height / 2), this.width, this.height);
			this.ctx.fillStyle = color || Theme.background.get();
			this.ctx.fill();
			this.ctx.beginPath();
			this.ctx.rect(this.x - (this.width / 6), this.y - (this.height / 4), this.width / 3, this.height / 2);
			this.ctx.fillStyle = newAccent || accent || Theme.get('accent-dark');
			this.ctx.fill();
		} else {
			this.ctx.save();
			if(this.left) {
				this.ctx.translate(0, canvas.height);
				this.ctx.rotate(-0.5 * Math.PI);
				this.ctx.drawImage(this.image, (canvas.height - this.y) - (this.image.width / 2), this.x - (this.image.height / 2));
			} else {
				this.ctx.translate(canvas.width, 0);
				this.ctx.rotate(0.5 * Math.PI);
				this.ctx.drawImage(this.image, this.y - (this.image.width / 2), (canvas.width - this.x) - (this.image.height / 2));
			}
			this.ctx.restore();
		}
	};

	this.init();
}

var Pong = {
	initVal: function() {
		this.score = 0,			//unused, for now
		this.delay = 1000 / 60,	//delay between a frame and the following one
		this.state = 0,			//game is running (0: no, 1: yes, 2: paused, -1: countdown or game over screen)
		this.move = 0;			//move the ball (-1, 0, 1)
		this.button = document.getElementById('pong-start-button');
	},

	init(body = document.body) {
		let that = this;

		Page && (Page.unload = (function() {
			//restore onkeydown and onkeyup functions when page is changed
			//see https://dst212.github.io/js/page.js
			let onkeydown = document.onkeydown;
			let onkeyup = document.onkeyup;
			return function() {
				document.onkeydown = onkeydown;
				document.onkeyup = onkeyup;
			};
		})());

		this.initVal();
		this.canvas = document.createElement('CANVAS'),
		this.canvas.width = 1000;
		this.canvas.height = 750;
		this.canvas.style = 'max-height: 75vh; max-width: 100%; display: block; margin: auto; border: var(--general-border) solid var(--accent)';
		this.ctx = this.canvas.getContext('2d');
		this.player = new PongPlayer(this.canvas);
		this.ball = new PongBall(this.canvas);

		document.onkeydown = function(e) {
			if(that.state === 0){
				if(e.keyCode === 13)
					that.start();
				else if(that.player.disaIndex < that.player.disa.length && e.code === that.player.disa[that.player.disaIndex])
					that.player.disaIndex++;
				else if(that.player.disaIndex < that.player.disa.length)
					that.player.disaIndex = 0;
			} else if(that.state === 1) { //running
				if(e.keyCode === 37 || e.code === 'KeyA') //left
					that.move = -1, that.player.left = true;
				else if(e.keyCode === 39 || e.code === 'KeyD') //right
					that.move = 1, that.player.left = false;
				else if(e.keyCode === 13 || e.code === 'KeyP')
					that.pause();
			} else if(that.state === 2) {
				if(e.keyCode === 13 || e.code === 'KeyP')
					that.resume();
			}
			if(e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 39 || e.keyCode === 40)
				return false;
		};

		document.onkeyup = function(e) {
			if(that.state === 1)
				that.move = 0; //stop moving the player on key release
		};

		body.insertBefore(this.canvas, body.childNodes[0]);
		this.printText('Press ENTER to play', undefined, 20);
	},

	div() {
		let div = document.createElement('DIV');
		div.setAttribute('id', 'pong-game');
		div.style.textAlign = 'center';
		div.innerHTML = '<br><input id="pong-start-button" type="button" onclick="Pong.start();" value="Start">';
		document.body.getElementsByTagName('MAIN')[0].append(div);
		return div;
	},

	printText(what, color = undefined, fontSize = undefined, x = undefined, y = undefined, fontFamily = 'monospace') {
		fontSize || (fontSize = parseInt(getComputedStyle(document.body).getPropertyValue('font-size')) * 10 / 3);
		this.ctx.font = fontSize + 'px ' + fontFamily;
		this.ctx.fillStyle = color || Theme.get('accent');
		this.ctx.fillText(what, x - (this.ctx.measureText(what).width / 2) || (this.canvas.width - this.ctx.measureText(what).width) / 2, y + (fontSize / 2) || (this.canvas.height + fontSize) / 2);
	},

	slide(delta) {
		//move the player
		this.player.move(delta * this.player.speed);
	},

	clear() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},

	refresh() {
		//update canvas elements
		this.clear();
		if(this.move)
			this.slide(this.move);
		if(this.ball.collide(this.player)) {
			if(Math.abs(this.ball.dx) < this.ball.maxDx) {
				this.ball.dx += this.ball.dx < 0 ? -0.75 : 0.75;
				this.player.speed += 0.5;
			}
			if(Math.abs(this.ball.dy) < this.ball.maxDy) this.ball.dy += this.ball.dy < 0 ? -0.75 : 0.75;
			this.player.print(Theme.get('accent'));
		} else {
			this.player.print();
		}
		if(this.ball.move(2)) //bounced on the bottom side
			this.gameOver();
		this.ball.print();
	},

	cycle() {
		this.refresh();
		if(this.state === 1)
			setTimeout(this.cycle.bind(this), this.delay);
	},

	countdown(i = 3, x = undefined, y = undefined) {
		this.state = -1;
		this.clear();
		this.player.print();
		if(i <= 0) i = 'GO';
		this.printText(i.toString(), undefined, undefined, x, y);
		if(i != 'GO') //continue counting
			setTimeout(this.countdown.bind(this), 1000, i - 1, x, y);
		else { //start the game
			setTimeout(function() {
				this.state = 1;
				this.cycle();
			}.bind(this), 1000);
		}
	},

	start() {
		this.score = 0;
		if(this.button) { //disable button
			this.button.setAttribute('disabled', 'true');
			this.button.blur();
		}
		this.countdown();
	},

	gameOver() {
		this.state = -1;
		this.clear();
		//change player's color on game over
		this.player.print(Theme.get('invalid'));
		this.printText('GAME OVER', Theme.get('invalid'));
		setTimeout(function() {
			this.clear();
			this.printText('Press ENTER to play again', undefined, 20);
			this.reset();
			if(this.button) {
				this.button.removeAttribute('disabled');
				this.button.setAttribute('value', 'Restart');
			}
		}.bind(this), 1500);
	},

	pause() {
		if(this.state === 1) {
			this.state = 2;
			setTimeout(function() {
				this.clear();
				this.player.print();
				this.printText('P', undefined, undefined, this.ball.x, this.ball.y);
			}.bind(this), this.delay);
		}
	},

	resume() {
		if(this.state === 2)
			this.countdown(3, this.ball.x, this.ball.y);
	},

	reset() {
		this.initVal();
		this.player.init();
		this.ball.init();
	},
}

Pong.init(Pong.div());

//END

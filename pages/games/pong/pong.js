// made by dst212

/*
 * Pong-like game.
 *
 * Visit https://github.com/dst212/dst212.github.io/ to get more details.
 */

function PongBall(canvas, x = undefined, y = undefined, speedx = undefined, speedy = undefined, ray = 20, color = undefined) {
	this.init = function() {
		this.ctx = canvas.getContext('2d');
		if(x == undefined)
			this.x = canvas.width / 2;
		else
			this.x = x;
		if(y == undefined)
			this.y = canvas.height / 2;
		else
			this.y = y;
		this.baseSpeed = 9;
		this.maxSpeedDelta = 13;
		this.dx = speedx ? speedx : (Math.random() < 0.5) ? Math.random() * 1 + this.baseSpeed : -(Math.random() * 1 + this.baseSpeed); //delta x (x's speed)
		this.dy = speedy ? speedy : -(Math.random() * 1 + this.baseSpeed); //delta y (y's speed)
		//speed is Math.sqrt(Math.pow(pong.ball.dy, 2) + Math.pow(pong.ball.dx, 2)) if anyone wanted to know
		this.maxDx = (this.dx < 0 ? -this.dx : this.dx) + this.maxSpeedDelta;
		this.maxDy = (this.dy < 0 ? -this.dy : this.dy) + this.maxSpeedDelta;
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
		var collision = false;
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
			beep(pong.freq.ballBounce + 150, pong.beeptime);
			collision = true;
			this.cornerCollision(rect);
		}
		return collision;
	};

	this.move = function(side = undefined) {
		var ret = false;
		if(0 < this.x + this.dx - this.ray && this.x + this.dx + this.ray < canvas.width)
			this.x += this.dx;
		else {
			if(side != undefined) if((side == 3 && this.x + this.dx - this.ray <= 0) || (side == 1 && canvas.width <= this.x + this.dx + this.ray))
				ret = true;
			this.dx *= -1;
			if(!ret) beep(pong.freq.ballBounce, pong.beeptime);
		}
		if(0 < this.y + this.dy - this.ray && this.y + this.dy + this.ray < canvas.height)
			this.y += this.dy;
		else {
			if(side != undefined) if((side == 0 && this.y + this.dy - this.ray <= 0) || (side == 2 && canvas.height <= this.y + this.dy + this.ray))
				ret = true;
			this.dy *= -1;
			if(!ret) beep(pong.freq.ballBounce, pong.beeptime);
		}
		if(ret)	{
			beep(pong.freq.ballBounce - 150, pong.beeptime);
			beep(pong.freq.ballBounce - 150, pong.beeptime);
		}
		return ret;
	};

	this.print = function() {
		this.ctx.beginPath();
		this.ctx.arc(this.x, this.y, this.ray, 0, 2 * Math.PI);
		this.ctx.fillStyle = color ? color : Theme.get('accent');
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
		this.y = y ? y : canvas.height - (this.height * 2);
		this.minX = () => { return this.x - (this.width / 2);};
		this.minY = () => { return this.y - (this.height / 2);};
		this.maxX = () => { return this.x + (this.width / 2);};
		this.maxY = () => { return this.y + (this.height / 2);};
		this.speed = 9;
	};

	this.move = function(by) {
		if(0 <= this.x - (this.width / 2) + by && this.x + (this.width / 2) + by < canvas.width)
			this.x += by;
	};

	this.print = function(newAccent = undefined) {
		this.ctx.beginPath();
		this.ctx.rect(this.x - (this.width / 2), this.y - (this.height / 2), this.width, this.height);
		this.ctx.fillStyle = color ? color : Theme.background.get();
		this.ctx.fill();
		this.ctx.beginPath();
		this.ctx.rect(this.x - (this.width / 6), this.y - (this.height / 4), this.width / 3, this.height / 2);
		this.ctx.fillStyle = newAccent ? newAccent : accent ? accent : Theme.get('accent-dark');
		this.ctx.fill();
	};

	this.init();
}

var pong = {
	freq: {
		ballBounce: 350,
	},
	beeptime: 50,
	initVal: function() {
		this.score = 0,			//unused, for now
		this.delay = 1000 / 60,	//delay between a frame and the following one
		this.running = 0,		//game is running (0: no, 1: yes, 2: is about to or gameOver is active)
		this.move = 0;			//move the ball (-1, 0, 1)
		this.button = document.getElementById('pong-start-button');
	},

	init: function(body = document.body) {
		this.initVal();
		this.canvas = document.createElement('CANVAS'),
		this.canvas.width = 1000;
		this.canvas.height = 750;
		this.canvas.style.maxHeight = '75vh';
		this.canvas.style.maxWidth = '100%';
		this.canvas.style.display = 'block';
		this.canvas.style.margin = 'auto';
		this.canvas.style.border = 'var(--general-border) solid var(--accent)';
		this.ctx = this.canvas.getContext('2d');
		this.player = new PongPlayer(this.canvas);
		this.ball = new PongBall(this.canvas);
		document.onkeydown = function(e) {
			if(pong.running == 1) {
				if(e.keyCode == 37) //left
					pong.move = -1;
				else if(e.keyCode == 39) //right
					pong.move = 1;
			} else if(pong.running == 0){
				if(e.keyCode == 13)
					pong.start();
			}
		};
		document.onkeyup = function(e) {
			if(pong.running == 1)
				pong.move = 0; //stop moving the player on key release
		}
		body.insertBefore(this.canvas, body.childNodes[0]);
		this.printCenter('Press ENTER to play', undefined, 20);
	},

	slide: function(delta) {
		//move the player
		pong.player.move(delta * pong.player.speed);
	},

	clear: function() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},

	printCenter: function(what, color = undefined, fontSize = undefined, fontFamily = 'monospace') {
		if(fontSize == undefined) fontSize = parseInt(getComputedStyle(document.body).getPropertyValue('font-size')) * 10 / 3;
		pong.ctx.font = fontSize + 'px ' + fontFamily;
		pong.ctx.fillStyle = color ? color : Theme.get('accent');
		pong.ctx.fillText(what, (pong.canvas.width - pong.ctx.measureText(what).width) / 2, (pong.canvas.height + fontSize) / 2);
	},

	refresh: function() {
		//update canvas elements
		this.clear();
		if(this.move)
			this.slide(this.move);
		if(this.ball.collide(this.player)) {
			if((this.ball.dx < 0 ? -this.ball.dx : this.ball.dx) < this.ball.maxDx) {
				this.ball.dx += this.ball.dx < 0 ? -0.75 : 0.75;
				this.player.speed += 0.5;
			}
			if((this.ball.dy < 0 ? -this.ball.dy : this.ball.dy) < this.ball.maxDy) this.ball.dy += this.ball.dy < 0 ? -0.75 : 0.75;
			this.player.print(Theme.get('accent'));
		} else {
			this.player.print();
		}
		if(this.ball.move(2)) //bounced on the bottom side
			this.gameOver();
		this.ball.print();
	},

	countdown: function(i = 3) {
		pong.running = 2;
		pong.score = 0;
		//countdown
		pong.clear();
		pong.player.print();
		if(i <= 0) i = 'GO';
		pong.printCenter(i.toString());
		if(i != 'GO')
			setTimeout(pong.countdown, 1000, i - 1);
		else {
			//start the game
			setTimeout(function() {
				pong.running = 1;
				startPong();
			}, 1000);
		}
	},

	start: function() {
		if(pong.button) { //disable button
			pong.button.setAttribute('disabled', 'true');
			pong.button.blur();
		}
		pong.countdown();
	},

	gameOver: function() {
		//change player's color on game over
		this.running = 2;
		this.clear();
		this.player.print(Theme.get('invalid'));
		this.printCenter('GAME OVER', Theme.get('invalid'));
		setTimeout(function() {
			pong.clear();
			pong.printCenter('Press ENTER to play again', undefined, 20);
			pong.reset();
			if(pong.button) {
				pong.button.removeAttribute('disabled');
				pong.button.setAttribute('value', 'Restart');
			}
		}, 1500);
	},

	reset: function() {
		this.initVal();
		this.player.init();
		this.ball.init();
	},
}

function startPong() {
	pong.refresh();
	if(pong.running == 1)
		setTimeout(startPong, pong.delay);
}

function createPongDiv() {
	var div = document.createElement('DIV');
	div.setAttribute('id', 'pong-game');
	div.style.textAlign = 'center';
	div.innerHTML = '<br><input id="pong-start-button" type="button" onclick="pong.start();" value="Start">';
	document.body.getElementsByTagName('MAIN')[0].append(div);
	return div;
}

pong.init(createPongDiv());

//END

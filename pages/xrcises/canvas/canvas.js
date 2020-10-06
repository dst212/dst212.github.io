//I know this is messed up a bit, but let's pretend it's ok: it works

var objRect, objImage, objText;

function CanvasObj(type, width = 40, height = 40, startx = undefined, starty = undefined, speedx = undefined, speedy = undefined, delay = 1000/60, color = 'transparent', background = '#00ff00') {
	this.init = () => {
		this.canvas = document.getElementById('canvas' + type[0]);
		this.ctx = this.canvas.getContext('2d');
	}
	this.init();
	this.width = width;
	this.height = height;
	this.x = startx ? startx : Math.floor(Math.random() * (this.canvas.width - (2 * this.width))) + (this.width / 2);
	this.y = starty ? starty : Math.floor(Math.random() * (this.canvas.height - (2 * this.height))) + (this.height / 2);
	this.dx = speedx ? speedx : Math.floor(Math.random() * this.width) / 6 + 1;
	this.dy = speedy ? speedy : Math.floor(Math.random() * this.height) / 6 + 1;
	this.delay = delay;
	this.color = color;
	this.background = background;
	this.active = true;
	this.collide = () => {
		if((this.x + this.width + this.dx > this.canvas.width) || (this.x + this.dx < 0))
			this.dx *= (-1);
		if((this.y + this.height + this.dy > this.canvas.height) || (this.y + this.dy < 0))
			this.dy *= (-1);
		this.x += this.dx;
		this.y += this.dy;
	}
	switch(type[0].toLowerCase()) {
		default:
		case 'rect':
			this.objInit = () => {}
			this.print = () => {
				this.ctx.rect(this.x, this.y, this.width, this.height);
				this.ctx.strokeStyle = this.color;
				this.ctx.fillStyle = this.background;
			}
			break;
		case 'image':
			this.objInit = () => {
				this.img = new Image(this.width, this.height);
				this.img.src = type[1];
			}
			this.print = () => {
				this.ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
			}
			break;
		case 'text':
			this.objInit = () => {
				this.text = type[1];
				this.ctx.font = this.font = '' + this.height + 'px ' + (type[2] ? type[2] : 'monospace');
				this.width = this.ctx.measureText(this.text).width;
			}
			this.print = () => {
				this.ctx.strokeStyle = this.color;
				this.ctx.fillStyle = this.background;
				this.ctx.font = this.font;
				this.ctx.fillText(this.text, this.x, this.y + this.height);
			}
			break;
	}
	this.draw = () => {
		this.ctx.beginPath();
		this.print();
		this.ctx.fill();
		this.ctx.stroke();
		this.ctx.closePath();
	}
	this.move = () => {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.draw();
		this.collide();
		if(this.active)
			setTimeout(this.move, this.delay);
	}
	this.start = () => {
		this.active = true;
		this.move();
	}
	this.stop = () => this.active = false;
	this.objInit();
}

function initCanvas() {
	objRect = new CanvasObj(['Rect']);
	objImage = new CanvasObj(['Image', '/favicon.ico']);
	objText = new CanvasObj(['Text', 'Disa', 'monospace'], 40, 20);
}
initCanvas();

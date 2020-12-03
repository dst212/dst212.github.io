// made by dst212, https://github.com/dst212/dst212.github.io/ - Tron game
'use strict';

var Tron;

(function() {
	const SERVER = 'ws://dst212.herokuapp.com/tron-game';

	let player = [];

	//settings
	let data;
	let settings = {
		default() {return {
			color: ['magenta', 'cyan'],
			score: [0, 0],
			sounds: true,
		}},
		getScore(i) { return data.score[i]; },
		getColor(i) { return data.color[i]; },
		addScore(i, inc) {
			data.score[i]++;
			this.save();
		},
		setColor(from, i) {
			data.color[i] = player[i].color = getComputedStyle(from).backgroundColor;
			elem.refreshTitle();
			this.save();
		},
		load() {
			data = JSON.parse(localStorage.getItem('tron-settings')) || this.default();
		},
		save() {
			localStorage.setItem('tron-settings', JSON.stringify(data));
		},
		reset() {
			localStorage.setItem('tron-settings', JSON.stringify(data = this.default()));
			elem.refreshTitle();
		},
		resetScores() {
			for(let i = 0; i < data.score.length; i++)
				data.score[i] = 0;
			this.save();
			elem.refreshTitle();
		},
	};

	//elements
	let elem = { //elements
		button: null,
		title: null,
		settingsForm: null,
		init() {
			this.button = document.getElementById('tron-start-button');
			this.settingsForm = document.getElementById('tron-settings');
			this.title = document.getElementById('title') || document.getElementsByTagName('H1')[0];
		},
		refreshTitle() {
			this.title.innerHTML = '<span style="text-shadow: 0.05em 0.05em rgba(0,0,0,0.2); color: ' + data.color[0] + '">' + settings.getScore(0) + '</span> - Tron - <span style="text-shadow: 0.05em 0.05em rgba(0,0,0,0.2); color: ' + data.color[1] + '">' + settings.getScore(1) + '</span>';
		},
	}
	let canvas, ctx;

	let TronPlayer = function(x, y, color) {
		this.color = color;
		//head's coordinates
		this.init = function() {
			this.x = x || Math.floor((canvas.width * 0.8) * Math.random());
			this.y = y || Math.floor((canvas.height * 0.8) * Math.random());
			/*	directions: ↑ = 0, → = 1, ↓ = 2, ← = 3
				quadrants (clockwise):
				1	2
				4	3
			*/
			//the direction is
			if(this.x < canvas.width / 2 && this.y < canvas.height / 2) {
				//first quadrant
				this.dir = this.x < this.y ? 1 : 2;
			} else if(this.x >= canvas.width / 2 && this.y < canvas.height / 2) {
				//second quadrant
				this.dir = canvas.width - this.x < this.y ? 3 : 2;
			} else if(this.x >= canvas.width / 2 && this.y >= canvas.height / 2) {
				//third quadrant
				this.dir = canvas.width - this.x < canvas.height - this.y ? 3 : 0;
			} else {
				//fourth quadrant
				this.dir = this.x < canvas.height - this.y ? 1 : 0;
			}
			this.queueDir = this.dir;
			this.prevx = this.x;
			this.prevy = this.y;
			this.died = false; //has crashed somewhere
		};

		this.setDir = function(where) {
			if(this.dir !== where && this.dir + 2 !== where && this.dir - 2 !== where && 0 <= where && where < 4) {
				this.queueDir = where;
				if(data.sounds) beep(350 + 25 * where, 100);
			}
		};

		this.move = function() {
			this.prevx = this.x;
			this.prevy = this.y;
			this.dir = this.queueDir;
			switch(this.dir) {
				case 0: this.y--; break;
				case 1: this.x++; break;
				case 2: this.y++; break;
				case 3: this.x--; break;
				default:
					break;
			};
		};

		this.collide = function() {
			return this.x < 0 || this.y < 0 || this.x >= canvas.width || this.y >= canvas.height || ctx.getImageData(this.x, this.y, 1, 1).data[3] > 0;
		};

		this.print = function(color, head) {
			ctx.beginPath();
			ctx.fillStyle = color || this.color || (typeof Theme !== 'undefined' && Theme.get('accent'));
			ctx.rect(this.prevx, this.prevy, 1, 1);
			ctx.fill();
			ctx.closePath();

			ctx.beginPath();
			ctx.fillStyle = head || (typeof Theme !== 'undefined' && Theme.get('body-fg')) || 'white';
			ctx.rect(this.x, this.y, 1, 1);
			ctx.fill();
			ctx.closePath();
		};

		this.init();
	};

	//socket
	let socket, isHost = false;

	let initSocket = function() {
		if(!socket) {
			document.getElementById('tron-multiplayer').style.display = 'none';
			document.getElementById('tron-multiplayer-leave').style.display = 'block';
			socket = io(SERVER);
			socket.on('connect', function() {
				// win('Tron', 'Succesfully connected to the server.');
				console.log('Connected to the server (' + SERVER + ').')
			});
			socket.on('disconnect', function() {
				// win('Tron', 'Disconnected from the server.');
				console.log('Disconnected from the server.');
			});
			socket.on('message', console.log);
			socket.on('connected', function(data) {
				console.log(data);
			});
			socket.on('roomList', data => Tron.roomShowList(data));
			socket.on('moveOpponent', data => player[1].setDir(data * 1));
			socket.on('roomReady', data => socket.emit('setOpponent', data));
			socket.on('startGame', () => priv.start());
			socket.on('next', data => {
				if(priv.state === 1) {
					if(data.length > 0) {
						player[0].setDir(data[1] === 3 ? 1 : data[1] === 1 ? 3 : data[1]);
						player[1].setDir(data[0] === 3 ? 1 : data[0] === 1 ? 3 : data[0]);
					}
					priv.refresh();
				}
			});
			isHost = true;
		}
	};
	let endSocket = function() {
		if(socket) {
			document.getElementById('tron-multiplayer').style.display = 'block';
			document.getElementById('tron-multiplayer-leave').style.display = 'none';
			socket.disconnect();
			socket = undefined;
			elem.refreshTitle();
			elem.button.removeAttribute('disabled');
		}
		isHost = false;
	};

	//private object
	let priv = {
		reset() {
			player[0].init();
			player[1].init();
		},

		clear() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		},

		waitForOpponent() {
			elem.title.innerHTML = 'Waiting for opponent...';
		},

		refresh() {
			if(isHost)
				socket.emit('next', player[0].queueDir !== player[0].dir || player[1].queueDir !== player[1].dir ? [player[0].queueDir, player[1].queueDir] : []);
			player[0].move();
			player[1].move();

			if(player[0].x === player[1].x && player[0].y === player[1].y) { //head collision
				player[0].died = player[1].died = true;
				player[0].print('', 'red');
				player[1].print('', 'red');
			} else {
				if(player[0].collide()) {
					player[0].died = true;
					player[0].print('red', 'transparent');
				} else
					player[0].print();

				if(player[1].collide()) {
					player[1].died = true;
					player[1].print('red', 'transparent');
				} else
					player[1].print();
			}

			if(!player[0].died && !player[1].died) {
				if(this.state === 1 && (!socket || (socket && isHost)))
					setTimeout(this.refresh.bind(this), this.delay);
			} else {
				if(isHost)
					socket.emit('next', player[0].queueDir !== player[0].dir || player[1].queueDir !== player[1].dir ? [player[0].queueDir, player[1].queueDir] : []);
				this.gameOver();
			}
		},

		countdown(i = 3) {
			this.state = -1;
			if(data.sounds) beep(i ? 650 : 1300, i ? 100 : 500);
			if(i <= 0) i = 'GO!';
			elem.title.innerHTML = i;
			if(i !== 'GO!') //continue counting
				setTimeout(this.countdown.bind(this), 1000, i - 1);
			else { //start the game
				setTimeout(function() {
					this.state = 1;
					this.clear();
					elem.refreshTitle();
					if(!socket || (socket && isHost))
						this.refresh();
				}.bind(this), 1000);
			}
		},

		start() {
			if(this.state === 0) {
				if(socket)
					socket.emit('notReadyToStart');
				this.reset();
				this.clear();
				player[0].print();
				player[1].print();
				this.countdown();
			}
		},

		gameOver() {
			this.state = 0;
			if(data.sounds) Tron.gameOverAudio.play();
			//check who's the winner
			if(player[0].died && !player[1].died)
				settings.addScore(1, 1);
			if(player[1].died && !player[0].died)
				settings.addScore(0, 1);

			elem.refreshTitle();

			elem.settingsForm.style.display = '';
			if(elem.button) {
				elem.button.removeAttribute('disabled');
				elem.button.setAttribute('value', 'Restart');
			}
		},

		delay: 50,
		state: 0, //game is running (0: no, 1: yes, 2: paused, -1: countdown or game over screen)
	};

	//game object
	Tron = {
		init() {
			let that = this;

			if(typeof Page !== 'undefined') Page.unload = (function() {
				//restore onkeydown and onkeyup functions when page is changed
				//see https://dst212.github.io/js/page.js
				let onkeydown = document.onkeydown;
				return function() {
					document.onkeydown = onkeydown;
					Tron = undefined;
				};
			})();

			settings.load();

			//DOM-related stuff
			elem.init();
			canvas = document.getElementById('tron-canvas')
			ctx = canvas.getContext('2d');
			this.gameOverAudio = new Audio('/res/audios/explosion.mp3');

			document.onkeydown = function(e) {
				if(priv.state === 0) switch (e.code) {
					case 'Enter': case 'Space':
						if(document.activeElement.nodeName !== 'INPUT')
							that.pressStart();
						break;
					default:
						break;
				} else if(priv.state === 1) switch(e.code) {
					case 'KeyW':
						if(socket && !isHost) socket.emit('move', 0);
						else player[0].setDir(0);
						break;
					case 'KeyA':
						if(socket && !isHost) socket.emit('move', 1);
						else player[0].setDir(3);
						break;
					case 'KeyS':
						if(socket && !isHost) socket.emit('move', 2);
						else player[0].setDir(2);
						break;
					case 'KeyD':
						if(socket && !isHost) socket.emit('move', 3);
						else player[0].setDir(1);
						break;
					case 'ArrowUp':
						if(socket && !isHost) socket.emit('move', 0);
						else player[socket ? 0 : 1].setDir(0);
						break;
					case 'ArrowLeft':
						if(socket && !isHost) socket.emit('move', 1);
						else player[socket ? 0 : 1].setDir(3);
						break;
					case 'ArrowDown':
						if(socket && !isHost) socket.emit('move', 2);
						else player[socket ? 0 : 1].setDir(2);
						break;
					case 'ArrowRight':
						if(socket && !isHost) socket.emit('move', 3);
						else player[socket ? 0 : 1].setDir(1);
						break;
					case 'Enter': case 'Space':
						if(!socket)
							priv.state = 2;
						break;
					default:
						break;
				} else if(priv.state === 2) switch(e.code) {
					case 'Enter': case 'Space':
						priv.state = 1;
						priv.refresh();
						break;
					default:
						break;
				}
				if(document.activeElement.nodeName !== 'INPUT' && (37 <= e.keyCode && e.keyCode <= 40 || e.keyCode === 32))
					return false;
			};

			player = [];
			player.push(new TronPlayer(canvas.width / 4, canvas.height / 2, settings.getColor(0)));
			player.push(new TronPlayer(canvas.width / 4 * 3, canvas.height / 2, settings.getColor(1)));

			elem.refreshTitle();
		},

		//settings
		resetSettings() { settings.reset(); },
		resetScores() { settings.resetScores(); },
		setColor(from, i) { settings.setColor(from, i); },
		//rooms
		roomShowList(room) {
			let list = '', opponents = [];
			for(let key in room)
				if(room[key].player.length < 2)
					opponents.push({innerHTML: room[key].name, onclick: function() {Tron.roomJoin(key);}});
			if(opponents.length > 0)
				list = 'List of available opponents:';
			else {
				list = 'Nobody is waiting for a opponent.<br>Try to create a room and wait for someone to join.';
				endSocket();
			}
			win('Tron', list, opponents, () => {}, true);
		},

		roomList() {
			if(!socket)
				initSocket();
			socket.emit('roomList');
		},

		roomCreate(name) {
			if(!socket)
				initSocket();
			socket.emit('roomCreate', name);
		},

		roomJoin(roomId) {
			if(socket) {
				socket.emit('roomJoin', roomId);
				isHost = false;
			}
		},

		roomLeave() {
			if(socket) {
				socket.emit('roomLeave');
				endSocket();
			}
		},

		pressStart() {
			//disable button
			elem.button.setAttribute('disabled', 'true');
			document.activeElement.blur();
			if(priv.state === 0) {
				canvas.style.maxHeight = '100vh';
				elem.settingsForm.style.display = 'none';
				if(socket) {
					socket.emit('readyToStart');
					priv.waitForOpponent();
				} else
					priv.start();
			}
		},
	}
})();

Tron.init();
//END

//made by dst212, https://github.com/dst212/dst212.github.io/ - online chat
'use strict';

var Chat;

(function() {
	let that;

	const SERVER = window.location.protocol + '//' + (window.location.hostname === 'dst212.github.io' ? 'dst212.herokuapp.com' : window.location.hostname + ':5000') + '/chat';
	const socket = io(SERVER, {autoConnect: false});

	let anim, header, headertext, input, title, div, chatListDiv;

	const show = () => div && (div.style.display = 'block');
	const hide = () => div && (div.style.display = 'none');
	const isHidden = () => div?.style.display === 'none';

	function refreshHeader(id) {
		if(rooms[id] && cr === id) {
			let m = Object.keys(rooms[id].members).length;
			let t = Object.keys(rooms[id].typing);
			if(t.length === 0 && rooms[id].members) {
				anim.style.display = 'none';
				headertext.innerHTML = m + ' member' + (m > 1 ? 's' : '');
			} else {
				anim.style.display = '';
				headertext.innerHTML = (
					t.length === 1 ? (rooms[id].typing[t[0]] || '') + '#' + t[0] + ' is typing' :
					((t.length < 4 ? t.length : 'Several') + ' people are typing')
				);
			}
		}
	}

	let rooms = {};			//list of available rooms
	let cr = '';			//current room's name
	let lastpm = undefined;	//sender of the last pm
	let username = '';

	let isTypingTimeout;

	let loginPopup, disconnectedPopup, connectingPopup;

	Chat = that = {
		init() {
			addStyleSheet('/stuff/chat/chat.css?0');
			fetch('/stuff/chat/chat.html?0')
				.then(res => res.text())
				.then(data => {
					div = document.createElement('DIV');
					div.id = 'online-chat';
					div.innerHTML = data;
					document.body.appendChild(div)
					that.hide();
					chatListDiv = document.getElementById('chat-list');
					title = document.getElementById('chat-title');

					header = document.getElementById('chat-header');
					anim = document.createElement('SPAN');
					anim.innerHTML = '<div class="three-dots-anim"><span>·</span><span>·</span><span>·</span></div>';
					anim.style.display = 'none';
					headertext = document.createElement('SPAN');
					header.appendChild(anim);
					header.appendChild(headertext);

					input = document.getElementById('chat-input');
					input.onkeypress = function(e) {
						if(isTypingTimeout)
							clearTimeout(isTypingTimeout);
						socket.emit('started-typing', cr);
						isTypingTimeout = setTimeout(() => socket.emit('stopped-typing', cr), 1000);

						if(e.code === 'Enter') {
							if(e.ctrlKey || e.shiftKey) {
								let i = this.selectionStart;
								this.value = this.value.slice(0, i) + '\n' + this.value.slice(i);
								this.setSelectionRange(++i, i);
							} else if(this.value) {
								if(that.send(this.value))
									this.value = '';
								return false;
							}
						}
					}
					document.getElementById('chat-send-button').onclick = function(e) {
						if(input.value && that.send(input.value))
							input.value = '';
						input.focus();
					}
					draggable(div);
					div.style.transition += ', width 0s, height 0s';
				});
		},
		loginForm() {
			loginPopup.open();
		},
		login(as) {
			if(localStorage.chatAgreed == 1) {
				if(socket.disconnected) {
					if(as?.length <= 16) {
						username = as;
						connectingPopup.open();
						socket.connect();
					} else
				popup('Chat', 'Please, choose a valid name (length must not be more than <code>16</code>).', [{innerHTML: 'Ok', onclick: that.loginForm.bind(that)}, {innerHTML: 'Cancel'}]);
				}
			} else {
				popup('Chat', 'Agree to the <a href="javascript:void(Chat.privacyPolicy());">privacy policy</a> and the <a href="javascript:void(Chat.termsOfService());">terms of service</a> first.');
			}
		},
		logout() {
			socket.disconnect();
		},
		rename(name) {
			if(localStorage.getItem('chat-username') !== name)
				localStorage.setItem('chat-username', name);
			socket.emit('rename', name);
		},
		join(id, password) {
			socket.emit('join', id, password);
		},
		leave(id) {
			socket.emit('leave', id);
		},
		create(name, password) {
			socket.emit('create', name, password);
		},
		switch(id) {
			if(rooms[cr]?.div)
				rooms[cr].div.style.height = '0px';
			if(rooms[cr = id]) {
				title.innerHTML = 'Chat - ' + rooms[cr].name + (cr != rooms[cr].name ? ' (' + cr + ')' : '');
				if(rooms[cr]?.div)
					rooms[cr].div.style.height = '';
				refreshHeader(cr);
			}
		},
		message(id, message, sender, timeout) {
			let scrollFlag, div= document.createElement('DIV');
			if(typeof(sender?.[0]) === 'string')
				div.innerHTML = '<b>&lt;</b><a title="User ID: ' + sender[1] + '" href="javascript:void(0);" onclick="Chat.inputSetBefore(\'/p ' + sender[1] + ' \');">' + sender[0] + '<span style="color:#808080">#' + sender[1] + '</span></a><b>&gt;</b>&nbsp;';
			else if(sender === 1)
				div.innerHTML = '<code class="blink">PM</code> ';
			else if(sender === -1)
				div.innerHTML = '<code class="background-invalid">[ERROR]</code> ';
			else if(sender === 2)
				div.innerHTML = '<code><a>[COMMAND]</a></code> ';
			else
				div.innerHTML = '<code>[INFO]</code> ';
			div.innerHTML += message;
			if(!id)
				id = cr;
			if(rooms[id]?.div) {
				scrollFlag = rooms[id].div.offsetHeight + rooms[id].div.scrollTop === rooms[id].div.scrollHeight;
				rooms[id].div.appendChild(div);
				if(scrollFlag)
					this.scrollDown(id);
				if(timeout > 0)
					setTimeout(() => div.remove(), timeout);
			} else
				console.log('[' + id + '] ' + (div?.textContent || 'Couldn\'t retrieve message'));
		},
		send(message, timeout = 0) {
			clearTimeout(isTypingTimeout);
			socket.emit('stopped-typing', cr);
			if(this.command(message)) {
				return true;
			} else if(rooms[cr]) {
				socket.emit('message', cr, message, timeout);
				return true;
			} else {
				console.error('Couldn\'t send message: room #' + cr + ' not found');
			}
			return false;
		},
		command(message) {
			if(typeof message === 'string' && (message[0] === '/' || message[0] === '!' || message[0] === '.')) {
				let msg = message.slice?.(1).split(' ');
				switch(msg[0]) {
					case 'clear': //clear current chat's content
					 	if(rooms[cr]?.div) {
							rooms[cr].div.innerHTML = '';
							this.message(cr, 'Chat cleared', null, 3000);
						}
						break;
					case 'id': //get id of the current chat
						this.message(cr, 'ID: ' + cr);
						break;
					case 'list': //list partecipants
						if(rooms[msg[1] || cr])
							this.message(cr, 'List of members\' IDs of room ' + (msg[1] || cr) + ': ' + rooms[msg[1] || cr].members.join(', '));
						else
							this.message(cr, 'No room with id <code>' + msg[1] + '</code>', -1);
						break;
					case 'whois': //get alias of a user
						socket.emit('whois', msg[1] * 1);
						break;
					case 'whoami': //get own alias
						socket.emit('whois');
						break;
					case 't': //send a message with self-destruction
						this.send(msg.slice(2).join(' '), msg[1] * 1000);
						break;
					case 'p': //private message someone
						this.pm(msg[1] * 1, msg.slice(2).join(' '));
						break;
					case 'pt': //private message someone with timeout destruction
						this.pm(msg[1] * 1, msg.slice(3).join(' '), msg[2] * 1000);
						break;
					case 'r': //resend pm to last recipient
						if(lastpm !== undefined)
							this.pm(lastpm, msg.slice(1).join(' '));
						break;
					case 'rt': //resend pm to last recipient with timeout destruction
						if(lastpm !== undefined)
							this.pm(lastpm, msg.slice(2).join(' '), msg[1] * 1000);
						break;
					case 'switch': //switch to another room
						if(rooms[msg[1]])
							this.switch(msg[1]);
						else
							this.message(cr, 'No room with id <code>' + msg[1] + '</code>', -1);
						break;
					case 'join': //join another room
						this.join(msg[1], msg.slice(2).join(' '));
						break;
					case 'leave': //leave a room (current if not specified)
						this.leave(msg[1] || cr);
						break;
					case 'create': //create a new room
						this.create(msg[1], msg.slice(2).join(' '));
						break;
					case 'rename': //change username
						this.rename(msg.slice(1).join(' '));
						break;
					case 'logout': //leave all the rooms and log out closing the chat dialog
						this.logout();
						break;
					case 'test':
						socket.emit('test', msg.slice(1).join(' '));
						break;
					case 'help': //get help
						this.help(msg[1]);
						break;
					default:
						return false;
				}
				return true;
			}
			return false;
		},
		pm(recipient, message, timeout = 0) {
			socket.emit('pm', recipient, message, timeout);
			lastpm = recipient;
		},
		pmsent(recipient, message, timeout) {
			this.message(cr, 'to ' + recipient + ': ' + message, 1, timeout);
		},
		gotpm(sender, message, timeout) {
			this.message(cr, 'from ' + sender + ': ' + message, 1, timeout);
		},
		show() {
			if(socket.disconnected)
				this.loginForm();
			else
				show();
		},
		hide() {
			hide();
		},
		toggle() {
			if(socket.connected) {
				if(isHidden())
					show();
				else
					hide();
			} else
				this.loginForm();
		},
		isHidden: () => isHidden(),
		scrollDown(id) {
			rooms[id || cr]?.div?.scrollTo(0, rooms[id || cr].div.scrollHeight);
		},
		inputAppend(append) {
			if(input) {
				input.value += append;
				input.focus();
			}
		},
		inputSetBefore(value) {
			if(input) {
				input.value = value + input.value;
				input.focus();
			}
		},
		help(command) {
			switch(command) {
				default:
					this.message(cr,
						'List of available commands:<br><br><span class="chat-command-help">\
							<code onclick="Chat.help(this.innerHTML);">logout</code>, \
							<code onclick="Chat.help(this.innerHTML);">rename</code>, \
							<code onclick="Chat.help(this.innerHTML);">clear</code>, \
							<code onclick="Chat.help(this.innerHTML);">id</code>, \
							<code onclick="Chat.help(this.innerHTML);">list</code>, \
							<code onclick="Chat.help(this.innerHTML);">whois</code>, \
							<code onclick="Chat.help(this.innerHTML);">whoami</code>, \
							<code onclick="Chat.help(this.innerHTML);">t</code>, \
							<code onclick="Chat.help(this.innerHTML);">p</code>, \
							<code onclick="Chat.help(this.innerHTML);">pt</code>, \
							<code onclick="Chat.help(this.innerHTML);">r</code>, \
							<code onclick="Chat.help(this.innerHTML);">rt</code>, \
							<code onclick="Chat.help(this.innerHTML);">join</code>, \
							<code onclick="Chat.help(this.innerHTML);">leave</code>, \
							<code onclick="Chat.help(this.innerHTML);">switch</code>, \
							<code onclick="Chat.help(this.innerHTML);">create</code>, \
							<code onclick="Chat.help(this.innerHTML);">explode</code>, \
							<code onclick="Chat.help(this.innerHTML);">kick</code>\
						</span><br><br>Type <code>/help &lt;command&gt;</code> to get help about <code>&lt;command&gt;</code>.<br><br>', 2);
					break;
				case 'logout': this.printHelp(command, 'Disconnect from the server and close the chat dialog.'); break;
				case 'rename': this.printHelp(command, 'Change username.', '&lt;new name&gt;'); break;
				case 'clear': this.printHelp(command, 'Clear messages history.'); break;
				case 'id': this.printHelp(command, 'Get id of current room.'); break;
				case 'list': this.printHelp(command, 'List partecipants\'s IDs.'); break;
				case 'whois': this.printHelp(command, 'Get a user\'s alias from their ID.', '&lt;user id&gt;'); break;
				case 'whoami': this.printHelp(command, 'Same as <code>/whois &lt;own id&gt;</code>.'); break;
				case 't': this.printHelp(command, 'Send a temporary message to destroy after a specified number of seconds.', '&lt;life time&gt; &lt;message&gt;'); break;
				case 'r': this.printHelp(command, 'Re-send a private message to the recipient of the last private message.', '&lt;message&gt;'); break;
				case 'rt': this.printHelp(command, 'Re-send a temporary private message to the recipient of the last private message.', '&lt;life time&gt; &lt;message&gt;'); break;
				case 'p': this.printHelp(command, 'Send a private message.', '&lt;user id&gt; &lt;message&gt;'); break;
				case 'pt': this.printHelp(command, 'Send a temporary private message.', '&lt;user id&gt; &lt;life time&gt; &lt;message&gt;'); break;
				case 'join': this.printHelp(command, 'Join a room.', '&lt;room id&gt;'); break;
				case 'leave': this.printHelp(command, 'Leave a room (or the current one, if no room is specified).', '[room id]'); break;
				case 'switch': this.printHelp(command, 'Switch to a different room.', '&lt;room id&gt;'); break;
				case 'create': this.printHelp(command, 'Create a new room.', '[room name]'); break;
				case 'explode': this.printHelp(command, 'Destroy the current room (admin command).'); break;
				case 'lock': this.printHelp(command, 'Set a password for the current room (admin command). Avoid using spaces.', '&lt;password&gt;'); break;
				case 'unlock': this.printHelp(command, 'Remove the password for the current room (admin command).'); break;
				case 'kick': this.printHelp(command, 'Kick a user from the room (admin command).', '&lt;user id&gt;'); break;
			}
		},
		printHelp(command, description, usage) {
			this.message(cr, 'Help for <code>' + command + '</code>:<br>' + description + '<br>Usage:<br><code>/' + command + (usage ? ' ' + usage : '') + '</code><br><br>', 2);
		},
		privacyPolicy() {
			popup('Chat - Privacy policy', '<h3 class="align-center">Disclaimer</h3><em>This chat is not meant to be used for commercial purposes nor to be a replacement for any other service like this, instead it should be used to interact with users in multi-player games available at this website.</em><h3 class="align-center">Where do data go?</h3>No data is collected since there is no a server database where to store it.<h3 class="align-center">Future</h3>Maybe, in a remote and dystopian future, the server (hosted at <a href="https://dst212.herokuapp.com/">Heroku</a>) may use users\' IP adresses to allow ban or kick features, but server sessions are temporary, therefore data are erased once the server reboots or stops.<h3 class="align-center">Be careful</h3>DO NOT SHARE SENSIBLE INFORMATION, since messages are sent WITHOUT ENCRYPTION AS PLAIN TEXT.<h3 class="align-center">GitHub Pages</h3>This has nothing to do with GitHub Pages (this website\'s host), when <a href="https://docs.github.com/en/github/site-policy/github-privacy-statement#github-pages" target="_blank">they claim</a> they may collect data from visitors of GitHub Pages websites.</textarea>', [{innerHTML: 'Ok'}]);
		},
		termsOfService() {
			popup('Chat - Terms of service', '<h3 class="align-center">Disclaimer</h3><em>This chat is not meant to be used for commercial purposes nor to be a replacement for any other service like this, instead it should be used to interact with users in multi-player games available at this website.</em><h3 class="align-center">Use of the service</h3>The user is responsible for every action performed using this service. The website author is not responsible for any of the content shared nor for the consequences that may arise from the use of the service or from the interaction with other users of the service.', [{innerHTML: 'Ok'}]);
		},
	}

	loginPopup = (function() {
		let id = 'chat-choose-a-username';
		return new Popup('Chat',
			'<div style="text-align: center;");">\
				Choose a name:<br>\
				<input id="' + id + '" type="text" placeholder="Username" value="' + (localStorage.getItem('chat-username') || '') + '" maxlength="16" style="margin: 1em;">\
				<div class="checkbox margin-top-bottom" style="width: 20rem; margin-left: 1rem; margin-right: 1rem;">\
					<label>\
						<input type="checkbox" onchange="if(this.checked) localStorage.chatAgreed = 1; else localStorage.chatAgreed = 0;" ' + (localStorage.chatAgreed == 1 ? 'checked' : '') + '>\
						<span></span>\
						I have read the <a href="javascript:void(Chat.privacyPolicy());">privacy policy</a> and the <a href="javascript:void(Chat.termsOfService());">terms of service</a> and I agree to them\
					</label>\
				</div>\
			</div>',
			[{innerHTML: 'Ok', onclick: () => that.login(document.getElementById(id).value)}, {innerHTML: 'Cancel'}]
		);
	})();
	connectingPopup = new Popup('Chat', 'Connecting to the server...', [{innerHTML: 'Hide'}, {innerHTML: 'Cancel', onclick: socket.disconnect}]);
	disconnectedPopup = new Popup('Chat', 'Disconnected from the server.', [{innerHTML: 'Ok'}]);

	//socket events
	socket.on('connect', function() {
		connectingPopup.close(false);
		this.rename(username);
		chatListDiv.innerHTML = '';
		show();
		disconnectedPopup.close();
	}.bind(that));
	socket.on('disconnect', function() {
		rooms = {};
		hide();
		disconnectedPopup.open();
	});
	socket.on('message', that.message.bind(that));
	socket.on('joined', function(id, name, members) {
		if(rooms[id]?.div) {
			rooms[id].name = name || id;
		} else {
			rooms[id] = {
				name: name || id,
				div: document.createElement('DIV'),
				members: members,
				typing: {},
			};
			chatListDiv.appendChild(rooms[id].div);
		}
		this.switch(id);
		refreshHeader(id);
	}.bind(that));
	socket.on('left', function(id) {
		rooms[id]?.div?.remove?.();
		rooms[id] = undefined;
		if(cr === id)
			this.switch(cr = 'everyone');
	}.bind(that));
	socket.on('pm', that.gotpm.bind(that));
	socket.on('pmsent', that.pmsent.bind(that));
	socket.on('started-typing', function(user, name, id) {
		if(rooms[id])
			rooms[id].typing[user] = name;
			refreshHeader(id);
	});
	socket.on('stopped-typing', function(user, id) {
		if(rooms[id]) {
			delete rooms[id].typing[user];
			refreshHeader(id);
		}
	});
	socket.on('update-members-list', function(id, members) {
		if(rooms[id]) {
			rooms[id].members = members;
			refreshHeader(id);
		}
	}.bind(that));
	socket.on('error', function(data, timeout) {
		console.error(data);
		this.message(cr, data, -1, timeout);
	}.bind(that));

	//login automatically (for future use)
	if(localStorage.getItem('chat-auto-connect'))
		that.login(localStorage.getItem('chat-username') || '');
})();

//END

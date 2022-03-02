import { populate_settings } from "./settings.js";
import { create_sockets } from "./sockets.js";
import { show_likes } from "./displaylikes.js";

Hooks.once('init', () => {
	populate_settings();
	create_sockets();
});

// HANDLEBARS
Handlebars.registerHelper('print_users', function(likesusers) {
	const users = [];
	for (let u of likesusers){
		users.push(game.users.get(u).name);
	}

	if (users.length == 0 ) {
		return "No Likes";
	}
	else if (users.length == 1){
		return users[0]+" liked this message";
	}
	else if (users.length == 2){
		return users[0]+" and "+users[1]+" liked this message";
	}
	else {
		return users[0]+", "+users[1]+" and "+users.length-2+" liked this message";
	}
});


// HOOKS
Hooks.on('renderSidebarTab', (ev, html) => {
	if (ev.tabName == "chat") {
		//get the total of likes
		const actual_user = game.users.get(game.user.id);
		let likes = actual_user.getFlag("world", "likes");
		if (likes == undefined) {
			likes = {
				value: 0,
				max: 0
			}
		}

		const like_button = $('<button class="f-sp-0 margin-ss">')
    .append(
      $('<i class="fas fa-thumbs-up"></i>'),
      document.createTextNode(`Likes`)
    );

    html.prepend(like_button);
		like_button.on('click', async function(ev) {
			const actual_user = game.users.get(game.user.id);
			let likes = actual_user.getFlag("world", "likes");
			if (likes == undefined) {
				likes = {
					value: 0,
					max: 0
				}
			}
			const html = await renderTemplate(
				"modules/likes-on-chat/templates/likes-spend.html",
				{
					likes: likes
				}
			);
			
			const dialogConfig = {
				title: "Change likes",
		    content: html,
		    buttons: {
		    	spend: {
		        label: "Spend",
		        callback: async () => {
		        	const input = document.getElementById("num_likes");
		        	const value = parseInt(input.value, 10);
		        	const actual_user = game.users.get(game.user.id);
							
							if (value < 0){
								return ui.notifications.warn("Incorrect value");
							}
		        	if (value > likes.value) {
		        		return ui.notifications.warn("Not enough likes");
		        	}
		        	likes.value -= value;
		        	actual_user.setFlag("world", "likes", likes);
		        	
		        	if (game.settings.get("likes-on-chat", "change_resource_of_actor") == "a") {
			        	const character = actual_user.data.character;
			        	change_resource_of_actor(likes, character);
			        }

			        //adding data to card
						  let contentdata = {
						    text: game.user.name+" spends likes",
						    tags: [{name: "-"+value+" likes"}]
						  }
						  
						  //calling html and show it
						  let content = await renderTemplate(
						    "modules/likes-on-chat/templates/simple-card.html",
						    contentdata
						  );
						  ChatMessage.create({
						    speaker: ChatMessage.getSpeaker({ actor: this.actor }),
						    content: content,
						    sound: CONFIG.sounds.dice
						  });
		        }
		      },
		      regain: {
		        label: "Regain",
		        callback: async () => {
		        	const input = document.getElementById("num_likes");
		        	const value = parseInt(input.value, 10);
		        	const actual_user = game.users.get(game.user.id);
							let likes = actual_user.getFlag("world", "likes");
							
							if (value < 0){
								return ui.notifications.warn("Incorrect value");
							}
		        	if (likes.value + value > likes.max) {
		        		return ui.notifications.warn("Value exceeds maximum");
		        	}
		        	likes.value = likes.value + value;
		        	actual_user.setFlag("world", "likes", likes);

		        	if (game.settings.get("likes-on-chat", "change_resource_of_actor") == "a") {
			        	const character = actual_user.data.character;
			        	change_resource_of_actor(likes, character);
			        }

			        //adding data to card
						  let contentdata = {
						    text: game.user.name+" regains likes",
						    tags: [{name: "+"+value+" likes"}]
						  }
						  
						  //calling html and show it
						  let content = await renderTemplate(
						    "modules/likes-on-chat/templates/simple-card.html",
						    contentdata
						  );
						  ChatMessage.create({
						    speaker: ChatMessage.getSpeaker({ actor: this.actor }),
						    content: content,
						    sound: CONFIG.sounds.dice
						  });
		        }
		      },
		      cancel: {
		        label: "Cancel",
		        callback: () => {
		        	return;
		        }
		      },
		    }
			}

		  new Promise(resolve => {
		    let d = new Dialog(dialogConfig, {width: 300});
		    return d.render(true);
		  });
		})
	}
});

Hooks.on("renderChatMessage", async function(chatlog, html){
	let likes = await chatlog.getFlag("world", "likes");
	let liked = false;
	
	if (likes == undefined) {
		const likes_new = {
			total: 0,
			users: []
		}
		change_likes(chatlog, likes_new, "new");
		likes = likes_new;	
	}
	else if (likes.users.includes(game.user.id)) {
		liked = true;
	}

	const like_menu = "modules/likes-on-chat/templates/like-on-message.html";
	const data = {
		id: chatlog.id,
		likes: likes.total,
		users: likes.users,
		liked: liked
	};
	const like_menu_html = await renderTemplate(like_menu, data);
	html.append(like_menu_html);
	html.on('click', 'a.like-button', doLikeButton)
})

async function doLikeButton (ev) {
	const gm_users = game.users.filter((u) => u.active && u.isGM).length;
	if (gm_users == 0) {
    return ui.notifications.warn(`Could not give likes because there is no GM connected.`);
  }

  //message data
	const dataset = ev.currentTarget.dataset;
	const id = dataset.id;
	const message = game.messages.get(id);

	//original user data
	const og_user_id = message.data.user;
	const og_user = game.users.get(og_user_id);

	if (game.settings.get("likes-on-chat", "auto_like") != "a" &&
		og_user_id == user_id) {
		return;
	}

	if (og_user == undefined){
		return ui.notifications.warn("Original user does not exist");
	}

	//actual user data
	const user_id = game.user.id;
	const user = game.users.get(user_id);
	const character = og_user.data?.character;

	//likes data from message
	const likes = message.getFlag("world", "likes");

	let operation;
	if (likes.users.includes(user_id)) {
		operation = "sustract";
	}
	else {
		operation = "add";
	}
		
	//if adding likes, check the time
	if (operation == "add") {
		const last_like = user.getFlag("world", "last_like");

		if (last_like) {
			const time_since = Math.floor((Date.now() - last_like)/1000);
			const min_time = game.settings.get("likes-on-chat", "time_per_like")

			if (time_since < min_time){
				return ui.notifications.warn("You need to wait before giving another like")
			}
		}
		
		user.setFlag("world", "last_like", Date.now())
	}

	//push the change to the message
	change_likes(message, likes, operation, character, ev);
}


//change the likes directly if it is GM
//otherwise it calls a socket
//then it changes the resource of the character
function change_likes(message, likes, operation, character, ev) {

	if (operation != "new") {
		const og_user_id = message.data.user;
		const og_user = game.users.get(og_user_id);
		const user_id = game.user.id;
		const user = game.users.get(user_id);

		let likes_res = og_user.getFlag("world", "likes")
		if (likes_res == undefined) {
			likes_res = {
				value: 1,
				max: 1,
			}
		}
		else if (operation == "add") {
			likes_res.value += 1;
			likes_res.max += 1;
			$(ev.currentTarget).addClass("liked");
			likes.total += 1;
			likes.users.push(user_id);
			if (likes.total > 1) {
				show_likes(likes.total, og_user.data.name, user.data.name);	
				game.socket.emit('module.likes-on-chat', {
					operation: "show-likes",
					num_likes: likes.total, 
					user1: og_user.data.name, 
					user2: user.data.name
				});
			}
		}
		else if (operation == "sustract") {
			likes_res.value -= 1;
			likes_res.max -= 1;
			$(ev.currentTarget).removeClass("liked");
			likes.total -= 1;
			likes.users = likes.users.filter(u => u != user_id);
		}		

		if (game.user.isGM) {
			og_user.setFlag("world", "likes", likes_res);
		}
		else {		
			game.socket.emit('module.likes-on-chat', {
				operation: "change-likes-user",
				og_user_id: og_user_id,
				likes_res: likes_res
			});
		}

		if (game.settings.get("likes-on-chat", "change_resource_of_actor") == "a") {
		  change_resource_of_actor(likes_res, character);
		} 
	}

	if  (game.user.isGM) {
		message.setFlag("world", "likes", likes);
	}
	else {		
		game.socket.emit('module.likes-on-chat', {
			operation: "change-likes-chat",
			message: message,
			likes: likes
		});
	}

	return true;
}

function change_resource_of_actor (likes, character) {
	const actor_char = game.actors.get(character);
  if (actor_char == undefined){
  	return;
  }

  const resource = game.settings.get("likes-on-chat", "resource");

	const tertiary_label = eval("actor_char.data."+resource+".label");
	if (tertiary_label === "") {
		if (game.user.isGM) {
			actor_char.update({[resource+".label"]: "Likes"});
		}
		else {
			game.socket.emit('module.likes-on-chat', {
				operation: "change-actor-data",
				actor_id: character,
				attribute: resource+".label",
				value: "Likes"
			});
		}
	}
	else if (tertiary_label != "Likes") {
		return ui.notifications.warn(
			`Could not give likes because the resource is already in use`
		);
	}

	if (game.user.isGM) {
		actor_char.update({[resource+".value"]: likes.value})
		actor_char.update({[resource+".max"]: likes.max})
	}
	else {
		game.socket.emit('module.likes-on-chat', {
			operation: "change-actor-data",
			actor_id: character,
			attribute: resource+".value",
			value: likes.value
		});

		game.socket.emit('module.likes-on-chat', {
			operation: "change-actor-data",
			actor_id: character,
			attribute: resource+".max",
			value: likes.max
		});
	}
}


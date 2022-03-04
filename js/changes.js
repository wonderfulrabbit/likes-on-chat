import { show_likes } from "./display-likes.js";

export function change_likes(message, target) {

	const og_user_id = message.data.user;
	const og_user = game.users.get(og_user_id);
	const character = og_user.data?.character;
	const user_id = game.user.id;
	const user = game.users.get(user_id);
	const num_likes = target.innerHTML;

	const likes_on_message = 
		message.getFlag("world", "likes") ?? {total: 0, users: []}
	const likes_on_user = 
		og_user.getFlag("world", "likes") ?? { value: 0, max: 0 }

	likes_on_user.value = parseInt(likes_on_user.value) + parseInt(num_likes);
	likes_on_user.max = parseInt(likes_on_user.max) + parseInt(num_likes);
	$(target).addClass("liked");
	likes_on_message.total = parseInt(likes_on_message.total) + parseInt(num_likes);
	likes_on_message.users.push(user_id);

	show_likes(num_likes, og_user.data.name, user.data.name);	
	game.socket.emit('module.likes-on-chat', {
		operation: "show-likes",
		num_likes: num_likes, 
		user1: og_user.data.name, 
		user2: user.data.name
	});

	if (game.settings.get("likes-on-chat", "change_resource_of_actor") == "a") {
	  change_resource_of_actor(likes_on_user, character);
	} 


	const max_likes = user.getFlag("world", "max_likes");
	user.setFlag("world", "max_likes", max_likes - num_likes)

	if (game.user.isGM) {
		og_user.setFlag("world", "likes", likes_on_user);
		message.setFlag("world", "likes", likes_on_message);
	}
	else {		
		game.socket.emit('module.likes-on-chat', {
			operation: "change-likes-user",
			og_user_id: og_user_id,
			likes: likes_on_user
		});
		game.socket.emit('module.likes-on-chat', {
			operation: "change-likes-chat",
			message: message,
			likes: likes
		});
	}
}



export function change_resource_of_actor (likes, character) {
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
import { show_likes } from "./displaylikes.js";

export function create_sockets(){
	console.log("creating sockets...");
	game.socket.on('module.likes-on-chat', (data) => {
		if (data.operation == "change-likes-chat") handle_change_chat(data);
		if (data.operation == "change-likes-user") handle_change_user(data);
		if (data.operation == "change-actor-data") handle_change_actor(data);
		if (data.operation == "show-likes") show_likes_to_everyone(data);
	});
}

function handle_change_chat (data) {
	if (!game.user.isGM) return;
	const message = game.messages.get(data.message._id);
	message.setFlag("world", "likes", data.likes);
}

function handle_change_user (data) {
	if (!game.user.isGM) return;
	const og_user = game.users.get(data.og_user_id);
	og_user.setFlag("world", "likes", data.likes);
}

function handle_change_actor (data) {
	if (!game.user.isGM) return;
	const actor = game.actors.get(data.actor_id);
	actor.update({[data.attribute]: data.value});
}

function show_likes_to_everyone (data) {
	show_likes(data.num_likes, data.user1, data.user2);
}
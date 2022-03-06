import { populate_settings } from "./settings.js";
import { populate_handlebars } from "./handlebars.js";
import { create_sockets } from "./sockets.js";
import { spend_likes_menu } from "./spend-likes.js";
import GmMenu from "./gm-likes.js";
import { change_likes, change_resource_of_actor } from "./changes.js";


Hooks.once('init', () => {
	populate_settings();
	create_sockets();
	populate_handlebars();
});


Hooks.once("ready", () => {
	const user = game.users.get(game.user.id);
	//user.setFlag("world", "max_likes", 5);
})

// Add buttons
Hooks.on('renderSidebarTab', (ev, html) => {
	if (ev.tabName == "chat") {
		const container = $('<div class="f-h margin-ss f-sp-0">')

		const spend_likes_button = $('<button class="f-sp-1">')
    .append(
      $('<i class="fas fa-thumbs-up"></i>'),
      document.createTextNode(`Spend Likes`)
    );

    container.append(spend_likes_button);
    spend_likes_button.on('click', (ev) => spend_likes_menu(ev));


		if (game.user.isGM) {
			const gm_likes_button = $('<button class="f-sp-1">')
	    .append(
	      $('<i class="fas fa-thumbs-up"></i>'),
	      document.createTextNode(`Gm menu`)
	    );

	    container.append(gm_likes_button);
	    gm_likes_button.on('click', (ev) => new GmMenu().render(true));
	  }

    html.prepend(container);
	}
});

// Add buttons to give likes on chat
Hooks.on("renderChatMessage", async function(chatlog, html){
	let likes_on_message = await chatlog.getFlag("world", "likes");
	let liked = false;
	
	if (likes_on_message?.users.includes(game.user.id)) {
		liked = true;
	}

	const like_menu = "modules/likes-on-chat/templates/like-on-message.html";
	const data = {
		id: chatlog.id,
		likes: likes_on_message?.total ?? 0,
		users: likes_on_message?.users ?? [],
		liked: liked
	};

	const like_menu_html = await renderTemplate(like_menu, data);
	html.append(like_menu_html);
	
	html.on('click', 'a.like-show', doShowBar);
	html.on('click', 'a.like-button', doLikeButton);
})



let last_target;
async function doShowBar (ev) {
	const target = ev.currentTarget
	const dataset = target.dataset;
	const user = game.users.get(game.user.id);
	const max_of_likes = await user.getFlag("world", "max_likes");

	if (dataset.bar == "hiding") {
		if (last_target) {
			$(last_target).next().remove();
			last_target.dataset.bar = "hiding";
		}

		last_target = target;

		const max_of_likes = await user.getFlag("world", "max_likes");
		const like_options = Array(max_of_likes).fill().map((_, i) => max_of_likes-i)
		
		const like_bar = "modules/likes-on-chat/templates/like-bar.html";
		const data = await {
			id: dataset.id,
			like_options: like_options
		};

		const like_bar_html = await renderTemplate(like_bar, data);
		$(target).parent().append(like_bar_html);

		dataset.bar = "showing";
	}
	else {
		$(target).next().remove();
		last_target = undefined;
		dataset.bar = "hiding";
	}
}

async function doLikeButton (ev) {
	const gm_users = game.users.filter((u) => u.active && u.isGM);
	if (gm_users.length == 0) {
    return ui.notifications.warn(
    	"Could not give likes because there is no GM connected."
    	);
  }

  //message data
	const dataset = ev.currentTarget.dataset;
	const message_id = dataset.id;
	const message = game.messages.get(message_id);

	//original user data
	const og_user_id = message.data.user;
	const og_user = game.users.get(og_user_id);

	//actual user data
	const user_id = game.user.id;
	const user = game.users.get(user_id);

	if (game.settings.get("likes-on-chat", "auto_like") != "a" &&
		og_user_id == user_id) {
		return;
	}

	if (og_user == undefined){
		return ui.notifications.warn("Original user does not exist");
	}
		
	//check time since last like
	const last_like = user.getFlag("world", "last_like");
	if (last_like) {
		const time_since = Math.floor((Date.now() - last_like)/1000);
		const min_time = game.settings.get("likes-on-chat", "time_per_like")

		if (time_since < min_time){
			return ui.notifications.warn("You need to wait before giving another like")
		}
	}
	user.setFlag("world", "last_like", Date.now())

	//push the change to the message
	change_likes(message, ev.currentTarget);
}



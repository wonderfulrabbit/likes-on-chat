const delay = ms => new Promise(res => setTimeout(res, ms));

export async function show_likes (num_likes, user1, user2) {
	const old_message = document.querySelectorAll(".message-box");

	if (await old_message.length != 0) {
		await delay(400);
		return show_likes (num_likes, user1, user2);
  } 

  const size_subtitle = game.settings.get("likes-on-chat", "message_size");
  const size_title = size_subtitle * 3;

 	const path = "modules/likes-on-chat/templates/like-card.html";
 	const data = {
 		num_likes: num_likes,
 		user1: user1,
 		user2: user2,
    size_title: size_title,
    size_subtitle: size_subtitle
 	};
 	const message = await renderTemplate(path, data);
 	const message_object = $(message);

 	const board = document.querySelector("body")
 	$(board).append(message_object);
 	setTimeout(function() {
 		message_object.remove();
 	}, 1600)
}
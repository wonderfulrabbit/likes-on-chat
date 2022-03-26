import { add_likes } from "./changes.js";

export async function give_likes_menu (ev) {	
	const users = game.users.filter((u) => u.active && u.id != game.user.id);
	const users_data = users.map((u) => ({
			id: u.id,
			name: u.data.name
		}))

	const user = game.users.get(game.user.id);
	const max_of_likes = await user.getFlag("world", "max_likes");
	let likes_list = Array(max_of_likes).fill().map((_, i) => i+1);
	if (likes_list.length == 0 ){
		likes_list = [0]
	}

	const html = await renderTemplate(
		"modules/likes-on-chat/templates/likes-give.html",
		{
			users: users_data,
			likes: likes_list
		}
	);
	
	const dialogConfig = {
		title: "Give likes",
    content: html,
    buttons: {
    	give: {
        label: "Give",
        callback: () => do_give_likes() 
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
}

async function do_give_likes () {
	const selected_user = document.getElementsByName("users")[0];
	const sel_user_id = selected_user.value;
	const sel_user = game.users.get(sel_user_id);


	const selected_likes = document.getElementById("likes");
	const sel_likes_val = parseInt(selected_likes.value, 10);
	
	//check time since last like
	const last_like = sel_user.getFlag("world", "last_like");
	if (last_like) {
		const time_since = Math.floor((Date.now() - last_like)/1000);
		const min_time = game.settings.get("likes-on-chat", "time_per_like")

		if (time_since < min_time){
			return ui.notifications.warn("You need to wait before giving another like")
		}
	}
	sel_user.setFlag("world", "last_like", Date.now())

	add_likes(sel_likes_val, sel_user)
}
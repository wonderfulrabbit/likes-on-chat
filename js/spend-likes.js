import { change_resource_of_actor } from "./changes.js";

export async function spend_likes_menu (ev) {
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
		title: "Spend Likes",
    content: html,
    buttons: {
    	spend: {
        label: "Spend",
        callback: () => do_spend_likes(likes) 
      },
      regain: {
        label: "Regain",
        callback: () => do_regain_likes(likes)
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

async function do_spend_likes (likes) {
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
    speaker: actual_user,
    content: content,
    sound: CONFIG.sounds.dice
  });
}

async function do_regain_likes (likes) {
	const input = document.getElementById("num_likes");
	const value = parseInt(input.value, 10);
	const actual_user = game.users.get(game.user.id);
	
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
    speaker: actual_user,
    content: content,
    sound: CONFIG.sounds.dice
  });
}
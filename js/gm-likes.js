export default class GmMenu extends FormApplication {
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			title: "Gm menu",
			template: "modules/likes-on-chat/templates/gm-menu.html",
			width: 250,
			height: "auto",
      choices: {},
      allowCustom: true,
      minimum: 0,
      maximum: null
		});
	}

	getData() {
		const users = [];

		for (let u of game.users) {
			const user = {};
			user.id = u.data._id;
			user.name = u.data.name;
			user.like = u.getFlag("world", "likes") ?? { value: 0, max: 0 };
			user.max_likes = u.getFlag("world", "max_likes")??0;
			users.push(user);
		}

	  return {
	    users: users
    }
  }

  _updateObject(event, formData) {
		this.render();
	}

  activateListeners(html) {
    super.activateListeners(html);

    html.find('button[type="save"]').get(0)?.
    addEventListener('click', async () => {
    	const typeObject = foundry.utils.expandObject(this._getSubmitData());
    	for (let u in typeObject){
    		const likes = typeObject[u].like;
    		const user = game.users.get(u);
    		user.setFlag("world", "likes", likes)
    	}
    });

    html.find('button[type="add"]').get(0)?.
    addEventListener('click', async () => {
    	const typeObject = foundry.utils.expandObject(this._getSubmitData());
    	const add_likes = typeObject.add_likes;
    	const min_likes = 5;

    	for (let u of game.users) {
    		const max_likes = u.getFlag("world", "max_likes")??0;
    		u.setFlag("world", "max_likes", Math.min(max_likes + add_likes, min_likes));
    	}
    });
  }
}
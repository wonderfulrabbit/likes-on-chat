export function populate_handlebars () {
	Handlebars.registerHelper('print_users', function(likes_users) {
		const users = [];
		for (let u of likes_users){
			if (u?.id || game.users.get(u.id)) {
				users.push(game.users.get(u.id)?.name);	
			}
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
			return users[0]+", "+users[1]+" and "+(users.length-2)+" others liked this message";
		}
	});

	Handlebars.registerHelper('ifEqualorMore', function(arg1, arg2, options) {
	  return (arg1 >= arg2) ? options.fn(this) : options.inverse(this);
	});
}

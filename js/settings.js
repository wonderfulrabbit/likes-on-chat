export function populate_settings() {
	console.log("creating settings");

	game.settings.register("likes-on-chat", "auto_like", {
	  name: "Auto likes",
	  hint: "Can you like your own messages?",
	  scope: "world",
	  config: true,
	  type: String,
	  choices: {
	    "a": "True",
	    "b": "False"
	  },
	  default: "b",
	});

	game.settings.register("likes-on-chat", "change_resource_of_actor", {
	  name: "Change resource of actor",
	  hint: "Does it change the resource of the actor receiving likes?",
	  scope: "world",
	  config: true,
	  type: String,
	  choices: {
	    "a": "True",
	    "b": "False"
	  },
	  default: "a"
	});

	game.settings.register("likes-on-chat", "resource", {
	  name: "Resource to change",
	  scope: "world",
	  config: true,
	  type: String,
	  default: "data.resources.tertiary"
	});

	game.settings.register("likes-on-chat", "time_per_like", {
	  name: "Time between likes",
	  hint: "Measured in seconds",
	  scope: "world",
	  config: true,
	  type: Number,
	  range: {             
	    min: 0,
	    max: 100,
	    step: 5
	  },
	  default: 5
	});
}
export async function youtube_menu (ev) {
	const html = await renderTemplate(
		"modules/likes-on-chat/templates/youtube-menu.html",
		{
		}
	);
	
	const dialogConfig = {
		title: "Youtube",
    content: html,
    buttons: {
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

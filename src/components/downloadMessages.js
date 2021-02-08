
import { db } from "../services/firebase";


  function downloadObjectAsJson(exportObj, exportName){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 4));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
export async function downloadMessages(currentWorkshop, onComplete){
	let allMessages = [];;
	try{
	    let teams = await db.collection("teams").where("workshopId", "==", currentWorkshop).get();

	    let teamData =[];
		let t;
		for( t of teams.docs){

			let team = {name: t.data().name, boards: []}
			let boards = await db.collection("boards").where("teamId", "==", t.id).get();	

			let b;

			for(b of boards.docs){
				let board = {name: b.data().name, messages: []}
				let messageId;
				for(messageId of b.data().messages){
					let m = await db.collection("boardMessages").doc(messageId).get();
					if(m.exists){
						let user = await db.collection("users").doc(m.data().uid).get();
						if(user.exists){
							let message = {content: m.data().content, author: user.data().displayName};
							board.messages.push(message);
							allMessages.push(message);
						}
					}
				}
				team.boards.push(board);
			}
			teamData.push(team);
		}
		downloadObjectAsJson(teamData, "teamData");
		downloadObjectAsJson(allMessages, "allMessages");
		onComplete();

	}catch(e){
		console.error("download messages error: ", e);
	}
}

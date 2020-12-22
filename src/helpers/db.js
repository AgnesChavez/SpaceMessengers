import { db } from "../services/firebase";

// export function readChats() {
//   let abc = [];
//   db.ref("chats").on("value", snapshot => {
//     snapshot.forEach(snap => {
//       abc.push(snap.val())
//     });
//     return abc;
//   });
// }
// 
// export function writeChats(message) {
//   return db.ref("chats").push({
//     content: message.content,
//     timestamp: message.timestamp,
//     uid: message.uid
//   });
// }


export async function addDataToDb(dataBaseName,data, autoAddId = true) {
	try{
		let docRef = await db.collection(dataBaseName).add(data);	

		if(autoAddId)
		{
			docRef.update({docId: docRef.id});
		}

		return docRef;
	}
	catch(error)
	{
		console.error("Error adding document to " + dataBaseName, error);
	}
	return null;
}

export function setDataInDb(dataBaseName, docName, data) {

    db.collection(dataBaseName).doc(docName).set(data)
    .then(function() {
        console.log(docName +  " successfully written to " + dataBaseName);
    })
    .catch(function(error) {
        console.error("Error creating document " + docName +  " in " + dataBaseName + " error: ", error);
    });
}

export async function getQueryData(query) {
    try{

    let res = await query.get();
    if(res.exists)
        return res.data();
    }
    catch(error) {
        console.error("Error retrieving query data:  error: ", error);
        return null;
    }
    return null;
} 


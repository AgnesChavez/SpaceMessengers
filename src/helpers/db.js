import { db } from "../services/firebase";

import firebase from 'firebase/app';


export async function addDataToDb(dataBaseName,data, autoAddId = true, idFieldName="docId") {
    // console.log("addDataToDb", dataBaseName, data, autoAddId, idFieldName);
	try{
		let docRef = await db.collection(dataBaseName).add(data);	

		if(autoAddId)
		{
			await docRef.update({[idFieldName]: docRef.id});
		}

		return docRef;
	}
	catch(error)
	{
		console.error("Error adding document to " + dataBaseName, error);
	}
	return null;
}

export function setDataInDb(dataBaseName, docName, data, _merge = false) {

    // console.log("setDataInDb: ",  dataBaseName, docName, data);
// 
    db.collection(dataBaseName).doc(docName).set(data, { merge: _merge })
    .then(function() {
        // console.log(docName +  " successfully written to " + dataBaseName);
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

export function addToArray(collectionId, docId, arrayId, data)
{
    db.collection(collectionId).doc(docId).update({
        [arrayId] : firebase.firestore.FieldValue.arrayUnion(data)
    });

}

export function removeFromArray(collectionId, docId, arrayId, data){
    db.collection(collectionId).doc(docId).update({
        [arrayId] : firebase.firestore.FieldValue.arrayRemove(data)
    });
}




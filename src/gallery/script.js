var storageRef = firebase.storage().ref();
var db = firebase.firestore();

var loadIndex = 0;
var imgsPerPage = 12;
var bShowingPreloader = true;
var pageNum = 1;


var imgThumbWidth = 300;
var imgsPerLine;
var maxThumbWidth;

var searchQuery = null;
var startAt = null;

var totalToLoad = null;

function showPreloader(bShow = true)
{
    if(bShowingPreloader != bShow){
        let preloader = document.getElementById("preloaderImgs");
        if(preloader)
        {
            preloader.style.display = bShow?"":"none";
            bShowingPreloader = bShow;
            let cl = document.querySelector(".preloader-wrapper").classList;
            if(bShow){
                if(!cl.contains("active"))
                    cl.add("active");
            }
            else{
                cl.remove("active");
            }
        }
    }
}
function hidePreloader()
{
    showPreloader(false);
}

function resetLoadIndex(total)
{
    totalToLoad = total;
    loadIndex = 0;
}

function checkImgsLoaded()
{
    
    if(bShowingPreloader)
    {
        let tot = imgsPerPage;
        if(totalToLoad != null)
        {
            tot = totalToLoad;
        }
        let pct = loadIndex/tot;
        if(pct > 0.7 )
        {
            hidePreloader();
        }
    }
}

function paginate()
{

    var pagination = document.querySelector(".pagination");

    db.collection("users").where('processed', '==', true).orderBy('processedDate', 'desc')
        .get()
        .then(function(querySnapshot) {

            var i;
            var totalPages = Math.ceil(querySnapshot.docs.length / imgsPerPage);
            // console.log("totalPages: " ,  totalPages);

            var paginationFirst = document.getElementById("paginationFirst");
            var paginationLast = document.getElementById("paginationLast");


            var p = 1;
            var prevPage = null;
            var nextPage = null;
            for (i = 0; i < querySnapshot.docs.length; i += imgsPerPage) {
                var newLi = document.createElement("LI");
                var newA = document.createElement("A");
                var textnode = document.createTextNode(p);
                // console.log("processedDate ", i, " : ", typeof(querySnapshot.docs[i].data().processedDate), " : ", querySnapshot.docs[i].data().processedDate);

                let d = querySnapshot.docs[i].data().processedDate;

                var link = "/archive/index.html?startAt=" + d.seconds + "." + d.nanoseconds + "&pageNum=" + p;

                if (pageNum > 1 && pageNum - 1 == p) {
                    prevPage = link;
                }
                if (pageNum + 1 == p) {
                    nextPage = link;
                }


                if (pageNum == p) {
                    newLi.setAttribute("class", "active");
                    newA.setAttribute("href", "#!");
                } else {
                    newLi.setAttribute("class", "waves-effect");
                    newA.setAttribute("href", link);
                }

                newA.appendChild(textnode);
                newLi.appendChild(newA);

                pagination.insertBefore(newLi, paginationLast);

                p++;
            }



            paginationFirst.setAttribute("class", (pageNum == 1) ? "disabled" : "waves-effect");
            paginationLast.setAttribute("class", (pageNum == totalPages) ? "disabled" : "waves-effect");
            paginationFirst.getElementsByTagName("A")[0].setAttribute("href", (prevPage == null) ? "#!" : prevPage);
            paginationLast.getElementsByTagName("A")[0].setAttribute("href", (nextPage == null) ? "#!" : nextPage);


        })
        .catch(function(error) {
            console.log("Error getting documents: ", error);
        });
}
function paginateSearch(page, totalPages) {
    if ((pageNum - 1) != page) {
        console.log("(pageNum - 1) != page)", (pageNum - 1), page);
    }



    if (totalPages > 1) {

        var pagination = document.querySelector(".pagination");
        var paginationFirst = document.getElementById("paginationFirst");
        var paginationLast = document.getElementById("paginationLast");


        var p = 1;
        var prevPage = null;
        var nextPage = null;
        for (let i = 0; i < totalPages; i++) {
            var newLi = document.createElement("LI");
            var newA = document.createElement("A");
            var textnode = document.createTextNode(p);


            var link = "/archive/index.html?searchQuery=" + searchQuery + "&pageNum=" + p;

            if (pageNum > 1 && pageNum - 1 == p) {
                prevPage = link;
            }
            if (pageNum + 1 == p) {
                nextPage = link;
            }


            if (pageNum == p) {
                newLi.setAttribute("class", "active");
                newA.setAttribute("href", "#!");
            } else {
                newLi.setAttribute("class", "waves-effect");
                newA.setAttribute("href", link);
            }

            newA.appendChild(textnode);
            newLi.appendChild(newA);

            pagination.insertBefore(newLi, paginationLast);

            p++;
        }



        paginationFirst.setAttribute("class", (pageNum == 1) ? "disabled" : "waves-effect");
        paginationLast.setAttribute("class", (pageNum == totalPages) ? "disabled" : "waves-effect");
        paginationFirst.getElementsByTagName("A")[0].setAttribute("href", (prevPage == null) ? "#!" : prevPage);
        paginationLast.getElementsByTagName("A")[0].setAttribute("href", (nextPage == null) ? "#!" : nextPage);


    }

}


function calcWidths(){
    imgsPerLine = Math.floor(window.innerWidth / imgThumbWidth);
    maxThumbWidth = window.innerWidth/imgsPerLine;
    console.log("calcWidths:  imgsPerLine: ",imgsPerLine, "maxThumbWidth: ",maxThumbWidth);
}


function parseParams()
{
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    

    
    if (urlParams.has('startAt')) {
        var s = urlParams.get('startAt');

        var i = s.indexOf(".");

        startAt = new firebase.firestore.Timestamp(parseInt(s.substr(0, i)), parseInt(s.substring(i + 1)));

        console.log("parsed startAt", startAt);
    }
    if (urlParams.has('imgsPerPage')) {
        imgsPerPage = urlParams.get('imgsPerPage');
    }
    if (urlParams.has('pageNum')) {
        pageNum = urlParams.get('pageNum');
    }

    if (urlParams.has('searchQuery')) {
        searchQuery = urlParams.get('searchQuery');
        if(searchQuery == ""){
            searchQuery = null;
        }
    }

}

function loadImgs(){

    var imgTemplate = document.getElementById("imageTemplate");


    var archive = document.getElementById("archive");

    var query = db.collection("users").where('processed', '==', true).orderBy('processedDate', 'desc');

    if (startAt != null) {
        query = query.startAt(startAt);
    }

    
    query.limit(imgsPerPage).get()
        .then(function(querySnapshot) {
            loadIndex = 0;        
            querySnapshot.forEach(function(doc) {
                addImgFromDoc(doc, imgTemplate, archive);
            });
        })
        .catch(function(error) {
            console.log("Error getting documents: ", error);
        });
}

function search()
{
    if(searchQuery){


    var imgTemplate = document.getElementById("imageTemplate");


    var archive = document.getElementById("archive");

    var client = algoliasearch("RFQVCVO0ZD", "675a6104d056c4964016397431902978");

        const index = client.initIndex("users");
        


        index.search(searchQuery, {
        attributesToRetrieve: ['objectID'],
        hitsPerPage: imgsPerPage,
        page: (pageNum -1)
        }).then(function(responses) {
            resetLoadIndex(responses.hits.length);
            paginateSearch(responses.page, responses.nbPages);
            

            // console.log(responses);
        // https://www.algolia.com/doc/api-reference/api-methods/search/#response-format
            responses.hits.forEach( hit =>{
                // console.log(hit.objectID,  "name match: ",  hit._highlightResult.name.matchLevel);

                // if(hit._highlightResult.name.matchLevel == "full")
                {
                    db.collection("users").doc(hit.objectID)
                    .get().then(function(doc) {
                        if (doc.exists) {
                            addImgFromDoc(doc, imgTemplate, archive)
                        }
                    }).catch(function(error) {
                        console.log("Error getting document:", error);
                    });
                }
            });

        });
    }
}

function addImgFromDoc(doc, imgTemplate, archive) {
    var cln = imgTemplate.cloneNode(true);
    cln.id = doc.id;

    cln.style.width = imgThumbWidth + 'px';
    cln.style.maxWidth = maxThumbWidth + 'px';
    // cln.style.width = imgThumbWidth + 'px';

    cln.onclick = () => {
        window.location.href = "/user/index.html?userId=" + doc.id;
    };

    let processedImage = cln.querySelector(".processedImage");

    processedImage.src = doc.data().thumb_processed;

    processedImage.removeAttribute('id');

    processedImage.onload = (event) => {
        // console.log(event.target.clientWidth);
        loadIndex++;
        checkImgsLoaded();

    };

    cln.querySelector(".completename").innerHTML = doc.data().completename;

    archive.appendChild(cln);
    // i++;
}



window.onload = function() {
    setupAuth();

    calcWidths();
    parseParams();
    if(searchQuery != null)
    {
        search();

    }else{
        loadImgs();    
        paginate();
    }
    
    
    updateFooter();

}
window.onresize = function()
{
    calcWidths();

    document.querySelectorAll(".gridImg").forEach(img=>{
     img.style.maxWidth = maxThumbWidth + 'px';   
    });

     

};
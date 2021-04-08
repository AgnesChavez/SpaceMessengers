# Space Messengers

This is the code that drives the [Space Messengers](space-messengers.web.app) boards web platform. 

This is a collaborative message board where messages are pinned in a canvas and users are allowed to move these, add comments, images and chat.

It is built using [Firebase](firebase.google.com/) to host and provide access to the database in real time. [ReactJS](reactjs.org/) and [Materialize](materializecss.com/) were used to build the front end.

In order to use this you must have reactjs and firebase cli tools installed. 
Then just run `npm start`.

To deploy run `npm run build`. If it builds successfully run `firebase deploy` to deploy to the firebase servers.
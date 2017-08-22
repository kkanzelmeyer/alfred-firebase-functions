const path = require('path');
// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// set up refs
const visitorsBucket = functions.storage.object();
const visitorsDatabase = admin.database().ref('/visitorFiles');

exports.syncFileInDatabase = visitorsBucket.onChange(event => {
    const object = event.data; // The Storage object.

    // The Storage bucket that contains the file.
    const fileBucket = object.bucket;
    // File path in the bucket.
    const filePath = object.name;

    // STOP CONDITIONS
    const dir = filePath.split('/')[0];
    if (dir != 'visitors') {
      console.log(`event occurred in directory ${dir} - ignoring`);
      return null;
    }

    // whether a resource is deleted
    const resourceState = object.resourceState;
    // Get the file name.
    const fileName = path.basename(filePath);
    console.log({ fileBucket, filePath, resourceState, fileName });

    // update the visitors database
    if (resourceState === 'exists') {
      visitorsDatabase.push(filePath);
    } else {
      visitorDatabase.orderByValue().equalTo(filePath).remove();
    }

    // send FCM
    // topic
    const topic = 'visitor';
    // Notification details.
    const payload = {
      notification: {
        title: 'Visitor at the front door!',
        body: `Someone's at the door!`,
        click_action: 'fcm.ACTION.VISITOR',
      },
    };
    // Send a message to devices subscribed to the provided topic.
    admin.messaging().sendToTopic(topic, payload)
      .then(function(response) {
        // See the MessagingTopicResponse reference documentation for the
        // contents of response.
        console.log('Successfully sent message:', response);
      })
      .catch(function(error) {
        console.log('Error sending message:', error);
      });
  });

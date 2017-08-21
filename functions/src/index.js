import path from 'path';
// import {functions} from 'firebase-functions';
const functions = require('firebase-functions');
import admin from 'firebase-admin';

admin.initializeApp(functions.config().firebase);

// set up refs
const visitorsBucket = functions.storage.bucket('visitors').object();
const visitorsDatabase = functions.database.ref('/visitorFiles');

const syncFileInDatabase = () => (
  visitorsBucket.onChange(event => {
    const object = event.data; // The Storage object.

    // The Storage bucket that contains the file.
    const fileBucket = object.bucket;
    // File path in the bucket.
    const filePath = object.name;
    // whether a resource is deleted
    const resourceState = object.resourceState;
    // Get the file name.
    const fileName = path.basename(filePath);
    console.log({ fileBucket, filePath, resourceState, fileName });

    // update the visitors database
    if (resourceState === 'exists') {
      visitorsDatabase.push(fileName);
    } else {
      visitorDatabase.orderByValue().equalTo(fileName).remove();
    }

    // send FCM
    // topic
    const topic = 'highScores';
    // Notification details.
    const payload = {
      notification: {
        title: 'You have a new follower!',
        body: `${follower.displayName} is now following you.`,
        icon: follower.photoURL,
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
  })

);

export { syncFileInDatabase };

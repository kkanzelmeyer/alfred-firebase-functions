'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.syncFileInDatabase = undefined;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _firebaseAdmin = require('firebase-admin');

var _firebaseAdmin2 = _interopRequireDefault(_firebaseAdmin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import {functions} from 'firebase-functions';
var functions = require('firebase-functions');


_firebaseAdmin2.default.initializeApp(functions.config().firebase);

// set up refs
var visitorsBucket = functions.storage.bucket('visitors').object();
var visitorsDatabase = functions.database.ref('/visitorFiles');

var syncFileInDatabase = function syncFileInDatabase() {
  return visitorsBucket.onChange(function (event) {
    var object = event.data; // The Storage object.

    // The Storage bucket that contains the file.
    var fileBucket = object.bucket;
    // File path in the bucket.
    var filePath = object.name;
    // whether a resource is deleted
    var resourceState = object.resourceState;
    // Get the file name.
    var fileName = _path2.default.basename(filePath);
    console.log({ fileBucket: fileBucket, filePath: filePath, resourceState: resourceState, fileName: fileName });

    // update the visitors database
    if (resourceState === 'exists') {
      visitorsDatabase.push(fileName);
    } else {
      visitorDatabase.orderByValue().equalTo(fileName).remove();
    }

    // send FCM
    // topic
    var topic = 'highScores';
    // Notification details.
    var payload = {
      notification: {
        title: 'You have a new follower!',
        body: follower.displayName + ' is now following you.',
        icon: follower.photoURL
      }
    };
    // Send a message to devices subscribed to the provided topic.
    _firebaseAdmin2.default.messaging().sendToTopic(topic, payload).then(function (response) {
      // See the MessagingTopicResponse reference documentation for the
      // contents of response.
      console.log('Successfully sent message:', response);
    }).catch(function (error) {
      console.log('Error sending message:', error);
    });
  });
};

exports.syncFileInDatabase = syncFileInDatabase;
// firebase-admin-init.js
const admin = require('firebase-admin');
const serviceAccount = require('.serviceAccountKey.js');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
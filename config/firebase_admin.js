import admin from 'firebase-admin';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

if (!admin.apps.length) {
  let credential;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    credential = admin.credential.cert(serviceAccount);
  } else {
    const serviceAccount = require('./firebase-service-account.json');
    credential = admin.credential.cert(serviceAccount);
  }

  admin.initializeApp({ credential });
  console.log('[Firebase Admin] Initialised.');
}

export default admin;

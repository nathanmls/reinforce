const admin = require('firebase-admin');
const { USER_ROLES } = require('../app/config/roles.js');

// Initialize Firebase Admin with your service account
const serviceAccount = {
  type: 'service_account',
  project_id: 'reinforce-338b3',
  private_key_id: '167500b979c40bd7aae3f31ca36b86f234806a64',
  private_key:
    '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDYKBx7f7aHZxFB\n9cqqq2R9ZYOdCfwTO7AbkuhD6lu/WhpwqIT2h8XxXfbyHZfXClxeZMKD8Bpaot2M\nr/zE2PZXBFxaYFvuLItX9DJk/lUAMRcXCp0OaS+WR7ClmoPX+Jp777CoLkvpv9e7\nwd2PivcsTUHVjhS+yc+7SVsMRhRXJ6JuMncwytd3TTtMoOCPJVmtZLB+Yuhdo1OK\ngbrK7mYC3c6xygSHA8VbdfE/LTunvUx4zFwHeTF4AOsJB62nnKZv/eVrm6J6WDOk\n/LZXxZ+/tvgSdkndD+Uy70RV07fd9YxIgrAi0gF9U6FHnNtpia2cMElrZ3N1GGHZ\nXjNV8G7VAgMBAAECggEACsuOCJjrO73o/btRwM5IeX69YPVjsm4zsFzY3rNwm5Db\nay7vXQSQ3SoNMDBMKgApdslfcYlnN4mUuPb9D7OqMdRU7GqNjMqKtvzKG4McKaNJ\n/OuZxmN4be/soYii9wFCbdgdoXiWb/kVxBm9f/K3v22oUQsEfDbF+huCwY0qbOPF\nVhgXj+m4Ps322iiLnXyJgHuhiHEPhq6e8Ogm2y9Ra/XoGi5+hDD/3UMvv3Uup/Nq\nH0VO+Icpvz07HeXUxgxbos4uxzPyuUjKLWTmJwrB68RZ9g6Xnj72qFtJlycoQO3P\nydO3JOCaa66BIxDeFvChi59ysbk3LSYT9CZxrIJbIQKBgQDye3znekByDR0uH68f\n+Hxe8TOlr62drVtLOXoKLMzL/mbJTKVPFWW1VMF4IaDVjmtIHsa9SDpcoo5A3i8f\nIeAO2U2spT5cf1arFDF+KELkrZP3SoqIxNLl21yT3AcgbZuhb1iJFw8GK1a77Oqc\nklWT+2vUt7V9S4YwZDP8vOy2vQKBgQDkNOym8VY2wdnidc9u7cfMHfNoMPqX6Fm9\nHCYiZS01VQBc6VwH6GMBYR5MU13F+x+j77Fw7Om2EESRXOh10NA/vVdStln+eSC0\nli9K9kOJDMv4YUI1QfXAHmbQgoA4ont+eDdLhryLcxQ358wLY8drqAq/OmPA8nzB\nCzrPCzUF+QKBgD2QKqsed8Q9Hh56vtywGuuD86fqTXsN63LS2fBBZZGZOoF7KzFD\n7nm2VhRo/UubCBPcdHrUHrUsNE+12WLfF+LNOxJNNeMIFXoD+3jbQfiLNVkAnOGS\njzT6l6uWnlyWV4AKJAFSUGcxk6jMwtgTsxSKLdto9PQlu6EHn8dYNAVFAoGAd/5M\nIUvs5UXw517C/7UPxYhKIJMAcTe/V+yhMJy6tLxJQJGDzrSmumbyo3eCa0OsU2sJ\nhjNMgGr1YunTYX+2wI0yiU9Q6rmONOZzX5s1z65m4ediBNb1/Vr+/Mxh12W4Qbu8\nd34VTc3o56x+Yc7JYRYu8HYnVaErb+YTuiJOcyECgYAcnQ+aqgDo/kyoTt5YFrG4\n9TG6GPT2EdBufT4RSlPBa4KtmRgLS/wqguZbcZxN/qOxVBR7uoj76AOdptY1zqYr\n8R3KxaRuGB8//z/gc60fjW3znfaqUKYNPx8SO5SnhEILTP6HUzEdb80JTVohVuf0\nYWmX2LecSKnoUAvuUo8FDQ==\n-----END PRIVATE KEY-----\n',
  client_email:
    'firebase-adminsdk-lcq7j@reinforce-338b3.iam.gserviceaccount.com',
  client_id: '112889231881927762145',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url:
    'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-lcq7j%40reinforce-338b3.iam.gserviceaccount.com',
  universe_domain: 'googleapis.com',
};

// Initialize the admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function setUserAsAdmin(email) {
  try {
    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);

    // Set custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: USER_ROLES.ADMINISTRATOR,
    });

    // Update Firestore document
    await admin.firestore().collection('users').doc(userRecord.uid).set(
      {
        email: email,
        role: USER_ROLES.ADMINISTRATOR,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log(`Successfully set user ${email} as Administrator`);
  } catch (error) {
    console.error('Error setting user as admin:', error);
  }
}

// Set nathanmls@hotmail.com as administrator
setUserAsAdmin('nathanmls@hotmail.com');

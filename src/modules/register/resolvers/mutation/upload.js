// backend/sign-url.js
const path = require('path');

// eslint-disable-next-line import/no-extraneous-dependencies
const { Storage } = require('@google-cloud/storage');

// Initialize Google Cloud Storage client with your service account credentials
const storage = new Storage({
  keyFilename: path.join(__dirname, '../../../../../service-account-key.json'),
  projectId: 'register-digiqc',
});
const bucketName = 'digiqc_register';

// Resolver function for generating a signed URL
// eslint-disable-next-line no-unused-vars
const generateSignedUrl = async (parent, { filename, fileType }, ctx) => {
  try {
    const options = {
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes expiration time
      contentType: fileType, // Adjust if necessary based on your file type
    };

    console.log("Requesting signed URL for file:", filename);

    // Generate the signed URL for the file
    const [url] = await storage
      .bucket(bucketName)
      .file(filename)
      .getSignedUrl(options);

    console.log('Generated signed URL:', url);

    // Return the signed URL in a structured object as required by the GraphQL schema
    return { signedUrl: url };
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Error generating signed URL');
  }
};

module.exports = generateSignedUrl;

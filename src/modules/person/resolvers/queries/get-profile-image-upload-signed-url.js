const path = require('path');

const { getType } = require('mime');

const { IMAGE_KEYS } = require('../../../../constants/service-constants');
const awsFunctions = require('../../../../shared-lib/aws/functions');
const CustomGraphqlError = require('../../../../shared-lib/error-handler');
const { getMessage } = require('../../../../utils/messages');
const personLogger = require('../../person-logger');

const getProfileImageUploadSignedUrl = async (parent, args, ctx) => {
  const { requestMeta, req, localeService } = ctx;
  try {
    const { user } = req;
    const { data } = args;
    let { fileName } = data;
    if (!fileName) {
      throw new CustomGraphqlError(getMessage('MISSING_REQUIRED_FIELDS', localeService));
    }

    const mimeType = getType(fileName);
    const fileExtension = path.extname(fileName);
    fileName = `profile-image-${new Date().getTime()}${fileExtension}`;

    const personId = user.id;
    const profileImageKey = `${IMAGE_KEYS.PERSON_PROFILE_IMAGE}/${personId}/${fileName}`;

    const signedData = await awsFunctions.generateS3PutSignedUrl(profileImageKey, mimeType, requestMeta, 'private');
    return signedData;
  } catch (error) {
    personLogger.error(`Error from getProfileImageUploadSignedUrl > ${error}`, requestMeta);
    throw error;
  }
};

module.exports = getProfileImageUploadSignedUrl;

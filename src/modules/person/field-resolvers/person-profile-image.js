const { IMAGE_KEYS } = require('../../../constants/service-constants');
const awsFunctions = require('../../../shared-lib/aws/functions');
const personLogger = require('../person-logger');

// eslint-disable-next-line consistent-return
const personProfileImage = async (parent, args, ctx) => {
  const { requestMeta } = ctx;
  try {
    const { profileImage } = parent;
    if (profileImage) {
      if (profileImage.startsWith(IMAGE_KEYS.PERSON_PROFILE_IMAGE)) {
        const url = await awsFunctions.generateGetCloudFrontSignedUrl(profileImage, requestMeta);
        return url;
      }
      return profileImage;
    }
    return null;
  } catch (error) {
    personLogger.error(`Error from personProfileImage > ${error}`, requestMeta);
  }
};

module.exports = personProfileImage;

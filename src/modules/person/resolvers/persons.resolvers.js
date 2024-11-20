const personProfileImage = require('../field-resolvers/person-profile-image');

const forgotPassword = require('./mutations/forgot-password');
const loginUser = require('./mutations/login-user');
const logout = require('./mutations/logout');
const refreshToken = require('./mutations/refresh-token');
const signUp = require('./mutations/sign-up');
const updatePassword = require('./mutations/update-password');
const updateUser = require('./mutations/update-user');
const getProfileImageUploadSignedUrl = require('./queries/get-profile-image-upload-signed-url');
const getProjectIdForUser = require('./queries/getProjectIdOfUser');
const getUserById = require('./queries/getUserById');
const getCurrentUser = require('./queries/me');

const resolvers = {
  Mutation: {
    signUp,
    loginUser,
    updateUser,
    forgotPassword,
    updatePassword,
    refreshToken,
    logout,
  },
  Query: {
    getCurrentUser,
    getProfileImageUploadSignedUrl,
    getProjectIdForUser,
    getUserById,
  },
  Person: {
    profileImage: personProfileImage,
  },
};

module.exports = resolvers;

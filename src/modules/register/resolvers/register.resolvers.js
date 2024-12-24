const { pubsub, pubsubEvents } = require('../../../pubsub');

const changeTemplateStatus = require('./mutation/change-template-status');
const cloneGlobalTemplate = require('./mutation/clone-global-template');
const createGlobalTemplate = require('./mutation/create-global-template');
const createTemplate = require('./mutation/create-template');
const deleteTemplate = require('./mutation/delete-template');
const editResponse = require('./mutation/editResponse');
const submitResponse = require('./mutation/submit-response');
const updateTemplate = require('./mutation/update-template');
const generateSignedUrl = require('./mutation/upload');
const getArchiveTemplatesByProject = require('./queries/archiveTemplatesByProject');
const getDraftTemplatesByProject = require('./queries/draftTemplatesByProject');
const getActivityLogsBySetId = require('./queries/getActivityLogsBySetId');
const getAllGlobalTemplate = require('./queries/getAllGlobalTemplate');
const getAllPropertyResponsesForTemplate = require('./queries/getAllPropertyResponsesForTemplate');
const getAllResponsesForTemplate = require('./queries/getAllResponsesForTemplate');
const getAllSetsForAllTemplates = require('./queries/getAllSets');
const getGlobalTemplateById = require('./queries/getGlobalTemplateById');
const getAllResponsesForSet = require('./queries/getResponseForSet');
const getTemplateById = require('./queries/getTemplate');
const getTemplateActivityLogsBytemplateId = require('./queries/getTemplateActivityLogs');
const getTemplateWithSoftDeleteById = require('./queries/getTemplateIncludingsoftDelete');
const getLiveTemplatesByProject = require('./queries/liveTemplatesByproject');

// const post = require('./queries/post');
// const posts = require('./queries/posts');

const resolvers = {
  Query: {
    getArchiveTemplatesByProject,
    getLiveTemplatesByProject,
    getDraftTemplatesByProject,
    getTemplateById,
    getAllResponsesForSet,
    getAllResponsesForTemplate,
    getTemplateWithSoftDeleteById,
    getAllPropertyResponsesForTemplate,
    getAllGlobalTemplate,
    getGlobalTemplateById,
    getAllSetsForAllTemplates,
    getActivityLogsBySetId,
    getTemplateActivityLogsBytemplateId,
  },
  Mutation: {
    createTemplate,
    updateTemplate,
    changeTemplateStatus,
    deleteTemplate,
    submitResponse,
    editResponse,
    createGlobalTemplate,
    cloneGlobalTemplate,
    generateSignedUrl,
  },

  Subscription: {
    postCreated: {
      subscribe: () => pubsub.asyncIterator(pubsubEvents.TEMPLATE_CREATED),
    },
  },
};

module.exports = resolvers;

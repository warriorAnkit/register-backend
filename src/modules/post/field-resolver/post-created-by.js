const postLogger = require('../post-logger');
// eslint-disable-next-line consistent-return
const postCreatedBy = async (parent, args, ctx) => {
  const { requestMeta } = ctx;
  try {
    const { createdBy } = parent;
    // USING DB QUERY
    // if (createdBy) {
    //   const author = await PersonModel.findByPk(createdBy);
    //   return author;
    // }
    // return null;

    // USING DATA LOADER
    const author = await ctx.dataSources.authorLoader.load(createdBy);
    return author;
  } catch (error) {
    postLogger.error(`Error from postCreatedBy > ${error}`, requestMeta);
  }
};

module.exports = postCreatedBy;

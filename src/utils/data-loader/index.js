const authorLoader = require('../../modules/post/data-loader/author-loader');

const dataSources = async () => {
  const sources = {
    authorLoader: await authorLoader(),
  };
  return sources;
};

module.exports = dataSources;

/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const Dataloader = require('dataloader');

const { models: { Person: PersonModel } } = require('../../../sequelize-client');

const authorLoader = async () => {
  let batchSize;
  const user = new Dataloader(async keys => {
    batchSize = keys.length;
    const authors = await PersonModel.findAll({ where: { id: keys }, raw: true });
    return authors;
  }, {
    cache: true, batch: true, maxBatchSize: batchSize,
  });
  return user;
};

module.exports = authorLoader;

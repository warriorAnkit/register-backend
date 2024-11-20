const app = require('express');

const { POSTS } = require('../../constants/api-constants');
const ordersRoutesV1 = require('../modules/posts/v1/routes');

const v1Routes = app.Router();

v1Routes.use(POSTS, ordersRoutesV1);

module.exports = v1Routes;

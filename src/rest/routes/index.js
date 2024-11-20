const app = require('express');

const { V1 } = require('../../constants/api-constants');

const v1Routes = require('./v1');

const restRoutes = app.Router();

restRoutes.use(V1, v1Routes);

module.exports = restRoutes;

const app = require('express');

const isAuthenticated = require('../../../middlewares/is-authenticated');
const rateLimiter = require('../../../middlewares/rate-limit');

const posts = require('./controllers/posts');

const postsRoutesV1 = app.Router();

postsRoutesV1.get('/', rateLimiter(), isAuthenticated, posts);

module.exports = postsRoutesV1;

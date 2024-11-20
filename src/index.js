require('dotenv').config();
const http = require('http');

const compression = require('compression');
const cors = require('cors');
const express = require('express');
const useragent = require('express-useragent');

const packageJson = require('../package.json');

const CONFIG = require('./config/config');
// eslint-disable-next-line no-unused-vars
const { GRAPHQL_INTROSPECTION_RESTRICTION } = require('./config/config');
const { VERSION_ROUTE, REST_API_PREFIX } = require('./constants/api-constants');
const errorHandler = require('./rest/middlewares/error-handler');
const setLocaleServiceInReq = require('./rest/middlewares/set-locale-service-in-req');
const setLogInfoInReq = require('./rest/middlewares/set-log-info-in-req');
const restRoutes = require('./rest/routes');
const sequelizeClient = require('./sequelize-client');
const Logger = require('./shared-lib/logger');
const startApolloServer = require('./start-apollo-server');
const getUser = require('./utils/auth/get-user');
const corsOptions = require('./utils/cors-options');
const i18n = require('./utils/intl/i18n-config');
const LocaleService = require('./utils/intl/locale-service');
// eslint-disable-next-line no-unused-vars
const introspectionRestrictionMiddleware = require('./utils/introspection-restriction-middleware');
const queryLengthMiddleware = require('./utils/query-length-middleware');

const app = express();

const logger = new Logger('index');
const localeService = new LocaleService(i18n);

app.use(compression());

app.use(useragent.express());

// CORS AND PARSERS
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PRE REQUEST EXECUTION MIDDLEWARES
app.use(setLogInfoInReq);
app.use(setLocaleServiceInReq(localeService));
app.use('*', queryLengthMiddleware);

// if (GRAPHQL_INTROSPECTION_RESTRICTION.ENABLED) {
//   app.use('*', introspectionRestrictionMiddleware);
// }

// APIS
app.get(`/${CONFIG.API_PREFIX_ROUTE}${VERSION_ROUTE}`, (req, res) => { res.json({ version: packageJson.version }); });
app.use(`/${CONFIG.API_PREFIX_ROUTE}${REST_API_PREFIX}`, restRoutes);

// POST REQUEST EXECUTION MIDDLEWARES
app.use(errorHandler);
app.use(async (req, res, next) => {
  const token = req.headers.authorization || '';
  try {
    if (token) {
      req.user = await getUser(token, localeService); // Ensure you pass localeService if needed
    } else {
      req.user = null; // No token, set user to null
    }
  } catch (error) {
    console.error('hii Authentication error:', error);
    req.user = null;
  }
  next();
});
// eslint-disable-next-line no-undef
initServer = async () => {
  try {
    const httpServer = http.createServer(app);
    startApolloServer(app, httpServer, localeService);
    await sequelizeClient.sequelize.sync();
    httpServer.listen(CONFIG.PORT, () => {
      logger.info(`🚀 Server ready at http://localhost:${CONFIG.PORT}/${CONFIG.API_PREFIX_ROUTE}/graphql`);
    });
    return true;
  } catch (error) {
    logger.error(error);
    return error;
  }
};

// eslint-disable-next-line no-undef
initServer();

module.exports = app;

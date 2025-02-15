const hpp = require('hpp');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const express = require('express');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const config = require('./src/config/config');
const mountRoute = require('./src/routes/routes');
const { env_mode } = require('./src/enums/common.enum');
const errorHandler = require('./src/middlewares/error.middleware');

const app = express();

if (config.NODE_ENV === env_mode.DEVELOPMENT) {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes 100 request 
  max: 100
});

if (config.NODE_ENV === env_mode.PRODUCTION) {
  app.use(limiter);
}

app.use(helmet()); // set security http headers
app.use(express.json()); // parse json request body
app.use(cookieParser()); // Cookie parser
app.use(express.urlencoded({ extended: true })); // parse urlencoded request body
app.use(hpp()); // prevent http parameter pollution
app.use(cors()); // enable cors

// mount routers
mountRoute(app);

// Handle error
app.use(errorHandler);

module.exports = app;



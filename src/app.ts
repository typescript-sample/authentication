import { merge } from 'config-plus';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express, { json } from 'express';
import { allow,loadTemplates, MiddlewareLogger } from 'express-ext';
import http from 'http';
import { createLogger } from 'logger-core';
import { connectToDb } from 'mongodb-extension';
import { Pool } from 'pg';
import { PoolManager } from 'pg-extension';
import { log } from 'query-core';
import { config, env } from './config';
import { useContext} from './context';
import { route } from './route';
import { buildTemplates, trim } from 'query-mappers';
dotenv.config();
const conf = merge(config, process.env, env, process.env.ENV);

const logger = createLogger(conf.log);
const middleware = new MiddlewareLogger(logger.info, conf.middleware);
const app = express();

app.use(allow(conf.allow), json(), cookieParser(), middleware.log);
const templates = loadTemplates(conf.template, buildTemplates, trim, ['../authentication/configs/query.xml']);
const pool = new Pool(conf.db.query_items);
const queryDB = new PoolManager(pool);
const db = log(new PoolManager(new Pool(conf.db.query_items)), true, logger, 'sql');
connectToDb(`${conf.db.authentication.uri}`, `${conf.db.authentication.db}`).then(mongodb => {
  connectToDb(`${conf.db.location.uri}`, `${conf.db.location.db}`).then(locationDB => {
    const ctx = useContext(mongodb, queryDB, logger, middleware, conf, db, locationDB);
    route(app, ctx);
    http.createServer(app).listen(conf.port, () => {
      console.log('Start server at port ' + conf.port);
    });
  });
});





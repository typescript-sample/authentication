import { merge } from 'config-plus';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express, { json } from 'express';
import { allow, MiddlewareLogger } from 'express-ext';
import http from 'http';
import { createLogger } from 'logger-core';
import { connectToDb } from 'mongodb-extension';
import { Pool } from 'pg';
import { PoolManager } from 'pg-extension';
import { config, env } from './config';
import { useContext } from './context';
import { route } from './route';

dotenv.config();
const conf = merge(config, process.env, env, process.env.ENV);

const logger = createLogger(conf.log);
const middleware = new MiddlewareLogger(logger.info, conf.middleware);
const app = express();
app.use(allow(conf.allow), json(), cookieParser(), middleware.log);

const pool = new Pool (conf.db.query); 
const db = new PoolManager(pool);
const poolMain = new Pool (conf.db.appreciation); 
const dbMain = new PoolManager(poolMain);
connectToDb(`${conf.mongo.uri}`, `${conf.mongo.db}`).then(mongodb => {
  const ctx = useContext(mongodb, db, logger, middleware, conf,dbMain);
  route(app, ctx);
  http.createServer(app).listen(conf.port, () => {
    console.log('Start mongo server at port ' + conf.port);
  });
});

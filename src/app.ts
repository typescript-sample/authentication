<<<<<<< HEAD
import { merge } from 'config-plus';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express, { json } from 'express';
import { allow, loadTemplates, MiddlewareLogger } from 'express-ext';
import http from 'http';
import { createLogger } from 'logger-core';
import { connectToDb } from 'mongodb-extension';
import { Pool } from 'pg';
import { PoolManager } from 'pg-extension';
import { log } from 'query-core';
import { buildTemplates, trim } from 'query-mappers';
import { config, env } from './config';
import { useContext} from './context';
import { route } from './route';

=======
import { merge } from "config-plus";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express, { json } from "express";
import { allow, loadTemplates, MiddlewareLogger } from "express-ext";
import http from "http";
import { createLogger } from "logger-core";
import { connectToDb } from "mongodb-extension";
import { Pool } from "pg";
import { PoolManager } from "pg-extension";
import { log } from "query-core";
import { buildTemplates, trim } from "query-mappers";
import { config, env } from "./config";
import { useContext } from "./context";
import { route } from "./route";
>>>>>>> 43d9f3467235546012afbf958749d9ad433c0c0a
dotenv.config();
const conf = merge(config, process.env, env, process.env.ENV);

const logger = createLogger(conf.log);
const middleware = new MiddlewareLogger(logger.info, conf.middleware);
const app = express();

app.use(allow(conf.allow), json(), cookieParser(), middleware.log);
const templates = loadTemplates(conf.template, buildTemplates, trim, [
  "./configs/query.xml",
]);
const pool = new Pool(conf.db.nothingtosay);
const queryDB = new PoolManager(pool);
<<<<<<< HEAD
const db = log(new PoolManager(new Pool(conf.db.query_items)), true, logger, 'postgres');
connectToDb(`${conf.db.authentication.uri}`, `${conf.db.authentication.db}`).then(mongodb => {
  connectToDb(`${conf.db.location.uri}`, `${conf.db.location.db}`).then(locationDB => {
    const ctx = useContext(mongodb, queryDB, logger, middleware, conf, db, locationDB, templates);
    route(app, ctx);
    http.createServer(app).listen(conf.port, () => {
      console.log('Start server at port ' + conf.port);
=======
const db = log(
  new PoolManager(new Pool(conf.db.nothingtosay)),
  true,
  logger,
  "sql"
);

//test
pool.connect().then((client) => {
  client
    .query("select $1::text as name", ["pg-pool"])
    .then((res) => {
      client.release();
      console.log("hello from", res.rows[0].name);
    })
    .catch((e) => {
      client.release();
      console.error("query error", e.message, e.stack);
>>>>>>> 43d9f3467235546012afbf958749d9ad433c0c0a
    });
});

connectToDb(
  `${conf.db.authentication.uri}`,
  `${conf.db.authentication.db}`
).then((mongodb) => {
  connectToDb(`${conf.db.location.uri}`, `${conf.db.location.db}`).then(
    (locationDB) => {
      const ctx = useContext(
        mongodb,
        queryDB,
        logger,
        middleware,
        conf,
        db,
        locationDB,
        templates
      );
      route(app, ctx);
      http.createServer(app).listen(conf.port, () => {
        console.log("Start server at port " + conf.port);
      });
    }
  );
});


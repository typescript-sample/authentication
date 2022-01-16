import { MongoUserRepository } from 'authen-mongo';
import { AuthConfig, Authenticator, AuthInfo, initializeStatus } from 'authen-service';
import { compare } from 'bcrypt';
import { HealthController, LogController, Logger, Middleware, MiddlewareController, resources } from 'express-ext';
import { generate } from 'jsonwebtoken-plus';
import { Db } from 'mongodb';
import { MongoChecker } from 'mongodb-extension';
import { createValidator } from 'xvalidators';
import { AuthenticationController } from './auth';
import { UserController, useUserController } from './user';

resources.createValidator = createValidator;

export interface Config {
  cookie?: boolean;
  auth: AuthConfig;
}
export interface ApplicationContext {
  health: HealthController;
  log: LogController;
  middleware: MiddlewareController;
  authentication: AuthenticationController<AuthInfo>;
  user: UserController;
}
export function useContext(db: Db, logger: Logger, midLogger: Middleware, conf: Config): ApplicationContext {
  const log = new LogController(logger);
  const middleware = new MiddlewareController(midLogger);
  const mongoChecker = new MongoChecker(db);
  const health = new HealthController([mongoChecker]);

  const auth = conf.auth;
  const status = initializeStatus(conf.auth.status);
  const userRepository = new MongoUserRepository(db, conf.auth.db, auth.userStatus);
  const authenticator = new Authenticator(status, compare, generate, auth.token, auth.payload, auth.account, userRepository, undefined, auth.lockedMinutes, auth.maxPasswordFailed);
  const authentication = new AuthenticationController(logger.error, authenticator.authenticate, conf.cookie);

  const user = useUserController(logger.error, db);

  return { health, log, middleware, authentication, user };
}

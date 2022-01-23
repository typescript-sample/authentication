import { AuthenticationController } from 'authen-express';
import { MongoUserRepository } from 'authen-mongo';
import { AuthConfig, Authenticator, initializeStatus, User } from 'authen-service';
import { compare } from 'bcrypt';
import { Comparator } from 'bcrypt-plus';
import { RC4Encrypter } from 'crypto-plus';
import { HealthController, LogController, Logger, Middleware, MiddlewareController, resources } from 'express-ext';
import { generate as generateToken } from 'jsonwebtoken-plus';
import { Db } from 'mongodb';
import { MongoChecker } from 'mongodb-extension';
import { PasscodeRepository } from 'passcode-mongo';
import { MailConfig, SendGridMailService } from 'sendgrid-plus';
import { SignupController } from 'signup-express';
import { useRepository } from 'signup-mongo';
import { generate, initStatus, MailSender, Signup, SignupMailConf, SignupService, Validator } from 'signup-service';
import { v4 as uuidv4 } from 'uuid';
import { createValidator } from 'xvalidators';
import { UserController, useUserController } from './user';

resources.createValidator = createValidator;

export interface Config {
  cookie?: boolean;
  secret: string;
  auth: AuthConfig;
  signup: SignupMailConf;
  mail: MailConfig;
}
export interface ApplicationContext {
  health: HealthController;
  log: LogController;
  middleware: MiddlewareController;
  authentication: AuthenticationController<User>;
  signup: SignupController<Signup>;
  user: UserController;
}
export function useContext(db: Db, logger: Logger, midLogger: Middleware, conf: Config): ApplicationContext {
  const log = new LogController(logger);
  const middleware = new MiddlewareController(midLogger);
  const mongoChecker = new MongoChecker(db);
  const health = new HealthController([mongoChecker]);

  const encrypter = new RC4Encrypter(conf.secret);
  const auth = conf.auth;
  const status = initializeStatus(conf.auth.status);
  const userRepository = new MongoUserRepository(db, conf.auth.db, auth.userStatus);
  const authenticator = new Authenticator(status, compare, generateToken, auth.token, auth.payload, auth.account, userRepository, undefined, auth.lockedMinutes, auth.maxPasswordFailed);
  const authentication = new AuthenticationController(logger.error, authenticator.authenticate, conf.cookie);

  const mailService = new SendGridMailService(conf.mail.key);
  const mailSender = new MailSender(conf.signup.url, mailService.send, conf.mail.from, conf.signup.email.body, conf.signup.email.subject);
  const signupRepository = useRepository<string, Signup>(db, 'user', 'authentication', conf.signup.userStatus, conf.signup.fields, conf.signup.maxPasswordAge, conf.signup.track, conf.signup.map);
  const passcodeRepository = new PasscodeRepository<string>(db.collection('signupCode'));
  const validator = new Validator();
  const comparator = new Comparator();
  const signupStatus = initStatus(conf.signup.status);
  const signupService = new SignupService<string, Signup>(signupStatus, signupRepository, generateId, comparator, comparator, passcodeRepository, mailSender.send, generate, conf.signup.expires, validator.validate);
  const signup = new SignupController(logger.error, signupService, encrypter.decrypt);

  const user = useUserController(logger.error, db);

  return { health, log, middleware, authentication, signup, user };
}
const reg = /-/g;
export function generateId(): string {
  const s = uuidv4();
  return s.replace(reg, '');
}

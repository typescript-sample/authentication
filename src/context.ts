import { Storage } from '@google-cloud/storage';
import { AuthenticationController } from 'authen-express';
import { MongoUserRepository } from 'authen-mongo';
import { Authenticator, AuthTemplateConfig, CodeMailSender, initializeStatus, User } from 'authen-service';
import { compare } from 'bcrypt';
import { Comparator } from 'bcrypt-plus';
import { HealthController, LogController, Logger, Middleware, MiddlewareController, resources } from 'express-ext';
import { deleteFile, GoogleStorageService, map, StorageConfig } from 'google-storage';
import { generateToken } from 'jsonwebtoken-plus';
import { MailConfig, MailService, Send } from 'mail-core';
import { Db } from 'mongodb';
import { MongoChecker } from 'mongodb-extension';
import nodemailer from 'nodemailer';
import { PasscodeRepository } from 'passcode-mongo';
import { PasswordController } from 'password-express';
import { usePasswordRepository } from 'password-mongo';
import { MailSender, PasswordService, PasswordTemplateConfig } from 'password-service';
import { SendGridMailService } from 'sendgrid-plus';
import { SignupController } from 'signup-express';
import { useRepository } from 'signup-mongo';
import { initStatus, Signup, SignupSender, SignupService, SignupTemplateConfig, Validator } from 'signup-service';
import { v4 as uuidv4 } from 'uuid';
import { createValidator } from 'xvalidators';
import { MyProfileController, StorageConf, useMyProfileController, UserSettings } from './my-profile';
import { UserController, useUserController } from './user';
resources.createValidator = createValidator;
const shortid = require('shortid');
export interface Config {
  cookie?: boolean;
  secret: string;
  auth: AuthTemplateConfig;
  signup: SignupTemplateConfig;
  password: PasswordTemplateConfig;
  mail: MailConfig;
  settings: UserSettings;
  bucket: string;
  storage: StorageConf;
}
export interface ApplicationContext {
  health: HealthController;
  log: LogController;
  middleware: MiddlewareController;
  authentication: AuthenticationController<User>;
  signup: SignupController<Signup>;
  password: PasswordController;
  myprofile: MyProfileController;
  user: UserController;
}

export function useContext(db: Db, logger: Logger, midLogger: Middleware, conf: Config): ApplicationContext {
  const log = new LogController(logger);
  const middleware = new MiddlewareController(midLogger);
  const mongoChecker = new MongoChecker(db);
  const health = new HealthController([mongoChecker]);
  const sendMail = useSend(conf.mail);
  const comparator = new Comparator();

  // const encrypter = new RC4Encrypter(conf.secret);
  const auth = conf.auth;
  const status = initializeStatus(conf.auth.status);
  const codeMailSender = new CodeMailSender(sendMail, conf.mail.from, conf.auth.template.body, conf.auth.template.subject);
  const verifiedCodeRepository = new PasscodeRepository<string>(db.collection('authenCode'));
  const userRepository = new MongoUserRepository(db, conf.auth.db, auth.userStatus, auth.account);
  const authenticator = new Authenticator(status, compare, generateToken, auth.token, auth.payload, auth.account, userRepository, undefined, auth.lockedMinutes, auth.maxPasswordFailed, codeMailSender.send, conf.auth.expires, verifiedCodeRepository, comparator.hash, hasTwoFactors);
  const authentication = new AuthenticationController(logger.error, authenticator.authenticate, conf.cookie);

  const signupMailSender = new SignupSender(conf.signup.url, sendMail, conf.mail.from, conf.signup.template.body, conf.signup.template.subject);
  const passcodeRepository = new PasscodeRepository<string>(db.collection('signupCode'));
  const signupRepository = useRepository<string, Signup>(db, 'user', 'authentication', conf.signup.userStatus, conf.signup.fields, conf.signup.maxPasswordAge, conf.signup.track, conf.signup.map);
  const validator = new Validator();
  const signupStatus = initStatus(conf.signup.status);
  const signupService = new SignupService<string, Signup>(signupStatus, signupRepository, generateId, comparator, comparator, passcodeRepository, signupMailSender.send, conf.signup.expires, validator.validate);
  const signup = new SignupController(logger.error, signupService);

  const passwordMailSender = new MailSender(sendMail, conf.mail.from, conf.password.templates.reset.body, conf.password.templates.reset.subject);
  const codeRepository = new PasscodeRepository<string>(db.collection('passwordCode'));
  const passwordRepository = usePasswordRepository<string>(db, conf.password.db, conf.password.max, conf.password.fields);
  const passwordService = new PasswordService<string>(comparator, passwordRepository, passwordMailSender.send, conf.password.expires, codeRepository, conf.password.max, undefined);
  const password = new PasswordController(logger.error, passwordService);

  const user = useUserController(logger.error, db);

  const storageConfig: StorageConfig = { bucket: conf.bucket, public: true };
  const storage = new Storage();
  const bucket = storage.bucket(conf.bucket);
  const storageService = new GoogleStorageService(bucket, storageConfig, map);
  const myprofile = useMyProfileController(logger.error, db, conf.settings, conf.storage, storageService, deleteFile,generateShortId);
  return { health, log, middleware, authentication, signup, password, myprofile, user };
}
const reg = /-/g;
export function generateId(): string {
  const s = uuidv4();
  return s.replace(reg, '');
}

export function generateShortId():string{
  return shortid.generate()
}

export function hasTwoFactors(userId: string): Promise<boolean> {
  return Promise.resolve(false);
}
export function useSend(conf: MailConfig): Send {
  if (conf.provider === 'sendgrid') {
    return new SendGridMailService(conf.key).send;
  } else {
    const transporter = nodemailer.createTransport(conf.smtp);
    return new MailService(transporter).send;
  }
}

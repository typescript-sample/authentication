import { Storage } from '@google-cloud/storage';
import { AuthenticationController } from 'authen-express';
import { MongoUserRepository } from 'authen-mongo';
import { Authenticator, AuthTemplateConfig, CodeMailSender, initializeStatus, User } from 'authen-service';
import { compare } from 'bcrypt';
import { Comparator } from 'bcrypt-plus';
import { HealthController, LogController, Logger, Middleware, MiddlewareController, QueryController, resources, useBuild ,ModelConfig} from 'express-ext';
import { deleteFile, GoogleStorageRepository, map, StorageConfig, useBuildUrl } from 'google-storage';
import { generateToken } from 'jsonwebtoken-plus';
import { MailConfig, MailService, Send } from 'mail-core';
import { Db } from 'mongodb';
import { MongoChecker } from 'mongodb-extension';
import nodemailer from 'nodemailer';
import { ModelConf, StorageConf } from 'one-storage';

import { PasscodeRepository } from 'passcode-mongo';
import { PasswordController } from 'password-express';
import { usePasswordRepository } from 'password-mongo';
import { MailSender, PasswordService, PasswordTemplateConfig } from 'password-service';
import { DB, StringService } from 'pg-extension';
import { SendGridMailService } from 'sendgrid-plus';
import shortid from 'shortid';
import { SignupController } from 'signup-express';
import { useRepository } from 'signup-mongo';
import { initStatus, Signup, SignupSender, SignupService, SignupTemplateConfig, Validator } from 'signup-service';
import { createValidator } from 'xvalidators';
import { AppreciationController, AppreciationReplyController, useAppreciationController, useAppreciationReplyController } from './appreciation';
import { ArticleController, useArticleController } from './article';
import { LocationController, LocationRateController, useLocationController, useLocationRateController } from './location';
import { ArticleController as MyArticleController, useMyArticleController } from './my-articles';

import { MyProfileController, useMyProfileController, UserSettings } from './my-profile';
import { UserController, useUserController } from './user';
resources.createValidator = createValidator;

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
  model: ModelConf;
  modelAppreciation: ModelConfig;
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
  skill: QueryController<string[]>;
  interest: QueryController<string[]>;
  lookingFor: QueryController<string[]>;
  appreciation: AppreciationController;
  location: LocationController;
  rate: LocationRateController;
  article: ArticleController;
  myarticles: MyArticleController;
  appreciationReply:AppreciationReplyController;
}

export function useContext(
  db: Db,
  queryDB: DB,
  logger: Logger,
  midLogger: Middleware,
  conf: Config,
  mainDB: DB,
  locationDB: Db,
): ApplicationContext {
  const log = new LogController(logger);
  const middleware = new MiddlewareController(midLogger);
  const mongoChecker = new MongoChecker(db);
  const health = new HealthController([mongoChecker]);
  const sendMail = useSend(conf.mail);
  const comparator = new Comparator();

  // const encrypter = new RC4Encrypter(conf.secret);
  const auth = conf.auth;
  const status = initializeStatus(conf.auth.status);
  const codeMailSender = new CodeMailSender(
    sendMail,
    conf.mail.from,
    conf.auth.template.body,
    conf.auth.template.subject
  );
  const verifiedCodeRepository = new PasscodeRepository<string>(
    db.collection('authenCode')
  );
  const userRepository = new MongoUserRepository(
    db,
    conf.auth.db,
    auth.userStatus,
    auth.account
  );
  const authenticator = new Authenticator(
    status,
    compare,
    generateToken,
    auth.token,
    auth.payload,
    auth.account,
    userRepository,
    undefined,
    auth.lockedMinutes,
    auth.maxPasswordFailed,
    codeMailSender.send,
    conf.auth.expires,
    verifiedCodeRepository,
    comparator.hash,
    hasTwoFactors
  );
  const authentication = new AuthenticationController(
    logger.error,
    authenticator.authenticate,
    conf.cookie
  );

  const signupMailSender = new SignupSender(
    conf.signup.url,
    sendMail,
    conf.mail.from,
    conf.signup.template.body,
    conf.signup.template.subject
  );
  const passcodeRepository = new PasscodeRepository<string>(
    db.collection('signupCode')
  );
  const signupRepository = useRepository<string, Signup>(
    db,
    'user',
    'authentication',
    conf.signup.userStatus,
    conf.signup.fields,
    conf.signup.maxPasswordAge,
    conf.signup.track,
    conf.signup.map
  );
  const validator = new Validator();
  const signupStatus = initStatus(conf.signup.status);
  const signupService = new SignupService<string, Signup>(
    signupStatus,
    signupRepository,
    generate,
    comparator,
    comparator,
    passcodeRepository,
    signupMailSender.send,
    conf.signup.expires,
    validator.validate
  );
  const signup = new SignupController(logger.error, signupService);

  const passwordMailSender = new MailSender(
    sendMail,
    conf.mail.from,
    conf.password.templates.reset.body,
    conf.password.templates.reset.subject
  );
  const codeRepository = new PasscodeRepository<string>(
    db.collection('passwordCode')
  );
  const passwordRepository = usePasswordRepository<string>(
    db,
    conf.password.db,
    conf.password.max,
    conf.password.fields
  );
  const passwordService = new PasswordService<string>(
    comparator,
    passwordRepository,
    passwordMailSender.send,
    conf.password.expires,
    codeRepository,
    conf.password.max,
    undefined
  );
  const build = useBuild(conf.modelAppreciation, generate);
  const password = new PasswordController(logger.error, passwordService);

  const user = useUserController(logger.error, db);

  const skillService = new StringService('skills', 'skill', queryDB.query, queryDB.exec);
  const skill = new QueryController<string[]>(logger.error, skillService.load, 'keyword');
  const interestService = new StringService('interests', 'interest', queryDB.query, queryDB.exec);
  const interest = new QueryController<string[]>(logger.error, interestService.load, 'keyword');
  const lookingForService = new StringService('searchs', 'item', queryDB.query, queryDB.exec);
  const lookingFor = new QueryController<string[]>(logger.error, interestService.load, 'keyword');

  const appreciation = useAppreciationController(logger.error, mainDB,undefined,build);
  const appreciationReply = useAppreciationReplyController(logger.error, mainDB,undefined,build);

  const storageConfig: StorageConfig = { bucket: conf.bucket, public: true };
  const storage = new Storage();
  const bucket = storage.bucket(conf.bucket);
  const storageRepository = new GoogleStorageRepository(bucket, storageConfig, map);
  const sizesCover: number[] = [576, 768];
  const sizesImage: number[] = [40, 400];
  const myprofile = useMyProfileController(logger.error, db, conf.settings, storageRepository, deleteFile, generate, useBuildUrl(conf.bucket), skillService.save, interestService.save, lookingForService.save, sizesCover, sizesImage, undefined, conf.model);

  const location = useLocationController(logger.error, locationDB);
  const rate = useLocationRateController(logger.error, locationDB);
  const article = useArticleController(logger.error, locationDB);
  const myarticles = useMyArticleController(logger.error, locationDB);

  return {
    health, log, middleware, authentication, signup, password,
    myprofile, user, skill, interest, lookingFor, appreciation,
    location, rate, article, myarticles,appreciationReply
  };
}
export function generate(): string {
  return shortid.generate();
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

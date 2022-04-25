import { AuthenticationController } from 'authen-express';
import { MongoUserRepository } from 'authen-mongo';
import { Authenticator, AuthTemplateConfig, CodeMailSender, initializeStatus, User } from 'authen-service';
import { compare } from 'bcrypt';
import { Comparator } from 'bcrypt-plus';
import { HealthController, LogController, Logger, Middleware, MiddlewareController, resources } from 'express-ext';
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
import { MyProfileController, useMyProfileController, UserSettings } from './my-profile';
import { UserController, useUserController } from './user';
import { GoogleStorageService, StorageConfig, map } from 'google-storage';
import { Storage } from '@google-cloud/storage';
resources.createValidator = createValidator;

export interface Config {
  cookie?: boolean;
  secret: string;
  auth: AuthTemplateConfig;
  signup: SignupTemplateConfig;
  password: PasswordTemplateConfig;
  mail: MailConfig;
  settings: UserSettings;
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

// const credentials = {
//   type: 'service_account',
//   project_id: 'go-firestore-rest-api',
//   private_key_id: '0227f21f734620a0a04a3882249f3b1cb1ab634a',
//   private_key:
//     '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCrzi/hC6NsGZyR\nc2rurmpACAn5FggHjrUshXCqbsoQUPvrMhTEPQk56hQdHNlMl+ZNue94Cv7D3LCR\nlHu68XOsPAhnx21LHPsMplIobjnXWn+fD+Ow6zvHp9RalS40PrVYS1uuIVYjeets\n8dtdFB3G9ka7Zv8oz4WBN4S18sXsV702OaBMo2IwfArTk2DCY6KYqcNEVde0sd/q\nH6pK1GvDPkgbtcklk5fUgkNz61nufnqYujsnx57GuDT9ZbreAcYTB5/hRcgMjyM6\n8tgYXdjmJLFdTsMABT/YsQ0OmDDwhVQrc0CixZtzMXg+jLRxKZuHELQ+nkJCKJBi\nTtQJ1f+dAgMBAAECggEACdL2+uvi8uX+BXUvmqlfivzKsTMYz3HSG1MgD6bZKBix\nZxAMjvIcinK/prCFHnObKDunHVqnmcSPVivC7XwsDJ+8LU8CiWaFVoJWNVikNxPG\nM27BqtawquiGZI2eQD+LuBpLCkh+t/WbSDYGQKrLTxq7DbFEiu1e6XYmwQ66UZrU\ny1U7YuRw2ML+6BiHaSdq3FH3wvBbsAfwZoNnqdqTjaj01EkNsi/lOmFXHY8gPOA1\nGRI20R4KhRkctIC4ZztXg50bRzuIkz+YX57F36kEqpLaXePUQ/pHWg+76rsCd2dD\nIrcQF8Y+Hbp4eP+7CBu3AUltOzuNeC6h69B8MKCrowKBgQDTCrzCD0SThL+6NcPR\njzwFydDbapfgzGYvleEOEUTy2akAdydrcAHlMDcuUZv7xyjam5CVS/B4vLRynl6J\n8KHkdAuU8ZLESdnfo2X9GgJWBw/RK6spebEcslWINVJWwWWsQrtjMr58WVS4hWAE\nxBIKumhf5/EICZW+BueT3j0WtwKBgQDQZ6tFc3OGE0YFVIQkalQd751dsgtjQhVZ\n4huwzaUZdtFlNJm1B6yVn9ksGAM2q0iCxDQBPOM7AF+nEpeBz+pMmdpWiOb6sKC6\nVoqIgts7lNMp2h4kJLUePgWVarbuACS1VX3qSpqdcklaAi+5WnObzC8bsmaLbZxp\nmpk4gvpoSwKBgEjoj7d3MNjJ5ra89k6CblkNlNMIqzmlQ7Qy0lJa0vgXDBS2FW8/\nfdgg5R9iYEIGVu3XCocZehUsFCb44W5ELJnRIWMuZebcIKHrQEPFZYM041j+/h3R\nBcgFMBljWnPQUoDFeRlXIYmyDtvEcByVZCpCpeZkKdf9/7ZrijuCbpZXAoGARY4k\nEoTqzJfIKeVASSsXsfoUCn5u4IzgtWQKm+K2tJ38WwvINSw/hJyaDeZhxDA8fjBf\nrv4UVM/WHNvOpyuuZix/O5xrgsXKjwZtLAyIgQU1yOUcZDHAJTzL/kdkkGCJ39+N\nq9GEcwH+y0SpivJOXXQzUMolAWnu5ywK8Vp9mqsCgYBaCkZuQ3xMkWPSYWwJ2mpq\nBrH0Zpk3ddDGo63w97C9z7zX6tIP1uxVvKVGA3LQPaj8Zvbuks8DYWV8a/6RGIP/\nTH5On0uX/VNkI1Wk9R3tstyzz7MRaBAHQOt26/le/XOptcJXWB29uKEJPpq/sfHb\nx66rIAZO4BgLcslDTj3Y2g==\n-----END PRIVATE KEY-----\n',
//   client_email: 'go-firestore-rest-api@appspot.gserviceaccount.com',
//   client_id: '106958727954036268529',
//   auth_uri: 'https://accounts.google.com/o/oauth2/auth',
//   token_uri: 'https://oauth2.googleapis.com/token',
//   auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
//   client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/go-firestore-rest-api%40appspot.gserviceaccount.com',
// };


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

  const storageConfig: StorageConfig = { bucket: 'go-firestore-rest-api.appspot.com', public: true };
  const storage = new Storage();
  const bucket = storage.bucket('go-firestore-rest-api.appspot.com');
  const storageService = new GoogleStorageService(bucket, storageConfig, map);
  const myprofile = useMyProfileController(logger.error, db, conf.settings, storageService);
  return { health, log, middleware, authentication, signup, password, myprofile, user };
}
const reg = /-/g;
export function generateId(): string {
  const s = uuidv4();
  return s.replace(reg, '');
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

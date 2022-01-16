import { Controller } from 'express-ext';
import { Db } from 'mongodb';
import { buildQuery, Repository, SearchBuilder } from 'mongodb-extension';
import { Log, Manager, Search } from 'onecore';
import { User, UserFilter, userModel, UserRepository, UserService } from './user';
export * from './user';

export class MongoUserRepository extends Repository<User, string> implements UserRepository {
  constructor(db: Db) {
    super(db, 'user', userModel);
  }
}
export class UserManager extends Manager<User, string, UserFilter> implements UserService {
  constructor(search: Search<User, UserFilter>, repository: UserRepository) {
    super(search, repository);
  }
}
export class UserController extends Controller<User, string, UserFilter> {
  constructor(log: Log, service: UserService) {
    super(log, service);
  }
}

export function useUserService(db: Db): UserService {
  const builder = new SearchBuilder<User, UserFilter>(db, 'user', buildQuery, userModel);
  const repository = new MongoUserRepository(db);
  return new UserManager(builder.search, repository);
}
export function useUserController(log: Log, db: Db): UserController {
  return new UserController(log, useUserService(db));
}

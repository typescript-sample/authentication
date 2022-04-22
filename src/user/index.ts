import { Db } from 'mongodb';
import { buildQuery, SearchBuilder } from 'mongodb-extension';
import { Log, ViewManager } from 'onecore';
import { query } from './mongo-query';
import { MongoUserRepository } from './mongo-user-repository';
import { User, UserFilter, userModel, UserRepository, UserService } from './user';
import { UserController } from './user-controller';
export * from './user';
export * from './user-controller';

export class UserManager extends ViewManager<User, string> implements UserService {
  constructor(repository: UserRepository) {
    super(repository);
  }
}

export function useUserController(log: Log, db: Db): UserController {
  const builder = new SearchBuilder<User, UserFilter>(db, 'user', query, userModel);
  const repository = new MongoUserRepository(db);
  return new UserController(log, builder.search, repository);
}

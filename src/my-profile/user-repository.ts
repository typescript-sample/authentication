import { Db } from 'mongodb';
import { Repository } from 'mongodb-extension';
import { User, userModel, UserRepository } from './user';

export class MongoUserRepository extends Repository<User, string> implements UserRepository {
  constructor(db: Db) {
    super(db, 'user', userModel);
  }
}

import { Db } from 'mongodb';
import { Log } from 'onecore';
import { MyProfileService, User, UserRepository, UserSettings } from './user';
import { MyProfileController } from './user-controller';
import { MongoUserRepository } from './user-repository';

export { MyProfileController } ;

export class MyProfileManager implements MyProfileService {
  constructor(private repository: UserRepository) {
  }
  getMyProfile(id: string): Promise<User | null> {
    return this.repository.load(id).then(user => {
      if (user) {
        delete (user as any)['settings'];
      }
      return user;
    });
  }
  getMySettings(id: string): Promise<UserSettings | null> {
    return this.repository.load(id).then(user => user ? user.settings : null);
  }
}

export function useMyProfileService(db: Db): MyProfileService {
  const repository = new MongoUserRepository(db);
  return new MyProfileManager(repository);
}
export function useMyProfileController(log: Log, db: Db): MyProfileController {
  return new MyProfileController(log, useMyProfileService(db));
}

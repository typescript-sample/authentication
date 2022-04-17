import { Db } from 'mongodb';
import { Log } from 'onecore';
import { clone } from 'signup-mongo';
import { MongoUserRepository } from './mongo-user-repository';
import { MyProfileService, User, UserRepository, UserSettings } from './user';
import { MyProfileController } from './user-controller';

export * from './user';
export { MyProfileController };

export class MyProfileManager implements MyProfileService {
  constructor(private repository: UserRepository, private settings: UserSettings) {
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
    return this.repository.load(id).then(user => user && user.settings ? user.settings : clone(this.settings));
  }
  saveMyProfile(user: User): Promise<number> {
    return this.repository.patch(user);
  }
  saveMySettings(id: string, settings: UserSettings): Promise<number> {
    const user: any = {id, settings};
    return this.repository.patch(user);
  }
}

export function useMyProfileService(db: Db, settings: UserSettings): MyProfileService {
  const repository = new MongoUserRepository(db);
  return new MyProfileManager(repository, settings);
}
export function useMyProfileController(log: Log, db: Db, settings: UserSettings): MyProfileController {
  return new MyProfileController(log, useMyProfileService(db, settings));
}

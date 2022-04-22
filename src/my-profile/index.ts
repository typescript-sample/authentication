import { GoogleStorageService } from 'google-storage';
import { Db } from 'mongodb';
import { Log } from 'onecore';
import { clone } from 'signup-mongo';
import { MongoUserRepository } from './mongo-user-repository';
import { MyProfileService, User, UserRepository, UserSettings } from './user';
import { MyProfileController } from './user-controller';

export * from './user';
export { MyProfileController };

export class MyProfileManager implements MyProfileService {
  constructor(private repository: UserRepository, private settings: UserSettings, private googleService: GoogleStorageService) {
    this.uploadFile=this.uploadFile.bind(this)
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
    return this.repository.patch!(user);
  }
  saveMySettings(id: string, settings: UserSettings): Promise<number> {
    const user: any = { id, settings };
    return this.repository.patch!(user);
  }

  async uploadFile(id: string, source: string, type: string, name: string,
    fileBuffer: Buffer): Promise<string> {
    try {
      const user = await this.repository.load(id)
      const fileName = user?.uploadCover?.url.split("/") ?? []
      const rs = await this.googleService.delete("media", fileName[fileName.length - 1] ?? '')
      return this.googleService.upload("media", name, fileBuffer)
        .then((result) => {
          return this.repository.load(id).then((user) => {
            if (user) {
              user.uploadCover = { source, type, url: result };
              return this.repository.update(user).then(() => result);
            } else {
              return "error";
            }
          });
        })
        .catch((err) => {
          throw err;
        });
    }
    catch (error) {
      console.log(error)
      return new Promise(resolve => resolve('error'))
    }
  }
}

export function useMyProfileService(db: Db, settings: UserSettings, googleService: GoogleStorageService): MyProfileService {
  const repository = new MongoUserRepository(db);
  return new MyProfileManager(repository, settings, googleService);
}
export function useMyProfileController(log: Log, db: Db, settings: UserSettings, googleService: GoogleStorageService): MyProfileController {
  return new MyProfileController(log, useMyProfileService(db, settings, googleService));
}

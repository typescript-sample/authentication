import { GoogleStorageService } from 'google-storage';
import { Db } from 'mongodb';
import { Log } from 'onecore';
import { clone } from 'signup-mongo';
import { MongoUserRepository } from './mongo-user-repository';
import { MyProfileService, UploadInfo, User, UserRepository, UserSettings } from './user';
import { MyProfileController } from './user-controller';

export * from './user';
export { MyProfileController };

export class MyProfileManager implements MyProfileService {
  constructor(private repository: UserRepository, private settings: UserSettings, private googleService: GoogleStorageService) {
    this.uploadFile = this.uploadFile.bind(this)
    this.deleteFile = this.deleteFile.bind(this)
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

  async uploadFile({ id, source, type, name,
    fileBuffer }: UploadInfo): Promise<boolean> {


    const user = await this.repository.load(id)
    const fileName = user?.uploadCover?.url.split("/") ?? ['']
    if (fileName.length >= 1 && fileName[fileName.length - 1] !== '')
      await this.googleService.delete("media", fileName[fileName.length - 1])
    return this.googleService.upload("media", name, fileBuffer)
      .then(async (result) => {
        return this.repository.load(id).then(async (user) => {
          if (user) {
            user.uploadCover = { source, type, url: result };
            const update = await this.repository.update(user) === 1 ? true : false;
            return update
          } else {
            return false;
          }
        });
      })
      ;
  }

  async deleteFile(url: string
  ): Promise<boolean> {
    const fileName = url.split("/") ?? ['']
    try {
      const rs = await this.googleService.delete("media", fileName[fileName.length - 1])
      return rs
    }
    catch (error) {
      console.log(error)
      return new Promise(resolve => resolve(false))
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

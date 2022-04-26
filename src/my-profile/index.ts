import { GoogleStorageService } from 'google-storage';
import { Db } from 'mongodb';
import { Log } from 'onecore';
import { clone } from 'signup-mongo';
import { MongoUserRepository } from './mongo-user-repository';
import { FileUploads, MyProfileService, UploadGallery, UploadInfo, User, UserRepository, UserSettings } from './user';
import { MyProfileController } from './user-controller';

export * from './user';
export { MyProfileController };

export class MyProfileManager implements MyProfileService {
  constructor(private repository: UserRepository, private settings: UserSettings, private googleService: GoogleStorageService) {
    this.uploadFileCover = this.uploadFileCover.bind(this)
    this.deleteFile = this.deleteFile.bind(this)
    this.uploadFileGallery = this.uploadFileGallery.bind(this)
    this.patchDataGallery = this.patchDataGallery.bind(this)
    this.deleteDataGallery = this.deleteDataGallery.bind(this)
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
    const user: any = { id, settings };
    return this.repository.patch(user);
  }

  async deleteFile(url: string): Promise<boolean> {
    const fileName = url.split('/') ?? [];
    try {
      return await this.googleService.delete(fileName[fileName.length - 2] ?? '', fileName[fileName.length - 1] ?? '');
    } catch (error) {
      return new Promise(resolve => resolve(false));
    }
  }

  async uploadFileCover({ id, source, name,
    fileBuffer }: UploadInfo): Promise<boolean> {
    try {
      const user = await this.repository.load(id);
      if (!user) {
        return false;
      }
      await this.deleteFile(user.uploadCover?.url ?? '')
      const result = await this.googleService.upload('coverPhoto', name, fileBuffer);
      user.uploadCover = { source, url: result };
      const update = await this.repository.update(user);
      return update === 1 ? true : false;
    } catch (error) {
      console.log(error);
      return new Promise(resolve => resolve(false));
    }
  }
  async uploadFileGallery({ id, source, name, type,
    fileBuffer }: UploadGallery): Promise<boolean> {
    try {
      const user = await this.repository.load(id);
      if (!user) {
        return false;
      }
      const result = await this.googleService.upload('gallery', name, fileBuffer);
      user.uploadGallery = user.uploadGallery ? user.uploadGallery : []
      user.uploadGallery.push({ source, url: result, type });
      const update = await this.repository.update(user);
      return update === 1 ? true : false;
    } catch (error) {
      console.log(error);
      return new Promise(resolve => resolve(false));
    }
  }

  async patchDataGallery(id: string, data: FileUploads[]): Promise<boolean> {
    const user = await this.repository.load(id);
    if (!user) {
      return false;
    }
    user.uploadGallery = data;
    const update = await this.repository.update(user);
    return update === 1 ? true : false;
  }

  async deleteDataGallery(id: string, url: string): Promise<boolean> {
    const user = await this.repository.load(id);
    if (!user) {
      return false;
    }
    user.uploadGallery = user.uploadGallery?.filter(upload => upload.url !== url)
    const update = await this.repository.update(user);
    return update === 1 ? true : false;
  }

}

export function useMyProfileService(db: Db, settings: UserSettings, googleService: GoogleStorageService): MyProfileService {
  const repository = new MongoUserRepository(db);
  return new MyProfileManager(repository, settings, googleService);
}

export function useMyProfileController(log: Log, db: Db, settings: UserSettings, googleService: GoogleStorageService): MyProfileController {
  return new MyProfileController(log, useMyProfileService(db, settings, googleService));
}

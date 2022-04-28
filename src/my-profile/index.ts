import { StorageRepository } from 'google-storage';
import { Db } from 'mongodb';
import { Delete, Log, UrlBuild } from 'onecore';
import { clone } from 'signup-mongo';
import { ModelConf, StorageConf, StorageService } from '../storage-service';
import { MongoUserRepository } from './mongo-user-repository';
import { MyProfileService, User, UserRepository, UserSettings } from './user';
import { MyProfileController } from './user-controller';
export * from './user';
export { MyProfileController };

export function useMyProfileController(log: Log, db: Db, settings: UserSettings, storage: StorageRepository, deleteFile: Delete, generateId: () => string, buildUrl: UrlBuild, config?: StorageConf, model?: ModelConf): MyProfileController {
  const repository = new MongoUserRepository(db);
  const service = new MyProfileManager(repository, settings, storage, deleteFile, generateId, buildUrl, model, config);
  return new MyProfileController(log, service, generateId);
}

export class MyProfileManager extends StorageService<User, string> implements MyProfileService {
  constructor(
    private repository: UserRepository,
    private settings: UserSettings,
    storage: StorageRepository,
    deleteFile: Delete,
    generateId: () => string,
    buildUrl: UrlBuild,
    config?: StorageConf,
    model?: ModelConf,
  ) {
    super(repository.load, repository.patch, storage, deleteFile, generateId, buildUrl, model, config);
    this.uploadCoverImage = this.uploadCoverImage.bind(this);
    this.uploadGalleryFile = this.uploadGalleryFile.bind(this);
    this.updateGallery = this.updateGallery.bind(this);
    this.deleteGalleryFile = this.deleteGalleryFile.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
  }
  getMyProfile(id: string): Promise<User | null> {
    return this.repository.load(id).then((user) => {
      if (user) {
        delete (user as any)['settings'];
      }
      return user;
    });
  }
  getMySettings(id: string): Promise<UserSettings | null> {
    return this.repository
      .load(id)
      .then((user) =>
        user && user.settings ? user.settings : clone(this.settings)
      );
  }
  saveMyProfile(user: User): Promise<number> {
    return this.repository.patch(user);
  }
  saveMySettings(id: string, settings: UserSettings): Promise<number> {
    return this.repository.patch({ id, settings });
  }
}

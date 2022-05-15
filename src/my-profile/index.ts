import { StorageRepository } from 'google-storage';
import { Db } from 'mongodb';
import { ModelConf, StorageConf, StorageService, UploadInfo } from 'one-storage';
import { BuildUrl, Delete, Generate, Log } from 'onecore';
import { clone } from 'signup-mongo';
import { MongoUserRepository } from './mongo-user-repository';
import { MyProfileService, User, UserRepository, UserSettings } from './user';
import { MyProfileController, Save } from './user-controller';
export * from './user';
export { MyProfileController };

export function useMyProfileController(log: Log, db: Db, settings: UserSettings, storage: StorageRepository, deleteFile: Delete, generateId: Generate, buildUrl: BuildUrl, saveSkills: Save|undefined, saveInterests: Save|undefined, saveLookingFor: Save|undefined, sizesCover: number[],
sizesImage: number[], config?: StorageConf, model?: ModelConf, ): MyProfileController {
  const repository = new MongoUserRepository(db);
  const service = new MyProfileManager(repository, settings, storage, deleteFile, generateId, buildUrl, sizesCover, sizesImage, model, config);
  return new MyProfileController(log, service, generateId, sizesCover, sizesImage, saveSkills, saveInterests, saveLookingFor);
}

export class MyProfileManager extends StorageService<User, string> implements MyProfileService {
  constructor(
    private repository: UserRepository,
    private settings: UserSettings,
    storage: StorageRepository,
    deleteFile: Delete,
    generateId: Generate,
    buildUrl: BuildUrl,
    sizesCover: number[],
    sizesImage: number[],
    config?: StorageConf,
    model?: ModelConf,
  ) {
    super(repository.load, repository.patch, storage, deleteFile, generateId, buildUrl, sizesCover, sizesImage, config, model);
    this.uploadCoverImage = this.uploadCoverImage.bind(this);
    this.uploadGalleryFile = this.uploadGalleryFile.bind(this);
    this.updateGallery = this.updateGallery.bind(this);
    this.deleteGalleryFile = this.deleteGalleryFile.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
    this.getGalllery = this.getGalllery.bind(this);
  }
  getMyProfile(id: string): Promise<User | null> {
    return this.repository.load(id).then((user) => {
      if (user) {
        delete user.settings;
      }
      return user;
    });
  }
  getMySettings(id: string): Promise<UserSettings | null> {
    return this.repository.load(id)
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

  getGalllery(id: string): Promise<UploadInfo[]> {
    return this.repository.load(id).then((user) => {
      if (user) {
        return (user as any)[this.model.gallery];
      }
      return [];
    });
  }
}

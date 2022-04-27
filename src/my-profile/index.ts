import { StorageRepository } from 'google-storage';
import { Db } from 'mongodb';
import { Delete, Log, UrlBuild } from 'onecore';
import { clone } from 'signup-mongo';
import { MongoUserRepository } from './mongo-user-repository';
import { MyProfileService, UploadData, UploadGallery, UploadInfo, User, UserRepository, UserSettings } from './user';
import { MyProfileController } from './user-controller';
export * from './user';
export { MyProfileController };

export function useMyProfileController(log: Log, db: Db, settings: UserSettings, config: StorageConf, storage: StorageRepository, deleteFile: Delete, generateId: () => string, buildUrl: UrlBuild): MyProfileController {
  const repository = new MongoUserRepository(db);
  const service = new MyProfileManager(repository, settings, config, storage, deleteFile, generateId, buildUrl);
  return new MyProfileController(log, service, generateId);
}

export interface StorageConf {
  image: string;
  cover: string;
  gallery: string;
}
export class MyProfileManager implements MyProfileService {
  constructor(
    private repository: UserRepository,
    private settings: UserSettings,
    private config: StorageConf,
    private storage: StorageRepository,
    private deleteFile: Delete,
    private generateId: () => string,
    private buildUrl: UrlBuild
  ) {
    this.uploadCoverImage = this.uploadCoverImage.bind(this);
    this.uploadGalleryFile = this.uploadGalleryFile.bind(this);
    this.updateGallery = this.updateGallery.bind(this);
    this.deleteGalleryData = this.deleteGalleryData.bind(this);
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

  async uploadCoverImage(upload: UploadData): Promise<boolean> {
    const user = await this.repository.load(upload.id);
    if (!user) {
      return false;
    }
    if (user.coverURL && user.coverURL.length > 0) {
      if (shouldDelete(user.coverURL, user.gallery)) {
        await this.deleteFile(this.storage.delete, user.coverURL);
      }
    }
    const url = await this.storage.upload(upload.data, upload.name, this.config.cover);
    user.coverURL = url;
    const res = await this.repository.patch({id: upload.id, coverURL: user.coverURL});
    return res >= 1 ? true : false;
  }

  async uploadImage(upload: UploadData): Promise<boolean> {
    const user = await this.repository.load(upload.id);
    if (!user) {
      return false;
    }
    if (user.avatarUrl && user.avatarUrl.length > 0) {
      if (shouldDelete(user.avatarUrl, user.gallery)) {
        await this.deleteFile(this.storage.delete, user.avatarUrl);
      }
    }
    const url = await this.storage.upload(upload.data, upload.name, this.config.image);
    user.avatarUrl = url;
    const res = await this.repository.patch({id: upload.id, avatarUrl: user.avatarUrl});
    return res >= 1 ? true : false;
  }

  async uploadGalleryFile({id, source, name, type, data}: UploadGallery): Promise<boolean> {
    const user = await this.repository.load(id);
    if (!user) {
      return false;
    }
    let fileName: string = name;
    const newUrl = this.buildUrl(fileName, this.config.gallery);
    if (checkDuplicateFile(user.gallery || [], newUrl)) {
      fileName = appendFileExtension(removeFileExtension(name) + '_' + this.generateId(), getFileExtension(name));
    }
    const url = await this.storage.upload(data, fileName, this.config.gallery);
    user.gallery = user.gallery ? user.gallery : [];
    user.gallery.push({ source, url, type });
    const res = await this.repository.patch({id, gallery: user.gallery});
    return res >= 1 ? true : false;
  }

  async updateGallery(id: string, data: UploadInfo[]): Promise<boolean> {
    const user = await this.repository.load(id);
    if (!user) {
      return false;
    }
    const res = await this.repository.patch({id, gallery: data});
    return res >= 1 ? true : false;
  }
  async deleteGalleryData(id: string, url: string): Promise<boolean> {
    const user = await this.repository.load(id);
    if (!user) {
      return false;
    }
    if (url !== user.imageURL && url !== user.coverURL) {
      await this.deleteFile(this.storage.delete, url);
    }
    user.gallery = user.gallery?.filter((file) => file.url !== url);
    const res = await this.repository.patch({id, gallery: user.gallery});
    return res >= 1 ? true : false;
  }
}

function removeFileExtension(name: string): string {
  const idx: number = name.lastIndexOf('.');
  return name.substring(0, idx);
}
function appendFileExtension(s: string, ext: string): string {
  if (ext.length > 0) {
    return s + '.' + ext;
  } else {
    return s;
  }
}
function getFileExtension(name: string): string {
  const idx: number = name.lastIndexOf('.');
  if (idx >= 0) {
    return name.substring(idx);
  } else {
    return '';
  }
}
function checkDuplicateFile(data: UploadInfo[], url: string): boolean {
  const rs = data.find((upload) => upload.url === url);
  return rs ? true : false;
}

function shouldDelete(url: string, files?: UploadInfo[]): boolean {
  if (!files || files.length === 0) {
    return true;
  }
  for (const file of files) {
    if (url === file.url) {
      return false;
    }
  }
  return true;
}

import { DeleteFile, StorageRepository } from "google-storage";
import { Db } from "mongodb";
import { Log } from "onecore";
import { clone } from "signup-mongo";
import { MongoUserRepository } from "./mongo-user-repository";
import {
  MyProfileService,
  UploadData,
  UploadGallery,
  UploadInfo,
  User,
  UserRepository,
  UserSettings,
} from "./user";
import { MyProfileController } from "./user-controller";
export * from "./user";
export { MyProfileController };

export function useMyProfileController(
  log: Log,
  db: Db,
  settings: UserSettings,
  config: StorageConf,
  storage: StorageRepository,
  deleteFile: DeleteFile,
  generateId: () => string
): MyProfileController {
  const repository = new MongoUserRepository(db);
  const service = new MyProfileManager(
    repository,
    settings,
    config,
    storage,
    deleteFile,
    generateId
  );
  return new MyProfileController(log, service, generateId);
}

export interface StorageConf {
  avatar: string;
  cover: string;
  gallery: string;
}
export class MyProfileManager implements MyProfileService {
  constructor(
    private repository: UserRepository,
    private settings: UserSettings,
    private config: StorageConf,
    private storage: StorageRepository,
    private deleteFile: DeleteFile,
    private generateId: () => string
  ) {
    this.uploadCoverImage = this.uploadCoverImage.bind(this);
    this.uploadGalleryFile = this.uploadGalleryFile.bind(this);
    this.updateGallery = this.updateGallery.bind(this);
    this.deleteGalleryData = this.deleteGalleryData.bind(this);
    this.uploadAvatarImage = this.uploadAvatarImage.bind(this);
  }
  getMyProfile(id: string): Promise<User | null> {
    return this.repository.load(id).then((user) => {
      if (user) {
        delete (user as any)["settings"];
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
    const user: any = { id, settings };
    return this.repository.patch(user);
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

    try {
      const url = await this.storage.upload(
        upload.data,
        upload.name,
        this.config.cover
      );
      user.coverURL = url;
    } catch (error) {
      console.log(error);
    }
    const res = await this.repository.patch(user);
    return res >= 1 ? true : false;
  }

  async uploadAvatarImage(upload: UploadData): Promise<boolean> {
    const user = await this.repository.load(upload.id);
    if (!user) {
      return false;
    }
    if (user.avatarUrl && user.avatarUrl.length > 0) {
      if (shouldDelete(user.avatarUrl, user.gallery)) {
        await this.deleteFile(this.storage.delete, user.avatarUrl);
      }
    }
    try {
      const url = await this.storage.upload(
        upload.data,
        upload.name,
        this.config.avatar
      );
      user.avatarUrl = url;
    } catch (error) {
      console.log(error);
    }
    const res = await this.repository.patch(user);
    return res >= 1 ? true : false;
  }

  async uploadGalleryFile({
    id,
    source,
    name,
    type,
    data,
  }: UploadGallery): Promise<boolean> {
    const user = await this.repository.load(id);
    if (!user) {
      return false;
    }
    let fileName: string = name;

    const idx: number = name.lastIndexOf(".");
    fileName = name.substring(0, idx);
    if (checkDuplicateFile(user.gallery || [], fileName))
      fileName += this.generateId;
    const url = await this.storage.upload(data, fileName, this.config.gallery);
    user.gallery = user.gallery ? user.gallery : [];
    user.gallery.push({ source, url, type });
    const res = await this.repository.patch(user);
    return res >= 1 ? true : false;
  }

  async updateGallery(id: string, data: UploadInfo[]): Promise<boolean> {
    const user = await this.repository.load(id);
    if (!user) {
      return false;
    }

    user.gallery = data;
    const res = await this.repository.patch(user);
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
    const res = await this.repository.patch(user);
    return res >= 1 ? true : false;
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

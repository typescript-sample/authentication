export interface UploadInfo {
  source?: string;
  type?: string;
  url: string;
}
export interface UploadData {
  id: string;
  name: string;
  data: Buffer;
}
export interface UploadGallery<ID> {
  id: ID;
  source?: string;
  name: string;
  data: string | Buffer;
  type: string;
}
export interface StorageConf {
  image?: string;
  cover?: string;
  gallery?: string;
}
export interface StorageConfig {
  image: string;
  cover: string;
  gallery: string;
}
export interface ModelConfig {
  id: string;
  image: string;
  cover: string;
  gallery: string;
}
export interface ModelConf {
  id?: string;
  image?: string;
  cover?: string;
  gallery?: string;
}
export function buildConfig(m?: ModelConf): ModelConfig {
  if (m) {
    const c: any = {};
    c.id = (m.id && m.id.length > 0 ? m.id : 'id');
    c.image = (m.image && m.image.length > 0 ? m.image : 'imageURL');
    c.cover = (m.cover && m.cover.length > 0 ? m.cover : 'coverURL');
    c.gallery = (m.gallery && m.gallery.length > 0 ? m.gallery : 'gallery');
    return c;
  } else {
    return {
      id: 'id',
      image: 'imageURL',
      cover: 'coverURL',
      gallery: 'gallery'
    };
  }
}
export function buildStorageConfig(m?: StorageConf): StorageConfig {
  if (m) {
    const c: any = {};
    c.image = (m.image && m.image.length > 0 ? m.image : 'image');
    c.cover = (m.cover && m.cover.length > 0 ? m.cover : 'cover');
    c.gallery = (m.gallery && m.gallery.length > 0 ? m.gallery : 'gallery');
    return c;
  } else {
    return {
      image: 'image',
      cover: 'cover',
      gallery: 'gallery'
    };
  }
}
export interface StorageRepository {
  upload(data: string | Buffer, name: string, directory?: string): Promise<string>;
  delete(name: string, directory?: string): Promise<boolean>;
}
export type DeleteFile = (name: string, directory?: string) => Promise<boolean>;
export type Delete = (delFile: DeleteFile, url: string) => Promise<boolean>;
export type UrlBuild = (name: string, directory?: string) => string;
export class StorageService<T, ID> {
  constructor(
    public loadData: (id: ID, ctx?: any) => Promise<T|null>,
    public patchData: (obj: Partial<T>, ctx?: any) => Promise<number>,
    public storage: StorageRepository,
    public deleteFile: Delete,
    public generateId: () => string,
    public buildUrl: UrlBuild,
    model?: ModelConf,
    config?: StorageConf,
  ) {
    this.model = buildConfig(model);
    this.config = buildStorageConfig(config);
    this.uploadCoverImage = this.uploadCoverImage.bind(this);
    this.uploadGalleryFile = this.uploadGalleryFile.bind(this);
    this.updateGallery = this.updateGallery.bind(this);
    this.deleteGalleryFile = this.deleteGalleryFile.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
  }
  model: ModelConfig;
  config: StorageConfig;
  async uploadCoverImage(id: ID, name: string, data: string | Buffer): Promise<boolean> {
    const user: any = await this.loadData(id);
    if (!user) {
      return false;
    }
    const oldUrl: string = user[this.model.cover];
    const galary: UploadInfo[] | undefined = user[this.model.gallery];
    if (oldUrl && oldUrl.length > 0) {
      if (shouldDelete(oldUrl, galary)) {
        await this.deleteFile(this.storage.delete, oldUrl);
      }
    }
    const url = await this.storage.upload(data, name, this.config.cover);
    const obj: any = {};
    obj[this.model.id] = id;
    obj[this.model.cover] = url;
    const res = await this.patchData(obj);
    return res >= 1 ? true : false;
  }

  async uploadImage(id: ID, name: string, data: string | Buffer): Promise<boolean> {
    const user: any = await this.loadData(id);
    if (!user) {
      return false;
    }
    const oldUrl: string = user[this.model.image];
    const galary: UploadInfo[] | undefined = user[this.model.gallery];
    if (oldUrl && oldUrl.length > 0) {
      if (shouldDelete(oldUrl, galary)) {
        await this.deleteFile(this.storage.delete, oldUrl);
      }
    }
    const url = await this.storage.upload(data, name, this.config.image);
    const obj: any = {};
    obj[this.model.id] = id;
    obj[this.model.image] = url;
    const res = await this.patchData(obj);
    return res >= 1 ? true : false;
  }

  async uploadGalleryFile({id, source, name, type, data}: UploadGallery<ID>): Promise<boolean> {
    const user: any = await this.loadData(id);
    if (!user) {
      return false;
    }
    let fileName: string = name;
    const newUrl = this.buildUrl(fileName, this.config.gallery);
    const oldGalary: UploadInfo[] | undefined = user[this.model.gallery];
    if (checkDuplicateFile(oldGalary || [], newUrl)) {
      fileName = appendFileExtension(removeFileExtension(name) + '_' + this.generateId(), getFileExtension(name));
    }
    const url = await this.storage.upload(data, fileName, this.config.gallery);
    const galary = oldGalary ? oldGalary : [];
    galary.push({ source, url, type });
    const obj: any = {};
    obj[this.model.id] = id;
    obj[this.model.gallery] = galary;
    const res = await this.patchData(obj);
    return res >= 1 ? true : false;
  }

  async updateGallery(id: ID, data: UploadInfo[]): Promise<boolean> {
    const user = await this.loadData(id);
    if (!user) {
      return false;
    }
    const obj: any = {};
    obj[this.model.id] = id;
    obj[this.model.gallery] = data;
    const res = await this.patchData(obj);
    return res >= 1 ? true : false;
  }
  async deleteGalleryFile(id: ID, url: string): Promise<boolean> {
    const user: any = await this.loadData(id);
    if (!user) {
      return false;
    }
    const oldUrl: string = user[this.model.image];
    const oldCoverUrl: string = user[this.model.cover];
    const oldGalary: UploadInfo[] | undefined = user[this.model.gallery];
    if (url !== oldUrl && url !== oldCoverUrl) {
      await this.deleteFile(this.storage.delete, url);
    }
    const gallery = oldGalary?.filter((file) => file.url !== url);
    const obj: any = {};
    obj[this.model.id] = id;
    obj[this.model.gallery] = gallery;
    const res = await this.patchData(obj);
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
    return name.substring(idx + 1);
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

export interface UploadInfo {
  source?: string;
  type?: string;
  url: string;
}
export interface UploadData {
  name: string;
  data: string | Buffer;
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
    c.id = m.id && m.id.length > 0 ? m.id : "id";
    c.image = m.image && m.image.length > 0 ? m.image : "imageURL";
    c.cover = m.cover && m.cover.length > 0 ? m.cover : "coverURL";
    c.gallery = m.gallery && m.gallery.length > 0 ? m.gallery : "gallery";
    return c;
  } else {
    return {
      id: "id",
      image: "imageURL",
      cover: "coverURL",
      gallery: "gallery",
    };
  }
}
export function buildStorageConfig(m?: StorageConf): StorageConfig {
  if (m) {
    const c: any = {};
    c.image = m.image && m.image.length > 0 ? m.image : "image";
    c.cover = m.cover && m.cover.length > 0 ? m.cover : "cover";
    c.gallery = m.gallery && m.gallery.length > 0 ? m.gallery : "gallery";
    return c;
  } else {
    return {
      image: "image",
      cover: "cover",
      gallery: "gallery",
    };
  }
}
export interface StorageRepository {
  upload(
    data: string | Buffer,
    name: string,
    directory?: string
  ): Promise<string>;
  delete(name: string, directory?: string): Promise<boolean>;
}
export type DeleteFile = (name: string, directory?: string) => Promise<boolean>;
export type Delete = (delFile: DeleteFile, url: string) => Promise<boolean>;
export type BuildUrl = (name: string, directory?: string) => string;
export class StorageService<T, ID> {
  constructor(
    public loadData: (id: ID, ctx?: any) => Promise<T | null>,
    public patchData: (obj: Partial<T>, ctx?: any) => Promise<number>,
    public storage: StorageRepository,
    public deleteFile: Delete,
    public generateId: () => string,
    public buildUrl: BuildUrl,
    public sizesCover: number[],
    public sizesImage: number[],
    config?: StorageConf,
    model?: ModelConf
  ) {
    this.model = buildConfig(model);
    this.config = buildStorageConfig(config);
    this.uploadCoverImage = this.uploadCoverImage.bind(this);
    this.uploadGalleryFile = this.uploadGalleryFile.bind(this);
    this.updateGallery = this.updateGallery.bind(this);
    this.deleteGalleryFile = this.deleteGalleryFile.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
    this.insertYoutube = this.insertYoutube.bind(this);
    this.deleteYoutube = this.deleteYoutube.bind(this);
  }
  model: ModelConfig;
  config: StorageConfig;
  async uploadCoverImage(
    id: ID,
    name: string,
    data: string | Buffer
  ): Promise<string> {
    const user: any = await this.loadData(id);
    if (!user) {
      return "";
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
    return res >= 1 ? url : "";
  }

  async uploadImage(
    id: ID,

    data: UploadData[], sizes?: number[]
  ): Promise<string> {
    const user: any = await this.loadData(id);
    if (!user) {
      return "";
    }
    let urlUploaded: string = "";
    const oldUrl: string = user[this.model.image];
    const galary: UploadInfo[] | undefined = user[this.model.gallery];
    await this.deleteFileUpload(oldUrl, galary, sizes??this.sizesImage);
    for (const [index, file] of data.entries()) {
      //size
      //
      const urlOrigin = await this.storage.upload(
        file.data,
        file.name,
        this.config.image
      );
      const obj: any = {};


      if (index === 0) {
        obj[this.model.id] = id;
        obj[this.model.image] = urlOrigin;
        urlUploaded = urlOrigin
        const res = await this.patchData(obj);
        if (res < 1) return "";
      }
    }

    return urlUploaded;
  }

  async deleteFileUpload(oldUrl: string, galary: UploadInfo[] | undefined, sizes?: number[]) {
    //delete original file
    if (oldUrl && oldUrl.length > 0) {
      if (shouldDelete(oldUrl, galary)) {
        await this.deleteFile(this.storage.delete, oldUrl).catch(err=>{})
      }
    }
    if (!sizes) return
    for (const size of sizes) {
      const oldSizeURL =
        removeFileExtension(oldUrl) + "_" + size + "." + getFileExtension(oldUrl);
      if (oldSizeURL && oldSizeURL.length > 0) {
        if (shouldDelete(oldSizeURL, galary)) {
          await this.deleteFile(this.storage.delete, oldSizeURL).catch(err=>{})
        }
      }
    }
  }

  async uploadGalleryFile({
    id,
    source,
    name,
    type,
    data,
  }: UploadGallery<ID>): Promise<UploadInfo[]> {
    const user: any = await this.loadData(id);
    if (!user) {
      return [];
    }
    let fileName: string = name;
    const newUrl = this.buildUrl(fileName, this.config.gallery);
    const oldGalary: UploadInfo[] | undefined = user[this.model.gallery];
    if (checkDuplicateFile(oldGalary || [], newUrl)) {
      fileName = appendFileExtension(
        removeFileExtension(name) + "_" + this.generateId(),
        getFileExtension(name)
      );
    }
    const url = await this.storage.upload(data, fileName, this.config.gallery);
    const galary = oldGalary ? oldGalary : [];
    galary.push({ source, url, type });
    const obj: any = {};
    obj[this.model.id] = id;
    obj[this.model.gallery] = galary;
    const res = await this.patchData(obj);
    return res >= 1 ? galary : [];
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
  async insertYoutube(id: ID, data: UploadInfo): Promise<boolean> {
    const user: any = await this.loadData(id);
    if (!user) {
      return false;
    }
    let gallery: UploadInfo[] | undefined = user[this.model.gallery];
    gallery = gallery ? gallery : [];
    gallery.push(data);
    user[this.model.gallery] = gallery;
    const rs = await this.patchData(user);
    return rs >= 1 ? true : false;
  }

  async deleteYoutube(id: ID, url: string): Promise<boolean> {
    const user: any = await this.loadData(id);
    user[this.model.gallery] = user[this.model.gallery].filter(
      (file: UploadInfo) => file.url !== url
    );
    const rs = await this.patchData(user);
    return rs >= 1 ? true : false;
  }
}

export function removeFileExtension(name: string): string {
  const idx: number = name.lastIndexOf(".");
  return idx >= 0 ? name.substring(0, idx) : name;
}

export function appendFileExtension(s: string, ext: string): string {
  return ext.length > 0 ? s + "." + ext : s;
}

export function getFileExtension(name: string): string {
  const idx: number = name.lastIndexOf(".");
  return idx >= 0 ? name.substring(idx + 1) : "";
}
export type DataType =
  | "ObjectId"
  | "date"
  | "datetime"
  | "time"
  | "boolean"
  | "number"
  | "integer"
  | "string"
  | "text"
  | "object"
  | "array"
  | "binary"
  | "primitives"
  | "booleans"
  | "numbers"
  | "integers"
  | "strings"
  | "dates"
  | "datetimes"
  | "times";
export type FormatType =
  | "currency"
  | "percentage"
  | "email"
  | "url"
  | "phone"
  | "fax"
  | "ipv4"
  | "ipv6";
export type MatchType = "equal" | "prefix" | "contain" | "max" | "min"; // contain: default for string, min: default for Date, number
export interface Attribute {
  name?: string;
  field?: string;
  column?: string;
  type?: DataType;
  format?: FormatType;
  required?: boolean;
  match?: MatchType;
  default?: string | number | Date | boolean;
  key?: boolean;
  unique?: boolean;
  enum?: string[] | number[];
  q?: boolean;
  noinsert?: boolean;
  noupdate?: boolean;
  nopatch?: boolean;
  version?: boolean;
  length?: number;
  min?: number;
  max?: number;
  gt?: number;
  lt?: number;
  precision?: number;
  scale?: number;
  exp?: RegExp | string;
  code?: string;
  noformat?: boolean;
  ignored?: boolean;
  jsonField?: string;
  link?: string;
  typeof?: Attributes;
  true?: string | number;
  false?: string | number;
}
export interface Attributes {
  [key: string]: Attribute;
}
export interface GenericRepository<T, ID> {
  metadata?(): Attributes | undefined;
  keys?(): string[];
  load(id: ID, ctx?: any): Promise<T | null>;
  insert(obj: T, ctx?: any): Promise<number>;
  update(obj: T, ctx?: any): Promise<number>;
  patch(obj: Partial<T>, ctx?: any): Promise<number>;
  delete(id: ID, ctx?: any): Promise<number>;
}
// tslint:disable-next-line:max-classes-per-file
export class GenericStorageService<T, ID> extends StorageService<T, ID> {
  constructor(
    public repository: GenericRepository<T, ID>,
    storage: StorageRepository,
    deleteFile: Delete,
    generateId: () => string,
    buildUrl: BuildUrl,
    sizesCover: number[],
    sizesImage: number[],
    config?: StorageConf,
    model?: ModelConf
  ) {
    super(
      repository.load,
      repository.patch,
      storage,
      deleteFile,
      generateId,
      buildUrl,
      sizesCover,
      sizesImage,
      config,
      model
    );
    this.metadata = this.metadata.bind(this);
    this.keys = this.keys.bind(this);
    this.load = this.load.bind(this);
    this.insert = this.insert.bind(this);
    this.update = this.update.bind(this);
    this.patch = this.patch.bind(this);
    this.delete = this.delete.bind(this);
  }
  metadata(): Attributes | undefined {
    return this.repository.metadata ? this.repository.metadata() : undefined;
  }
  keys(): string[] {
    return this.repository.keys ? this.repository.keys() : [];
  }
  load(id: ID, ctx?: any): Promise<T | null> {
    return this.repository.load(id, ctx);
  }
  insert(obj: T, ctx?: any): Promise<number> {
    return this.repository.insert(obj, ctx);
  }
  update(obj: T, ctx?: any): Promise<number> {
    return this.repository.update(obj, ctx);
  }
  patch(obj: Partial<T>, ctx?: any): Promise<number> {
    return this.repository.patch
      ? this.repository.patch(obj, ctx)
      : Promise.resolve(-1);
  }
  delete(id: ID, ctx?: any): Promise<number> {
    return this.repository.delete
      ? this.repository.delete(id, ctx)
      : Promise.resolve(-1);
  }
}
export interface Filter {
  page?: number;
  limit?: number;
  firstLimit?: number;
  fields?: string[];
  sort?: string;
  currentUserId?: string;

  q?: string;
  keyword?: string;
  excluding?: string[] | number[];
  refId?: string | number;

  pageIndex?: number;
  pageSize?: number;
}
export interface SearchResult<T> {
  list: T[];
  total?: number;
  last?: boolean;
  nextPageToken?: string;
}
export type Search<T, F> = (
  s: F,
  limit?: number,
  offset?: number | string,
  fields?: string[]
) => Promise<SearchResult<T>>;
// tslint:disable-next-line:max-classes-per-file
export class GenericSearchStorageService<
  T,
  ID,
  F extends Filter
  > extends GenericStorageService<T, ID> {
  constructor(
    public find: Search<T, F>,
    repo: GenericRepository<T, ID>,
    storage: StorageRepository,
    deleteFile: Delete,
    generateId: () => string,
    buildUrl: BuildUrl,
    sizesCover: number[],
    sizesImage: number[],
    config?: StorageConf,
    model?: ModelConf
  ) {
    super(repo, storage, deleteFile, generateId, buildUrl, sizesCover,
      sizesImage, config, model);
    this.search = this.search.bind(this);
  }
  search(
    s: F,
    limit?: number,
    offset?: number | string,
    fields?: string[]
  ): Promise<SearchResult<T>> {
    return this.find(s, limit, offset, fields);
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

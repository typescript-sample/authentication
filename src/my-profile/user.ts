import { Attributes, DateRange, Filter, Repository } from "onecore";
import { UploadData } from "../upload-controller";

export interface User {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  interests: string[];
  skills: Skill[];
  achievements: Achievement[];
  settings: UserSettings;
  avatarUrl?: string;
  title?: string;
  image?: UploadSize[];
  coverURL?: string;
  nationality?: string;
  alternativeEmail?: string;
  address?: string;
  bio?: string;
  website?: string;
  occupation?: string;
  company?: string;
  lookingFor?: string[];
  gallery?: UploadInfo[];
}
export interface Skill {
  skill: string;
  hirable: boolean;
}
export interface UserSettings {
  language: string;
  dateFormat: string;
  dateTimeFormat: string;
  timeFormat: string;
  notification: boolean;
}
export interface Achievement {
  subject: string;
  description: string;
}
export interface Appreciation {
  id: string;
  userId: string;
  appreciator: string;
  appreciatedAt: string;
  subject: string;
  description: string;
}

export interface UploadInfo {
  source?: string;
  type?: string;
  url: string;
}

export interface UploadSize {
  size:string,
  url: string;
}
export interface FileUploadsCover {
  source: string;
  url: string;
}

export interface UploadGallery {
  id: string;
  source?: string;
  name: string;
  data: Buffer;
  type: string;
}
export interface UserFilter extends Filter {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  dateOfBirth?: DateRange;
  interests: string[];
  skills: Skill[];
  achievements: Achievement[];
}
export interface UserRepository extends Repository<User, string> {}
export interface MyProfileService {
  getMyProfile(id: string): Promise<User | null>;
  getMySettings(id: string): Promise<UserSettings | null>;
  saveMyProfile(user: User): Promise<number>;
  saveMySettings(id: string, settings: UserSettings): Promise<number>;
  uploadCoverImage(id: string, data: UploadData[],sizes?:number[]): Promise<string>;
  uploadImage(id: string, data: UploadData[],sizes?:number[]): Promise<string>;
  uploadGalleryFile(uploadGallery: UploadGallery): Promise<UploadInfo[]>;
  updateGallery(id: string, data: UploadInfo[]): Promise<boolean>;
  deleteGalleryFile(id: string, url: string): Promise<boolean>;
  getGalllery(id: string): Promise<UploadInfo[]>;
  addExternalResource(id: string, data: UploadInfo): Promise<boolean>;
  deleteExternalResource(id: string, url: string): Promise<boolean>;
}

export const skillsModel: Attributes = {
  skill: {
    required: true,
  },
  hirable: {
    type: "boolean",
  },
};
export const fileUploadModel: Attributes = {
  url: {
    required: true,
  },
  source: {
    required: true,
  },
};

export const fileUploadGalleryModel: Attributes = {
  type: {},
  url: {
    required: true,
  },
  source: {
    required: true,
  },
};

export const userSettingsModel: Attributes = {
  userId: {},
  language: {},
  dateFormat: {},
  dateTimeFormat: {},
  timeFormat: {},
  notification: {
    type: "boolean",
  },
};
export const achievements: Attributes = {
  subject: {},
  description: {},
};
export const userModel: Attributes = {
  id: {
    key: true,
    match: "equal",
  },
  username: {},
  email: {
    format: "email",
    required: true,
    match: "prefix",
  },
  phone: {
    format: "phone",
    required: true,
  },
  dateOfBirth: {
    type: "datetime",
    field: "date_of_birth",
  },
  interests: {
    type: "primitives",
  },
  skills: {
    type: "primitives",
    typeof: skillsModel,
  },
  achievements: {
    type: "primitives",
    typeof: achievements,
  },
  settings: {
    type: "object",
    typeof: userSettingsModel,
  },
  uploadCover: {
    type: "primitives",
    typeof: fileUploadModel,
  },
  uploadGallery: {
    type: "primitives",
    typeof: fileUploadModel,
  },
};

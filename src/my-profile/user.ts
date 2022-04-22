import { Attributes, DateRange, Filter, Repository, Service } from 'onecore';

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

  title?: string;
  image?: string;
  coverImage?: string;
  nationality?: string;
  alternativeEmail?: string;
  address?: string;
  bio?: string;
  website?: string;
  occupation?: string;
  company?: string;
  lookingFor?: string[];
  uploadCover?: FileUploads;
}
export interface Skill {
  skill: string;
  hirable: boolean;
}
export interface FileUploads {
  source: string;
  type: string;
  url: string;
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

export interface UserFilter extends Filter {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  dateOfBirth?: DateRange;
  interests: string[];
  skills: Skill[];
  achievements: Achievement[];
  settings: UserSettings;
}
export interface UserRepository extends Repository<User, string> {
}
export interface UserService extends Service<User, string, UserFilter> {
}
export interface MyProfileService {
  getMyProfile(id: string): Promise<User | null>;
  getMySettings(id: string): Promise<UserSettings | null>;
  saveMyProfile(user: User): Promise<number>;
  saveMySettings(id: string, settings: UserSettings): Promise<number>;
  uploadFile(id: string, source: string, type: string, name: string,
    fileBuffer: Buffer): Promise<string>;
}

export const skillsModel: Attributes = {
  skill: {
    required: true
  },
  hirable: {
    type: 'boolean',
  }
};
export const fileUploadModel: Attributes = {
  type: {
    required: true
  },
  url: {
    required: true
  },
  source: {
    required: true
  }
};

export const userSettingsModel: Attributes = {
  userId: {},
  language: {},
  dateFormat: {},
  dateTimeFormat: {},
  timeFormat: {},
  notification: {
    type: 'boolean',
  }
};
export const achievements: Attributes = {
  subject: {},
  description: {}
};
export const userModel: Attributes = {
  id: {
    key: true,
    match: 'equal'
  },
  username: {},
  email: {
    format: 'email',
    required: true,
    match: 'prefix'
  },
  phone: {
    format: 'phone',
    required: true
  },
  dateOfBirth: {
    type: 'datetime',
    field: 'date_of_birth'
  },
  interests: {
    type: 'primitives',
  },
  skills: {
    type: 'primitives',
    typeof: skillsModel,
  },
  achievements: {
    type: 'primitives',
    typeof: achievements,
  },
  settings: {
    type: 'object',
    typeof: userSettingsModel,
  },
  uploadCover: {
    type: 'primitives',
    typeof: fileUploadModel
  }
};

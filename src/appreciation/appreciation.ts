import { Attributes, DateRange, Filter, Repository, Service } from 'onecore';
import { SearchResult } from 'query-core';

export interface AppreciationFilter extends Filter {
  id?: string;
  authorId?: string;
  userId?: string;
  title?: string;
  description?: string;
  replyCount?: number;
  usefulCount?: number;
  createdAt?: Date;
}
export interface Appreciation {
  id: string;
  authorId: string;
  userId?: string;
  title?: string;
  description?: string;
  replyCount: number;
  usefulCount: number;
  createdAt?: Date;
  isUseful?: boolean;
}
export interface AppreciationRepository extends Repository<Appreciation, string> {
  increaseReply(id: string, count: number): Promise<boolean>;
}
export interface AppreciationService extends Service<Appreciation, string, AppreciationFilter> {
  usefulAppreciation(obj: UsefulAppreciationFilter): Promise<number>;
  searchWithReply(s: AppreciationFilter, userId?: string, limit?: number, offset?: string | number, fields?: string[]): Promise<SearchResult<Appreciation>>;
}

export const AppreciationModel: Attributes = {
  id: {
    key: true,
    length: 40
  },
  userId: {
    required: true,
    length: 255,
  },
  authorId: {
    required: true,
    length: 255,
  },
  title: {
    length: 255
  },
  description: {
    length: 255
  },
  replyCount: { type: 'number' },
  usefulCount: { type: 'number' },
  createdAt: {
    type: 'datetime'
  }
};

//////////

export interface AppreciationReplyFilter extends Filter {
  id?: string;
  authorId?: string;
  userId?: string;
  title?: string;
  description?: string;
  replyCount?: number;
  usefulCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
  appreciationId?: string;
}
export interface AppreciationReply {
  id: string;
  authorId: string;
  userId?: string;
  title?: string;
  description?: string;
  replyCount: number;
  usefulCount: number;
  createdAt?: Date;
  updatedAt?: Date;
  isUseful?: boolean;
  appreciationId?: string;
}
export interface AppreciationReplyRepository extends Repository<AppreciationReply, string> {

}
export interface AppreciationReplyService extends Service<AppreciationReply, string, AppreciationReplyFilter> {
  usefulAppreciation(obj: UsefulAppreciationFilter): Promise<number>;
  searchWithReply(s: AppreciationReplyFilter, userId?: string, limit?: number, offset?: string | number, fields?: string[]): Promise<SearchResult<AppreciationReply>>;
}

export const AppreciationReplyModel: Attributes = {
  id: {
    key: true,
    length: 40
  },
  userId: {
    required: true,
    length: 255,
  },
  appreciationId: {
    required: true,
    length: 255,
  },
  authorId: {
    required: true,
    length: 255,
  },
  title: {
    length: 255
  },
  description: {
    length: 255
  },
  replyCount: { type: 'number' },
  usefulCount: { type: 'number' },
  createdAt: {
    type: 'datetime'
  },
  updatedAt: {
    type: 'datetime'
  },
};
//////
export interface UsefulAppreciationFilter extends Filter {
  appreciationId: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface UsefulAppreciation {
  appreciationId: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface UsefulAppreciationRepository extends Repository<UsefulAppreciation, string> {
  deleteUseful(appreciationId: string, userId: string, ctx?: any): Promise<boolean>;
}

export const UsefulAppreciationModel: Attributes = {
  userId: {
    required: true,
    length: 255,
  },
  appreciationId: {
    required: true,
    length: 255,
  },
  createdAt: {
    type: 'datetime'
  },
  updatedAt: {
    type: 'datetime'
  },
};

import { Attributes, DateRange, Filter, Repository, Service } from 'onecore';

export interface AppreciationFilter extends Filter {
  id?: string;
  authorId?: string;
  title?: string;
  description?: string;
  replyCount?: number;
  usefulCount?: number;
  publishedAt?: Date;
}
export interface Appreciation {
  id: string;
  authorId: string;
  title?: string;
  description?: string;
  replyCount?: number;
  usefulCount?: number;
  publishedAt?: Date;
}
export interface AppreciationRepository extends Repository<Appreciation, string> {
}
export interface AppreciationService extends Service<Appreciation, string, AppreciationFilter> {
}

export const AppreciationModel: Attributes = {
  id: {
    key: true,
    length: 40
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
  publishedAt: {
    type: 'datetime'
  }
};

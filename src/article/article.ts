import { Attributes, Filter, ViewRepository, ViewService } from 'onecore';

export interface ArticleFilter extends Filter {
  id?: string;
  title?: string;
  type?: string;
  tags?: string[];
  status?: string[]|string;
}
export interface Article {
  id?: string;
  title?: string;
  type?: string;
  description?: string;
  content?: string;
  tags?: string[];
  status?: string;
}
export interface ArticleRepository extends ViewRepository<Article, string> {
}
export interface ArticleService extends ViewService<Article, string> {
}

export const articleModel: Attributes = {
  id: {
    key: true
  },
  name: {
    required: true,
    q: true
  },
  type: {
    match: 'equal',
    required: true
  },
  description: {
    q: true
  },
  content: {
    q: true
  },
  status: {
    match: 'equal'
  },
  tags: {
    type: 'strings',
    match: 'equal'
  },
  imageURL: {}
};

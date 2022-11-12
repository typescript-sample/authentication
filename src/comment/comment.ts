import { Attributes, Filter, Repository, Service } from 'onecore';

export interface CommentFilter extends Filter {
  id?: string;
  author?: string;
}
export interface Comment {
  id: string;
  author: string;
  comment: string;
  createdat?: string;
}

export interface CommentRepository extends Repository<Comment, string> {
}
export interface CommentService extends Service<Comment, string, CommentFilter> {
}

export const commentModel: Attributes = {
  id: {
    key: true,
    required: true,
    q: true
  },
  author: {
    required: true,
    q: true
  },
  comment: {
  },
  createdAt: {
    type: 'datetime'
  }
};

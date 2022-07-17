import { DB, Repository } from 'query-core';
import { Comment, commentModel, CommentRepository } from './comment';

export class SqlCommentRepositoy extends Repository<Comment, string> implements CommentRepository {
  constructor(db: DB) {
    super(db, 'comments', commentModel);
  }
}

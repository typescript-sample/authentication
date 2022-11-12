import { Log, Manager, Search } from 'onecore';
import { DB, SearchBuilder } from 'query-core';
import { TemplateMap, useQuery } from 'query-mappers';
import { Comment, CommentFilter, commentModel, CommentRepository, CommentService } from './comment';
import { CommentController } from './comment-controller';
import { buildQuery } from './query';
export * from './comment';
export { CommentController };

import { SqlCommentRepositoy } from './sql-comment-repository';

export class CommentManager extends Manager<Comment, string, CommentFilter> implements CommentService {
  constructor(search: Search<Comment, CommentFilter>, repository: CommentRepository) {
    super(search, repository);
  }
}

export function useCommentService(db: DB, mapper?: TemplateMap): CommentService {
  const queryComment = useQuery('comment', mapper, commentModel, true);
  const builder = new SearchBuilder<Comment, CommentFilter>(db.query, 'comments', commentModel, db.driver, buildQuery);
  const repository = new SqlCommentRepositoy(db);
  return new CommentManager(builder.search, repository);
}
export function useCommentController(log: Log, db: DB, mapper?: TemplateMap): CommentController {
  return new CommentController(log, useCommentService(db, mapper));
}

import { DB, Repository } from 'query-core';
import { Article, articleModel, ArticleRepository } from './article';

export class SqlArticleRepository extends Repository<Article, string> implements ArticleRepository {
  constructor(db: DB) {
    super(db, 'articles', articleModel);
  }
}

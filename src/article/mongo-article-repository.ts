import { Db } from 'mongodb';
import { ViewRepository } from 'mongodb-extension';
import { Article, articleModel, ArticleRepository } from './article';

export class MongoArticleRepository extends ViewRepository<Article, string> implements ArticleRepository {
  constructor(db: Db) {
    super(db, 'article', articleModel);
  }
}

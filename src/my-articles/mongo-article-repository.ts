import { Db } from 'mongodb';
import { Repository } from 'mongodb-extension';
import { Article, articleModel, ArticleRepository } from './article';

export class MongoArticleRepository extends Repository<Article, string> implements ArticleRepository {
  constructor(db: Db) {
    super(db, 'article', articleModel);
  }
}

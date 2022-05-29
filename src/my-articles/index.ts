import { Build } from 'express-ext';
import { Db } from 'mongodb';
import { buildQuery, SearchBuilder } from 'mongodb-extension';
import { Log, Manager, Search } from 'onecore';
import { Article, ArticleFilter, articleModel, ArticleRepository, ArticleService } from './article';
import { ArticleController } from './article-controller';
export * from './article';
export { ArticleController };

import { MongoArticleRepository } from './mongo-article-repository';

export class ArticleManager extends Manager<Article, string, ArticleFilter> implements ArticleService {
  constructor(search: Search<Article, ArticleFilter>, repository: ArticleRepository) {
    super(search, repository);
  }
}
export function useArticleService(db: Db): ArticleService {
  const builder = new SearchBuilder<Article, ArticleFilter>(db, 'article', buildQuery, articleModel);
  const repository = new MongoArticleRepository(db);
  return new ArticleManager(builder.search, repository);
}
export function useMyArticleController(log: Log, db: Db, build?: Build<Article>): ArticleController {
  return new ArticleController(log, useArticleService(db), build);
}

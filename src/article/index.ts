import { Db } from 'mongodb';
import { buildQuery, SearchBuilder } from 'mongodb-extension';
import { Log, ViewManager } from 'onecore';
import { Article, ArticleFilter, articleModel, ArticleRepository, ArticleService } from './article';
import { ArticleController } from './article-controller';
export * from './article';
export { ArticleController };

import { MongoArticleRepository } from './mongo-article-repository';

export class ArticleManager extends ViewManager<Article, string> implements ArticleService {
  constructor(repository: ArticleRepository) {
    super(repository);
  }
}

export function useArticleController(log: Log, db: Db): ArticleController {
  const builder = new SearchBuilder<Article, ArticleFilter>(db, 'article', buildQuery, articleModel);
  const repository = new MongoArticleRepository(db);
  const service = new ArticleManager(repository);
  return new ArticleController(log, builder.search, service);
}

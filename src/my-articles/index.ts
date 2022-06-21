import { Build } from 'express-ext';
import { Db } from 'mongodb';
import { Log, Manager, Search } from 'onecore';
import { DB, postgres, SearchBuilder } from 'query-core';
import { TemplateMap, useQuery } from 'query-mappers';
import { Article, ArticleFilter, articleModel, ArticleRepository, ArticleService } from './article';
import { ArticleController } from './article-controller';
export * from './article';
export { ArticleController };

import { SqlArticleRepository } from './sql-artical-repository';

export class ArticleManager extends Manager<Article, string, ArticleFilter> implements ArticleService {
  constructor(search: Search<Article, ArticleFilter>, repository: ArticleRepository) {
    super(search, repository);
  }
}
// export function useArticleService(db: DB, mapper?: TemplateMap): ArticleService {
//   const builder = new SearchBuilder<Article, ArticleFilter>(db, 'article', buildQuery, articleModel);
//   const repository = new SqlArticleRepository(db);
//   return new ArticleManager(builder.search, repository);
// }
// export function useMyArticleController(log: Log, db: Db, build?: Build<Article>): ArticleController {
//   return new ArticleController(log, useArticleService(db), build);
// }

export function useArticleService(db: DB, mapper?: TemplateMap): ArticleService {
  const queryArticles = useQuery('article', mapper, articleModel, true);
  const builder = new SearchBuilder<Article, ArticleFilter>(db.query, 'articles', articleModel, postgres, queryArticles);
  const repository = new SqlArticleRepository(db);
  return new ArticleManager(builder.search, repository);
}
export function useMyArticleController(log: Log, db: DB, mapper?: TemplateMap): ArticleController {
  return new ArticleController(log, useArticleService(db, mapper));
}

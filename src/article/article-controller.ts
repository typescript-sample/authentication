import { LoadSearchHandler, Log } from 'express-ext';
import { Search } from 'onecore';
import { Article, ArticleFilter, ArticleService } from './article';

export class ArticleController extends LoadSearchHandler<Article, string, ArticleFilter> {
  constructor(log: Log, find: Search<Article, ArticleFilter>, service: ArticleService) {
    super(log, find, service);
  }
}

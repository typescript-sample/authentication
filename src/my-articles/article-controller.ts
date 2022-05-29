import { Build, Controller, Log } from 'express-ext';
import { Article, ArticleFilter, ArticleService } from './article';

export class ArticleController extends Controller<Article, string, ArticleFilter> {
  constructor(log: Log, service: ArticleService, build?: Build<Article>) {
    super(log, service, undefined, build);
  }
}

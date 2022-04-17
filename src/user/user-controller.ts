import { LoadSearchHandler } from 'express-ext';
import { Log, Search } from 'onecore';
import { User, UserFilter, UserService } from './user';

export class UserController extends LoadSearchHandler<User, string, UserFilter> {
  constructor(log: Log, find: Search<User, UserFilter>, service: UserService) {
    super(log, find, service);
  }
}

import { Log, Controller } from 'express-ext';
import { Search } from 'onecore';
import { Comment, CommentFilter, CommentService } from './comment';


export class CommentController extends Controller<Comment, string, CommentFilter> {
  constructor(log: Log, public service: CommentService) {
    super(log,service);
  }

}

import { Controller, Log } from 'express-ext';
import { Appreciation, AppreciationFilter, AppreciationService } from './appreciation';

export class AppreciationController extends Controller<Appreciation, string, AppreciationFilter> {
  constructor(log: Log, userService: AppreciationService) {
    super(log, userService);
  }
 
}

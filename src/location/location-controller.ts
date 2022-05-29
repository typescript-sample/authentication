import { Request, Response } from 'express';
import { getStatusCode, handleError, LoadSearchHandler, Log } from 'express-ext';
import { Search, Validator } from 'onecore';
import { createValidator } from 'xvalidators';
import { Location, LocationFilter, LocationService, Rate, rateModel } from './location';

export class LocationController extends LoadSearchHandler<Location, string, LocationFilter> {
  validator: Validator<Rate>;
  constructor(log: Log, find: Search<Location, LocationFilter>, public service: LocationService) {
    super(log, find, service);
    this.rate = this.rate.bind(this);
    this.validator = createValidator<Rate>(rateModel);
  }
  rate(req: Request, res: Response) {
    const rate: Rate = req.body;
    rate.rateTime = new Date();
    this.validator.validate(rate).then(errors => {
      if (errors && errors.length > 0) {
        res.status(getStatusCode(errors)).json(errors).end();
      } else {
        this.service.rate(rate).then(rs => {
          res.json(rs).end();
        }).catch(err => handleError(err, res, this.log));
      }
    }).catch(err => handleError(err, res, this.log));
  }
}

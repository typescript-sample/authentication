import { Db } from 'mongodb';
import { Repository } from 'mongodb-extension';
import { Rate, rateModel, RateRepository } from './location';

export class MongoLocationRateRepository extends Repository<Rate, string> implements RateRepository {
  constructor(db: Db) {
    super(db, 'locationRate', rateModel);
  }
}

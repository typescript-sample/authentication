import { Db } from 'mongodb';
import { Repository } from 'mongodb-extension';
import { LocationInfo, locationInfoModel, LocationInfoRepository } from './location';

export class MongoLocationInfoRepository extends Repository<LocationInfo, string> implements LocationInfoRepository {
  constructor(db: Db) {
    super(db, 'locationInfo', locationInfoModel);
  }
}

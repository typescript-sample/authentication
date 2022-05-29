import { Db } from 'mongodb';
import { ViewRepository } from 'mongodb-extension';
import { Location, locationModel, LocationRepository } from './location';

export class MongoLocationRepository extends ViewRepository<Location, string> implements LocationRepository {
  constructor(db: Db, fromPoint: (v: Location) => Location) {
    super(db, 'location', locationModel, fromPoint);
  }
}

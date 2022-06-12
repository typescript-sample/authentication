import { Db } from 'mongodb';
import { buildQuery, PointMapper, SearchBuilder } from 'mongodb-extension';
import { Log, ViewManager } from 'onecore';
import shortid from 'shortid';
import { Location, LocationFilter, LocationInfo, LocationInfoRepository, locationModel, LocationRepository, LocationService, Rate, RateFilter, rateModel, RateRepository, RateService } from './location';
import { LocationController } from './location-controller';
import { MongoLocationInfoRepository } from './mongo-location-info-repository';
import { MongoLocationRateRepository } from './mongo-location-rate-repository';
export * from './location';
export { LocationController };
export { LocationRateController };

import { MongoLocationRepository } from './mongo-location-repository';
import { query } from './mongo-query';
import { LocationRateController } from './rate-controller';

export class LocationManager extends ViewManager<Location, string> implements LocationService {
  constructor(private repository: LocationRepository, private rateRepository: RateRepository, private infoRepository: LocationInfoRepository) {
    super(repository);
  }
  load(id: string): Promise<Location | null> {
    return this.repository.load(id).then(location => {
      if (!location) {
        return null;
      } else {
        return this.infoRepository.load(id).then(info => {
          if (info) {
            delete (info as any)['id'];
            location.info = info;
          }
          return location;
        });
      }
    });
  }
  async rate(rate: Rate): Promise<boolean> {
    const info = await this.infoRepository.load(rate.locationId);
    if (!info || typeof info[('rate' + rate.rate.toString()) as keyof LocationInfo] === 'undefined') {
      return false;
    }
    if (rate.id) {
      const dbRate = await this.rateRepository.load(rate.id);
      if (!dbRate) {
        return false;
      }
      (info as any)['rate' + dbRate.rate.toString()] -= 1;
      dbRate.rate = rate.rate;
      const res = await this.rateRepository.update(dbRate);
      if (res < 1) {
        return false;
      }
    } else {
      rate.id = shortid.generate();
      const res = await this.rateRepository.save(rate);
      if (res < 1) {
        return false;
      }
    }
    (info as any)['rate' + rate.rate.toString()] += 1;
    const sumRate = info.rate1 + info.rate2 * 2 + info.rate3 * 3 + info.rate4 * 4 + info.rate5 * 5;
    const count = info.rate1 + info.rate2 + info.rate3 + info.rate4 + info.rate5;
    info.rate = sumRate / count;
    this.infoRepository.save(info);
    return true;
  }
}

export class RateManagaer extends ViewManager<Rate, string> implements RateService {
  constructor(private repository: RateRepository) {
    super(repository);
  }
}
export function useLocationController(log: Log, db: Db): LocationController {
  const mapper = new PointMapper<Location>('geo', 'latitude', 'longitude');
  const builder = new SearchBuilder<Location, LocationFilter>(db, 'location', query, locationModel, mapper.fromPoint);
  const repository = new MongoLocationRepository(db, mapper.fromPoint);
  const rateRepository = new MongoLocationRateRepository(db);
  const infoRepository = new MongoLocationInfoRepository(db);
  const service = new LocationManager(repository, rateRepository, infoRepository);
  return new LocationController(log, builder.search, service);
}

export function useLocationRateController(log: Log, db: Db): LocationRateController {
  const builder = new SearchBuilder<Rate, RateFilter>(db, 'locationRate', buildQuery, rateModel);
  const repository = new MongoLocationRateRepository(db);
  const service = new RateManagaer(repository);
  return new LocationRateController(log, builder.search, service);
}

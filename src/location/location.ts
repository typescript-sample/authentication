import { Attributes, Filter, Repository, ViewRepository, ViewService } from 'onecore';

export interface LocationFilter extends Filter {
  id?: string;
  name?: string;
  type?: string;
  description?: string;
  status?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}
export interface RateFilter extends Filter {
  id: string;
  review?: string;
  locationId?: string;
  userId?: string;
  rateTime: Date;
}
export interface Location {
  id?: string;
  name?: string;
  type?: string;
  description?: string;
  status?: string;
  imageURL?: string;
  latitude?: number;
  longitude?: number;
  customURL?: string;
  info?: LocationInfo;
}
export interface LocationInfo {
  id: string;
  rate: number;
  rate1: number;
  rate2: number;
  rate3: number;
  rate4: number;
  rate5: number;
  viewCount: number;
}
export interface Rate {
  id?: string;
  locationId: string;
  userId: string;
  rate: number;
  rateTime?: Date;
  review?: string;
}

export interface LocationRepository extends ViewRepository<Location, string> {
}
export interface RateRepository extends Repository<Rate, string> {
  save(rate: Rate): Promise<number>;
}
export interface LocationInfoRepository extends Repository<LocationInfo, string> {
  save(info: LocationInfo): Promise<number>;
}

export interface LocationService extends ViewService<Location, string> {
  /*
  saveLocation?(userId: string, locationId: string): Promise<boolean>;
  removeLocation?(userId: string, locationId: string): Promise<boolean>;
  getLocationsOfUser?(userId: string): Promise<Location[]>;
  */
  getLocationsByTypeInRadius?(type: string, radius: number): Promise<Location[]>;
  rate(rate: Rate): Promise<boolean>;
}
export interface RateService extends ViewService<Rate, string> {
}
export const locationModel: Attributes = {
  id: {
    key: true,
  },
  name: {
    required: true,
    q: true,
  },
  type: {
    match: 'equal',
    required: true,
  },
  description: {
    q: true,
  },
  status: {
    match: 'equal',
  },
  imageURL: {},
  latitude: {
    type: 'number',
  },
  longitude: {
    type: 'number',
  },
};

export const rateModel: Attributes = {
  id: {
    key: true,
  },
  locationId: {
    required: true
  },
  userId: {
    required: true
  },
  rate: {
    type: 'integer',
    min: 1,
    max: 5
  },
  rateTime: {
    type: 'datetime',
  },
  review: {
    q: true,
  },
};

export const locationInfoModel: Attributes = {
  id: {
    key: true,
  },
  viewCount: {
    type: 'number',
  },
  rate: {
    type: 'number',
  },
  rate1: {
    type: 'number',
  },
  rate2: {
    type: 'number',
  },
  rate3: {
    type: 'number',
  },
  rate4: {
    type: 'number',
  },
  rate5: {
    type: 'number',
  },
};

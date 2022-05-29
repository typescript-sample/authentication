import { FilterQuery } from 'mongodb';
import { Location, LocationFilter } from './location';

export function query(filter: LocationFilter): FilterQuery<Location> {
  console.log(JSON.stringify(filter));
  const q: any = {};
  if (!isEmpty(filter.status)) {
    q.status = filter.status;
  }
  if (!isEmpty(filter.type)) {
    q.type = filter.type;
  }
  let skipName = false;
  if (!isEmpty(filter.name)) {
    skipName = true;
    q.name = new RegExp(`^${filter.name}`);
  }
  let skipDescription = false;
  if (!isEmpty(filter.description)) {
    skipDescription = true;
    q.description = new RegExp(`\\w*${filter.description}\\w*`);
  }
  if (!isEmpty(filter.q)) {
    const or: any[] = [];
    if (!skipName) {
      or.push({ name: new RegExp(`^${filter.q}`) });
    }
    if (!skipDescription) {
      or.push({ description: new RegExp(`\\w*${filter.q}\\w*`) });
    }
    q.$or = or;
  }
  console.log(JSON.stringify(q));
  return q;
}
export function isEmpty(s?: string): boolean {
  return (s && s.length > 0 ? false : true);
}

import { FilterQuery } from 'mongodb';
import { User, UserFilter } from './user';

export function query(filter: UserFilter): FilterQuery<User> {
  const q: any = {};
  if (!isEmpty(filter.email)) {
    q.email = new RegExp(`^${filter.email}`);
  }
  if (!isEmptyArray(filter.interests)) {
    const or: any[] = [];
    filter?.interests?.forEach((item) => {
      or.push({ interests: new RegExp(`\\w*${item}\\w*`) });
    });
    q.$or = or;
  }
  if (!isEmpty(filter.q)) {
    const o1 = { email: new RegExp(`^${filter.q}`) };
    const o2 = { username: new RegExp(`\\w*${filter.q}\\w*`) };
    const o3 = { phone: new RegExp(`\\w*${filter.q}\\w*`) };
    const o4 = { interests: new RegExp(`\\w*${filter.q}\\w*`) };
    const or = [o1, o2, o3, o4];
    q.$or = or;
  }
  return q;
}
export function isEmpty(s?: string): boolean {
  return (s && s.length > 0 ? false : true);
}
export function isEmptyArray(s?: string[]): boolean {
  return (s && s.length > 0 ? false : true);
}

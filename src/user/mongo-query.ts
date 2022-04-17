import { FilterQuery } from 'mongodb';
import { User, UserFilter } from './user';

export function query(filter: UserFilter): FilterQuery<User> {
  console.log(JSON.stringify(filter));
  const q: any = {};
  if (!isEmpty(filter.email)) {
    q.email = new RegExp(`^${filter.email}`);
  }
  if (!isEmpty(filter.q)) {
    const o1 = { email: new RegExp(`^${filter.q}`)};
    const o2 = { username: new RegExp(`\\w*${filter.q}\\w*`)};
    const o3 = { phone: new RegExp(`\\w*${filter.q}\\w*`)};
    const or = [o1, o2, o3];
    q.$or = or;
  }
  console.log(JSON.stringify(q));
  return q;
}
export function isEmpty(s?: string): boolean {
  return (s && s.length > 0 ? false : true);
}

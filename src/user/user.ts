import { Attributes, DateRange, Filter, Repository, Service } from 'onecore';

export interface UserFilter extends Filter {
  id?: string;
  username?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date | DateRange;
}
export interface User {
  id?: string;
  username?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
}
export interface UserRepository extends Repository<User, string> {
}
export interface UserService extends Service<User, string, UserFilter> {
}

export const userModel: Attributes = {
  id: {
    key: true,
    length: 40,
  },
  username: {
    length: 120,
  },
  email: {
    length: 120,
  },
  phone: {
    length: 45,
  },
  dateOfBirth: {
    column: 'date_of_birth',
  },
};
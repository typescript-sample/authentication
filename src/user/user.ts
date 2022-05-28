import { Attributes, DateRange, Filter, ViewRepository, ViewService } from 'onecore';

export interface UserFilter extends Filter {
  userId?: string;
  username?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date | DateRange;
  interests?: string[];
  skills?: Skill[];
}
export interface Skill {
  skill: string;
  hirable?: boolean;
}
export interface User {
  userId?: string;
  username?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
}
export interface UserRepository extends ViewRepository<User, string> {
}
export interface UserService extends ViewService<User, string> {
}

export const userModel: Attributes = {
  userId: {
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
  interests: {
    type: 'strings'
  }
};

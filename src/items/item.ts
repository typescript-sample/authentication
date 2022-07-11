import { Attributes, Filter, Repository, Service } from 'onecore';

export interface Item {
  id: string;
  title: string;
  status: string;
  description?: string;
  categories?: string[];
}

export interface ItemFilter extends Filter {
  id?: string;
  title?: string;
  status?: string;
  description?: string;
  categories?: string[];
}

export interface ItemRepository extends Repository<Item, string> {
}

export interface ItemService extends Service<Item, string, ItemFilter>{
}

export const ItemModel: Attributes = {
  id: {
    key: true,
    length: 40
  },
  title: {
    required: true,
    length: 300,
    q: true
  },
  status: {
    match: "equal",
    length: 1
  },
  description: {
    length: 300,
  },
  categories: {
    type: 'primitives',
  }
};

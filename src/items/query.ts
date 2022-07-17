import { Statement } from 'query-core';
import { ItemFilter } from './item';

export function buildQuery(s: ItemFilter): Statement {
  let query = `select * from items`;
  const where = [];
  const params = [];
  let i = 1;

  if (s.id && s.id.length > 0) {
    where.push(`id = $${i++}`);
    params.push(s.id);
  }

  if (s.title && s.title.length > 0) {
    where.push(`title ilike $${i++}`);
    params.push('%' + s.title + '%');
  }

  if (s.status && s.status.length > 0) {
    where.push(`status ilike $${i++}`);
    params.push('%' + s.status + '%');
  }

  if (s.description && s.description.length > 0) {
    where.push(`description ilike $${i++}`);
    params.push('%' + s.description + '%');
  }

  if (s.categories && s.categories.length > 0) {
    params.push(s.categories);
    where.push(`categories && $${i++}`);
  }

  if (where.length > 0) {
    query = query + ` where ` + where.join(' and ');
  }

  return { query, params };
}


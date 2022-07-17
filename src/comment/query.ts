import { Statement } from 'query-core';
import { CommentFilter } from './comment';

export function buildQuery(s: CommentFilter): Statement {
  let query = `select * from comments`;
  const where = [];
  const params = [];
  let i = 1;

  if (s.id && s.id.length > 0) {
    where.push(`id = $${i++}`);
    params.push(s.id);
  }

  if (s.author && s.author.length > 0) {
    where.push(`author = $${i++}`);
    params.push(s.author);
  }
  if (where.length > 0) {
    query = query + ` where ` + where.join(' and ');
  }
  if (s.limit && s.limit > 0) {
    query = query + ` limit ${s.limit}`;
  }
  return { query, params };
}

import { Application } from 'express';
import multer from 'multer';
import { ApplicationContext } from './context';

export function route(app: Application, ctx: ApplicationContext): void {
  const parser = multer();
  app.get('/health', ctx.health.check);
  app.patch('/log', ctx.log.config);
  app.patch('/middleware', ctx.middleware.config);
  app.post('/authenticate', parser.none(), ctx.authentication.authenticate);

  app.post('/users/search', ctx.user.search);
  app.get('/users/search', ctx.user.search);
  app.get('/users/:id', ctx.user.load);
  app.post('/users', ctx.user.create);
  app.put('/users/:id', ctx.user.update);
  app.patch('/users/:id', ctx.user.patch);
  app.delete('/users/:id', ctx.user.delete);
}

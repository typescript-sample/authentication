import { Application } from 'express';
import multer from 'multer';
import { ApplicationContext } from './context';

export function route(app: Application, ctx: ApplicationContext): void {
  const parser = multer();
  app.get('/health', ctx.health.check);
  app.patch('/log', ctx.log.config);
  app.patch('/middleware', ctx.middleware.config);

  app.post('/authenticate', parser.none(), ctx.authentication.authenticate);
  app.post('/signup/signup', ctx.signup.signup);
  app.post('/signup/verify/:userId/:code', ctx.signup.verify);
  app.get('/signup/verify/:userId/:code', ctx.signup.verify);

  app.get('/password/forgot/:contact', ctx.password.forgot);
  app.post('/password/forgot', ctx.password.forgot);
  app.post('/password/reset', ctx.password.reset);
  app.post('/password/change', ctx.password.change);
  app.put('/password/change', ctx.password.change);

  app.get('/my-profile/:id', ctx.myprofile.getMyProfile);
  app.get('/my-profile/:id/settings', ctx.myprofile.getMySettings);
  app.get('/my-profile/:id/fetchImageGalleryUploaded', ctx.myprofile.getGallery);
  app.patch('/my-profile/:id', ctx.myprofile.saveMyProfile);
  app.patch('/my-profile/:id/settings', ctx.myprofile.saveMySettings);
  app.post('/my-profile/:id/cover', parser.array('files'), ctx.myprofile.uploadCover);
  app.post('/my-profile/:id/upload', parser.array('files'), ctx.myprofile.uploadImage);
  app.post('/my-profile/:id/gallery', parser.single('file'), ctx.myprofile.uploadGallery);
  app.patch('/my-profile/:id/gallery', ctx.myprofile.updateGallery);
  app.delete('/my-profile/:id/gallery', ctx.myprofile.deleteGalleryFile);
  app.post('/my-profile/:id/external-resource', ctx.myprofile.addExternalResource);
  app.delete('/my-profile/:id/external-resource', ctx.myprofile.deleteExternalResource);

  app.get('/skills', ctx.skill.query);
  app.get('/interests', ctx.interest.query);
  app.get('/looking-for', ctx.lookingFor.query);

  app.post('/users/search', ctx.user.search);
  app.get('/users/search', ctx.user.search);
  app.get('/users/:id', ctx.user.load);

  app.get('/appreciation', ctx.appreciation.search);
  app.post('/appreciation/search', ctx.appreciation.search);
  app.get('/appreciation/search', ctx.appreciation.search);
  app.get('/appreciation/:id', ctx.appreciation.load);
  app.post('/appreciation', ctx.appreciation.create);
  app.put('/appreciation/:id', ctx.appreciation.update);
  app.patch('/appreciation/:id', ctx.appreciation.patch);
  app.delete('/appreciation/:id', ctx.appreciation.delete);

  app.post('/locations/search', ctx.location.search);
  app.get('/locations/search', ctx.location.search);
  app.get('/locations/:id', ctx.location.load);
  app.post('/locations/rateLocation', ctx.location.rate);

  app.get('/location-rates/search', ctx.rate.search);
  app.post('/location-rates/search', ctx.rate.search);
  app.get('/location-rates/:id', ctx.rate.load);

  app.post('/articles/search', ctx.article.search);
  app.get('/articles/search', ctx.article.search);
  app.get('/articles/:id', ctx.article.load);

  app.post('/my-articles/search', ctx.myarticles.search);
  app.get('/my-articles/search', ctx.myarticles.search);
  app.get('/my-articles/:id', ctx.myarticles.load);
  app.post('/my-articles', ctx.myarticles.create);
  app.put('/my-articles/:id', ctx.myarticles.update);
  app.patch('/my-articles/:id', ctx.myarticles.patch);
  app.delete('/my-articles/:id', ctx.myarticles.delete);
}

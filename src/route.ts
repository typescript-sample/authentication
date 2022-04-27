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
  app.get('/my-profile/fetchImageUploaded/:id', ctx.myprofile.fetchUploadedCover);
  app.get('/my-profile/fetchImageGalleryUploaded/:id', ctx.myprofile.fetchUploadedGallery);
  app.patch('/my-profile', ctx.myprofile.saveMyProfile);
  app.patch('/my-profile/:id/settings', ctx.myprofile.saveMySettings);
  app.post('/my-profile/upload', parser.single('file'), ctx.myprofile.uploadCover);
  app.post('/my-profile/uploadAvatar', parser.single('file'), ctx.myprofile.uploadAvatar);
  app.post('/my-profile/uploadGallery', parser.single('file'), ctx.myprofile.uploadGallery);
  app.patch('/my-profile/uploadGallery', ctx.myprofile.updateGallery);
  app.delete('/my-profile/uploadGallery', ctx.myprofile.deleteGallery);

  app.post('/users/search', ctx.user.search);
  app.get('/users/search', ctx.user.search);
  app.get('/users/:id', ctx.user.load);
}

import { Request, Response } from 'express';
import { buildAndCheckId, handleError, minimize, respondModel } from 'express-ext';
import { Log } from 'onecore';
import { UserSettings } from '../my-profile';
import { MyProfileService, UploadData, UploadGallery } from './user';
export class MyProfileController {
  constructor(
    private log: Log,
    private service: MyProfileService,
    private generateId: () => string
  ) {
    this.getMyProfile = this.getMyProfile.bind(this);
    this.getMySettings = this.getMySettings.bind(this);
    this.saveMyProfile = this.saveMyProfile.bind(this);
    this.saveMySettings = this.saveMySettings.bind(this);
    this.uploadCover = this.uploadCover.bind(this);
    this.getCoverURL = this.getCoverURL.bind(this);
    this.getGallery = this.getGallery.bind(this);
    this.updateGallery = this.updateGallery.bind(this);
    this.uploadGallery = this.uploadGallery.bind(this);
    this.deleteGalleryFile = this.deleteGalleryFile.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
  }
  getMyProfile(req: Request, res: Response) {
    const id = buildAndCheckId<string>(req, res);
    if (id) {
      this.service
        .getMyProfile(id)
        .then((user) => respondModel(minimize(user), res))
        .catch((err) => handleError(err, res, this.log));
    }
  }
  getMySettings(req: Request, res: Response) {
    const id = req.params['id'];
    if (!id || id.length === 0) {
      res.status(400).send('id cannot be empty');
    } else {
      this.service
        .getMySettings(id)
        .then((settings) => {
          if (settings) {
            res.status(200).json(settings);
          } else {
            res.status(404).json(null);
          }
        })
        .catch((err) => handleError(err, res, this.log));
    }
  }
  saveMyProfile(req: Request, res: Response) {
    const data = req.body;
    if (!data) {
      res.status(400).send('data cannot be empty');
    } else {
      this.service
        .saveMyProfile(data)
        .then((user) => {
          if (user) {
            res.status(200).json(user);
          } else {
            res.status(404).json(null);
          }
        })
        .catch((err) => handleError(err, res, this.log));
    }
  }
  saveMySettings(req: Request, res: Response) {
    const id = req.params['id'];
    if (!id || id.length === 0) {
      res.status(400).send('id cannot be empty');
    } else {
      const settings: UserSettings = req.body;
      if (!settings) {
        res.status(400).send('data cannot be empty');
      } else {
        this.service
          .saveMySettings(id, settings)
          .then((user) => {
            if (user) {
              res.status(200).json(user);
            } else {
              res.status(404).json(null);
            }
          })
          .catch((err) => handleError(err, res, this.log));
      }
    }
  }

  getCoverURL(req: Request, res: Response) {
    const id = buildAndCheckId<string>(req, res);
    if (id) {
      this.service
        .getMyProfile(id)
        .then((user) => respondModel(user?.coverURL, res))
        .catch((err) => handleError(err, res, this.log));
    }
  }
  getGallery(req: Request, res: Response) {
    const id = buildAndCheckId<string>(req, res);
    if (id) {
      this.service
        .getMyProfile(id)
        .then((user) => respondModel(minimize(user?.gallery ?? []), res))
        .catch((err) => handleError(err, res, this.log));
    }
  }
  uploadCover(req: Request, res: Response) {
    if (!req || !req.file) {
      return;
    }
    const fileName = req.file.originalname;
    const data = req.file.buffer;
    const { id } = req.body;
    const name = `${id.toString()}_${fileName}`;
    if (!id) {
      res.status(400).send('id cannot be empty');
    } else {
      this.service
        .uploadCoverImage(id, name, data)
        .then((result) => res.status(200).json(result))
        .catch((e) => handleError(e, res, this.log));
    }
  }
  uploadImage(req: Request, res: Response) {
    if (!req || !req.file) {
      return;
    }
    const fileName = req.file.originalname;
    const data = req.file.buffer;
    const { id } = req.body;
    const name = `${id.toString()}_${fileName}`;
    if (!id) {
      res.status(400).send('id cannot be empty');
    } else {
      this.service
        .uploadImage(id, name, data)
        .then((result) => res.status(200).json(result))
        .catch((e) => handleError(e, res, this.log));
    }
  }
  uploadGallery(req: Request, res: Response) {
    if (!req || !req.file) {
      return;
    }
    const data = req.file.buffer;
    const fileType = req.file.mimetype;
    const type = fileType.split('/')[0];
    const { id, source } = req.body;
    const upload: UploadGallery = {
      id,
      source,
      name: `${id.toString()}_${this.generateId()}`,
      data,
      type,
    };
    if (!upload) {
      res.status(400).send('data cannot be empty');
    } else {
      this.service
        .uploadGalleryFile(upload)
        .then((result) => res.status(200).json(result))
        .catch((e) => handleError(e, res, this.log));
    }
  }
  updateGallery(req: Request, res: Response) {
    const { userId, data } = req.body;
    if (userId) {
      this.service
        .updateGallery(userId, data)
        .then((result) => res.status(200).json(result))
        .catch((err) => handleError(err, res, this.log));
    }
  }
  deleteGalleryFile(req: Request, res: Response) {
    const id = req.query.userId?.toString();
    const url = req.query.url?.toString();
    if (id && url) {
      this.service
        .deleteGalleryFile(id, url)
        .then((result) => res.status(200).json(result))
        .catch((err) => handleError(err, res, this.log));
    }
  }
}

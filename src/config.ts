export const config = {
  port: 8082,
  secure: false,
  allow: {
    origin: 'http://localhost:3001',
    credentials: 'true',
    methods: 'GET,PUT,POST,DELETE,OPTIONS,PATCH',
    headers: 'Access-Control-Allow-Headers, Authorization, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers'
  },
  log: {
    level: 'info',
    map: {
      time: '@timestamp',
      msg: 'message'
    }
  },
  middleware: {
    log: true,
    skips: 'health,log,authenticate',
    request: 'request',
    status: 'status',
    size: 'size'
  },
  mongo: {
    uri: 'mongodb://localhost:27017',
    db: 'authentication'
  },
  secret: 'secret',
  auth: {
    token: {
      secret: 'secretbackoffice',
      expires: 86400000
    },
    status: {
      success: 1
    },
    lockedMinutes: 1,
    maxPasswordFailed: 3,
    payload: {
      id: 'id',
      username: 'username',
      email: 'email',
      userType: 'userType'
    },
    account: {
      displayName: 'displayname'
    },
    userStatus: {
      activated: 'A',
      deactivated: 'D'
    },
    db: {
      user: 'user',
      password: 'authentication',
      username: 'username',
      status: 'status',
      successTime: 'successTime',
      failTime: 'failTime',
      failCount: 'failCount',
      lockedUntilTime: 'lockedUntilTime'
    }
  },
  signup: {
    expires: 500,
    userStatus: {
      registered: 'R',
      codeSent: 'V',
      activated: 'A'
    },
    maxPasswordAge: 90,
    fields: {
      maxPasswordAge: 'maxPasswordAge'
    },
    map: {
      firstName: 'surname',
      lastName: 'givenName'
    },
    track: {
      createdAt: 'createdAt',
      createdBy: 'createdBy',
      updatedAt: 'updatedAt',
      updatedBy: 'updatedBy',
      version: 'version'
    },
    url: 'http://localhost:8082/verify',
    email: {
      subject: 'User registration confirmation',
      body: `
Please click this link to confirm to activate your account:<br><a href="%s">Confirm Now</a><br><br>
If the above button doesn't work for you, please click on the below link or copy paste it on to your browser<br>
<a href="%s">%s</a><br><br>
Your link will expire after "%s" minutes.

Hẫy nhấn đường link ở đây để kích hoạt cài khoản của bạn: <br><a href="%s">Xác nhận</a><br><br>
Nếu đường link đó không hoạt động, hãy sao chép đường link đó và dán vào trình duyệt web của bạn<br>
<a href="%s">%s</a><br><br>
Đường link này sẽ hết hạn sau "%s" phút.`
    }
  },
  password: {
    max: 3,
    expires: 1500,
    db: {
      user: 'user',
      password: 'authentication',
      history: 'history'
    },
    fields: {
      contact: 'email'
    },
    templates: {
      reset: {
        subject: 'Passcode to reset password',
        body: `Your user name is %s. This is the passcode to reset your password: %s. This passcode will expire in %s minutes.<br>
        Tên đăng nhập của bạn là %s. Hãy dùng mã sau để tạo mật khẩu lại: %s. Mã này sẽ hết hạn trong %s phút.`
      },
      change: {
        subject: 'Passcode to change password',
        body: `Your user name is %s. This is the passcode to reset your password: %s. This passcode will expire in %s minutes.<br>
        Tên đăng nhập của bạn là %s. Hãy dùng mã sau để tạo mật khẩu lại: %s. Mã này sẽ hết hạn trong %s phút.`
      },
    }
  },
  mail: {
    key: '',
    from: {
      name: 'Supporter',
      email: 'test@gmail.com'
    }
  }
};

export const env = {
  sit: {
    mongo: {
      db: 'masterdata_sit',
    }
  },
  prd: {
    log: {
      level: 'error'
    },
    middleware: {
      log: false
    }
  }
};

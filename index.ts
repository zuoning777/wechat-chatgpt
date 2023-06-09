import { WechatyBuilder } from 'wechaty';
import { receiveMsg } from './wechat/message';
import { onScan, onLogin, onLogout, onError } from './wechat/login';

const wechaty = WechatyBuilder.build();
wechaty
  .on('scan', onScan)
  .on('login', onLogin)
  .on('message', receiveMsg)
  .on('error', onError)
  .on('logout', onLogout);

wechaty.start();

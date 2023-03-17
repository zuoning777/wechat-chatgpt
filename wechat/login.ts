import { ScanStatus } from 'wechaty';
import { ContactSelfInterface } from 'wechaty/impls';
import qrcode from 'qrcode-terminal';
import { outputLog } from '../utils/file';

export const onScan = (code: string, status: ScanStatus) => {
  // status: 2代表等待，3代表扫码完成
  status === ScanStatus.Waiting && qrcode.generate(code, { small: true }, console.log);
};

export const onLogout = (user: ContactSelfInterface) => {
  console.log(`用户 ${user} 退出成功`);
};
export const onLogin = (user: ContactSelfInterface) => {
  console.log(`用户 ${user} 登录成功`);
};

export const onError = outputLog;

import fs from 'fs';
import path from 'path';

export const outputLog = (content: any) => {
  const opt = {
    flag: 'a' // a：追加写入；w：覆盖写入
  };

  fs.writeFile(
    path.join(__dirname, '../error.log'),
    `${JSON.stringify(content, null, 4)}\n`,
    opt,
    () => {}
  );
};

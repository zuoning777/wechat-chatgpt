import axios from 'axios';
import { outputLog } from '../utils/file';
import { WENXIN_URL } from './constant';

export enum EWenXinImgStyle {
  '探索无限' = '探索无限',
  '古风' = '古风',
  二次元 = '二次元',
  写实风格 = '写实风格',
  浮世绘 = '浮世绘',
  'low poly' = 'low poly',
  未来主义 = '未来主义',
  像素风格 = '像素风格',
  概念艺术 = '概念艺术',
  赛博朋克 = '赛博朋克',
  洛丽塔风格 = '洛丽塔风格',
  巴洛克风格 = '巴洛克风格',
  超现实主义 = '超现实主义',
  水彩画 = '水彩画',
  蒸汽波艺术 = '蒸汽波艺术',
  油画 = '油画',
  卡通画 = '卡通画'
}

interface ICreateImgParams {
  text: string;
  style: EWenXinImgStyle;
}

interface ICreateImgRes {
  data: {
    taskId: number;
  };
}

enum EImgTaskStatus {
  WAITING = 0,
  DONE = 1
}

interface IWenXinGetImg {
  data: {
    waiting: number;
    img: string;
    status: EImgTaskStatus;
  };
}

export const createImgByWenXin = async (params: ICreateImgParams) => {
  const { text, style } = params;
  try {
    const { data: imgTaskData } = await axios.post<ICreateImgRes>(
      `${WENXIN_URL}/txt2img?access_token=${process.env.WENXIN_TOKEN}`,
      {
        text,
        style,
        resolution: '1536*1024'
      }
    );
    const { taskId } = imgTaskData.data;
    let imgUrl = '';
    // 生成图片需要时间，2s请求一次图片队列
    await new Promise((resolve) => {
      const timer = setInterval(async () => {
        const { data: imgData } = await axios.post<IWenXinGetImg>(
          `${WENXIN_URL}/getImg?access_token=${process.env.WENXIN_TOKEN}`,
          {
            taskId
          }
        );
        const taskStatus = imgData.data.status;
        if (taskStatus === EImgTaskStatus.DONE) {
          clearInterval(timer);
          imgUrl = imgData.data.img;
          resolve(true);
        }
      }, 2000);
    });
    return imgUrl;
  } catch (error) {
    outputLog(error);
  }
};

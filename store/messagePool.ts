import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum } from 'openai';
import { chatWithOpenAi } from '../openai';
import { createImgByWenXin, EWenXinImgStyle } from '../wenxin';
import { WenXinImgStyle } from '../wenxin/constant';

// 记录消息历史
const msgPools = new Map<string, ChatCompletionRequestMessage[]>();

// 记录当前是否在处理对话
const requestPools = new Map<string, boolean>();

// 记录各个对话的画风
const imgStylePools = new Map<string, EWenXinImgStyle>();

const SET_IMG_STYLE = '设置画风';

const CREATE_IMG = '画图';

interface IResponseMsg {
  text?: string;
  url?: string;
}

// 保留上下文
export const memoMessage = async (id: string, text: string): Promise<IResponseMsg> => {
  // 拦截非对话目的的消息
  const _text = text.trim();
  // 查看画风列表
  if (_text === SET_IMG_STYLE) {
    return {
      text: `当前支持如下风格，@我输入下列风格之一即可设置：\n ${WenXinImgStyle.join('\n')}`
    };
  }
  // 设置画风
  if (WenXinImgStyle.includes(_text)) {
    imgStylePools.set('id', _text as EWenXinImgStyle);
    return { text: `设置成功，当前画风为${_text}` };
  }
  const prefix = _text.split(' ')[0];
  // 画图
  if (prefix === CREATE_IMG) {
    const key = _text.split(CREATE_IMG)[1].trim();
    const style = imgStylePools.get('id') || EWenXinImgStyle.油画;
    const url = await createImgByWenXin({ text: key, style });
    return { url };
  }

  const historyMsg = msgPools.get(id);
  let msgList = (historyMsg || []).concat([
    {
      role: ChatCompletionRequestMessageRoleEnum.User,
      content: text
    }
  ]);
  // 一次只处理一条对话
  if (requestPools.get(id)) return {};
  requestPools.set(id, true);
  const res = await chatWithOpenAi(msgList);
  const resMsg = res?.message;
  // 检查是否消息上下文超出上限
  const isExceed = res?.isExceed;
  if (isExceed) {
    msgList = msgList.slice(2);
  }
  requestPools.set(id, false);
  if (!resMsg) {
    // 可能移除了两条上下文后还是超出token，继续移除
    msgList = msgList.slice(2);
    return { text: 'openai接口报错🌶' };
  }

  msgList.push(resMsg);
  msgPools.set(id, msgList);
  return { text: resMsg.content };
};

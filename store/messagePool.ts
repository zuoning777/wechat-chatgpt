import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum } from 'openai';
import { chatWithOpenAi } from '../openai';

// 记录消息历史
const msgPools = new Map<string, ChatCompletionRequestMessage[]>();

// 记录当前是否在处理对话
const requestPools = new Map<string, boolean>();

// 保留上下文
export const memoMessage = async (id: string, text: string) => {
  const historyMsg = msgPools.get(id);
  let msgList = (historyMsg || []).concat([
    {
      role: ChatCompletionRequestMessageRoleEnum.User,
      content: text
    }
  ]);
  // 一次只处理一条对话
  if (requestPools.get(id)) return;
  requestPools.set(id, true);
  const res = await chatWithOpenAi(msgList);
  const resMsg = res?.message;
  // 检查是否消息上下文超出上限
  const isExceed = res?.isExceed;
  if (isExceed) {
    msgList = msgList.slice(2);
  }
  requestPools.set(id, false);
  if (!resMsg) return;

  msgList.push(resMsg);
  msgPools.set(id, msgList);
  return resMsg.content;
};

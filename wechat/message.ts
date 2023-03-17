import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum } from 'openai';
import { Message } from 'wechaty';
import { RoomInterface } from 'wechaty/impls';
import { chatWithOpenAi } from '../openai';

// 记录消息历史
const msgPools = new Map<string, ChatCompletionRequestMessage[]>();

// 记录当前是否在处理对话
const requestPools = new Map<string, boolean>();

export const receiveMsg = async (msg: Message) => {
  // 被@的情况
  if (await msg.mentionSelf()) {
    // 当前会话群聊
    const text = await msg.mentionText();
    if (!text) return;
    const room = msg.room() as RoomInterface;
    const roomId = `room-${room.id}`;

    const talker = msg.talker();
    const historyMsg = msgPools.get(roomId);
    let msgList = (historyMsg || []).concat([
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: text
      }
    ]);
    // 一次只处理一条对话
    if (requestPools.get(roomId)) return;
    requestPools.set(roomId, true);
    const res = await chatWithOpenAi(msgList);
    const resMsg = res?.message;
    // 检查是否消息上下文超出上限
    const isExceed = res?.isExceed;
    if (isExceed) {
      msgList = msgList.slice(2);
    }
    requestPools.set(roomId, false);
    if (!resMsg) return;
    const resText = resMsg.content;

    msgList.push(resMsg);
    msgPools.set(roomId, msgList);
    sendMsg(msg, resText, `@${talker.name()}：${text}`);
  } else if (!msg.room()) {
    // 私聊的情况
    const text = msg.text();
    if (!text) return;

    const talker = msg.talker();
    const talkerId = `talker-${talker.id}`;

    const historyMsg = msgPools.get(talkerId);
    let msgList = (historyMsg || []).concat([
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: text
      }
    ]);
    // 一次只处理一条对话
    if (requestPools.get(talkerId)) return;
    requestPools.set(talkerId, true);
    const res = await chatWithOpenAi(msgList);
    const resMsg = res?.message;
    // 检查是否消息上下文超出上限
    const isExceed = res?.isExceed;
    if (isExceed) {
      msgList = msgList.slice(2);
    }
    requestPools.set(talkerId, false);
    if (!resMsg) return;
    const resText = resMsg.content;

    msgList.push(resMsg);
    msgPools.set(talkerId, msgList);
    sendMsg(msg, resText);
  }
};

const sendMsg = async (msg: Message, text: string, originText?: string) => {
  if (originText) {
    text = originText + '\n----------------------------------\n' + text;
  }
  await msg.say(text);
};

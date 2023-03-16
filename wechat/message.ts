import { Message } from 'wechaty';

const msgPools = new Map();

export const receiveMsg = async (msg: Message) => {
  // 被@的情况
  if (await msg.mentionSelf()) {
    // 当前会话群聊
    const text = await msg.mentionText();
    if (!text) return;

    const talker = msg.talker();
    const historyMsg = msgPools.get(talker);
    msgPools.set(talker, (historyMsg || []).concat([text]));
    sendMsg(msg, msgPools.get(talker).join('\n'), `@${talker.name()}：${text}`);
  } else if (!msg.room()) {
    // 私聊的情况
    const text = msg.text();
    if (!text) return;

    sendMsg(msg, text);
  }
};

const sendMsg = async (msg: Message, text: string, originText?: string) => {
  if (originText) {
    text = originText + '\n----------------------------------\n' + text;
  }
  await msg.say(text);
};

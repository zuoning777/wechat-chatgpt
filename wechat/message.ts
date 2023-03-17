import { Message } from 'wechaty';
import { RoomInterface } from 'wechaty/impls';
import { memoMessage } from '../store/messagePool';

export const receiveMsg = async (msg: Message) => {
  // 被@的情况
  if (await msg.mentionSelf()) {
    // 当前会话群聊
    const text = await msg.mentionText();
    if (!text) return;
    const room = msg.room() as RoomInterface;
    const roomId = `room-${room.id}`;

    const talker = msg.talker();
    const resText = await memoMessage(roomId, text);
    if (resText) {
      sendMsg(msg, resText, `@${talker.name()}：${text}`);
    }
  } else if (!msg.room()) {
    // 私聊的情况
    const text = msg.text();
    if (!text) return;

    const talker = msg.talker();
    const talkerId = `talker-${talker.id}`;

    const resText = await memoMessage(talkerId, text);
    if (resText) {
      sendMsg(msg, resText);
    }
  }
};

const sendMsg = async (msg: Message, text: string, originText?: string) => {
  if (originText) {
    text = originText + '\n----------------------------------\n' + text;
  }
  await msg.say(text);
};

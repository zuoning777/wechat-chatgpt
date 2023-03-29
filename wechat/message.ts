import { Message } from 'wechaty';
import { RoomInterface } from 'wechaty/impls';
import { FileBox } from 'file-box';
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
    const res = await memoMessage(roomId, text);

    sendMsg(msg, res, `@${talker.name()}：${text}`);
  } else if (!msg.room()) {
    // 私聊的情况
    const text = msg.text();
    if (!text) return;

    const talker = msg.talker();
    if (talker.name() === '微信团队') {
      return;
    }
    const talkerId = `talker-${talker.id}`;

    const res = await memoMessage(talkerId, text);
    sendMsg(msg, res);
  }
};

const sendMsg = async (
  msg: Message,
  payload: { text?: string; url?: string },
  originText?: string
) => {
  let { text, url } = payload;
  if (text) {
    if (originText) {
      text = originText + '\n----------------------------------\n' + text;
    }
    await msg.say(text);
  } else if (url) {
    // 文心一言的图片没有后缀，需要拼接.png后缀识别为图片
    const fileBox = FileBox.fromUrl(`${url}.png`);
    await msg.say(fileBox);
  }
};

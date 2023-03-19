import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai';
import { outputLog } from '../utils/file';

// 最大文本上限 gpt-3.5-turbo最大为4096，预留一定值
const MAX_TOKEN = 3800;

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

export const chatWithOpenAi = async (messages: ChatCompletionRequestMessage[]) => {
  try {
    const { data } = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: messages
    });
    const currentToken = data.usage?.total_tokens || 0;
    return {
      isExceed: currentToken >= MAX_TOKEN,
      message: data.choices[0].message
    };
  } catch (error) {
    outputLog(error);
  }
};

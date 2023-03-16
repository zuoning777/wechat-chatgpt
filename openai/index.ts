import { Configuration, OpenAIApi } from 'openai';
import { outputLog } from '../utils/file';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

export const chatWithOpenAi = async () => {
  try {
    const { data } = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: 'Hello World'
        }
      ]
    });
    console.log(data.choices[0].message);
  } catch (error) {
    outputLog(error);
  }
};

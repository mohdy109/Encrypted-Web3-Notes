import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PromptTemplate } from 'langchain/prompts';
import { LLMChain } from 'langchain/chains';

const llm = new ChatOpenAI({ openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_KEY });

export async function summarizeText(text) {
  const prompt = PromptTemplate.fromTemplate('Summarize this: {text}');
  const chain = new LLMChain({ llm, prompt });
  const result = await chain.call({ text });
  return result.text;
}

export async function detectTone(text) {
  const prompt = PromptTemplate.fromTemplate('What is the tone of this message: {text}');
  const chain = new LLMChain({ llm, prompt });
  const result = await chain.call({ text });
  return result.text;
}
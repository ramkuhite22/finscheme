import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import dotenv from 'dotenv';
import { analyzeGrammarly } from '../skills/humanizer/grammarly.js';

dotenv.config({ path: '.env.local' });

const openai = createOpenAI({
  apiKey: process.env.AI_GATEWAY_API_KEY || 'dummy_key',
  baseURL: 'https://gateway.ai.vercel.com/v1',
});

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const { text, tone } = await req.json();

  let systemPrompt = "You are a 'Government Jargon Humanizer' API for FinScheme. Your job is to translate complex, bureaucratic Indian government text into plain, simple English.";
  
  if (tone === 'student') {
    systemPrompt += " Explain it specifically for an 18-25 year old student. Keep it engaging, direct, and highlight key documents clearly.";
  } else if (tone === 'farmer') {
    systemPrompt += " Explain it specifically for an Indian farmer. Keep the language extremely simple and respectful, emphasizing practical steps like visiting the bank or submitting village documents.";
  } else if (tone === 'elderly') {
    systemPrompt += " Explain it for a senior citizen. Be polite, reassuring, and extremely clear about dates and paperwork.";
  } else {
    systemPrompt += " Use clear, concise plain English. Strip out all confusing legal words.";
  }

  systemPrompt += "\n\nFormat your response safely as an HTML snippet (e.g. use <strong> for emphasis). Do NOT include markdown blocks like ```html. Output only the translated text snippet in quotes.";

  try {
    const result = await generateText({
      model: openai('openai/gpt-5.4'),
      prompt: `Translate this government text:\n\n${text}`,
      system: systemPrompt,
    });

    const humanizedText = result.text;
    
    // Analyze the quality of the translation using our custom engine
    const metrics = analyzeGrammarly(humanizedText);

    return new Response(JSON.stringify({ 
      result: humanizedText,
      score: metrics.score,
      analysis: metrics.alerts
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('AI API Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to humanize text' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}


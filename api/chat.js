import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const openai = createOpenAI({
  apiKey: process.env.AI_GATEWAY_API_KEY || 'dummy_key',
  baseURL: 'https://gateway.ai.vercel.com/v1',
});

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const { messages } = await req.json();

  let contextData = '';
  try {
    const rightsPath = path.join(process.cwd(), 'data', 'rights.json');
    const rightsFile = fs.readFileSync(rightsPath, 'utf-8');
    const rights = JSON.parse(rightsFile);
    
    contextData = rights.map(r => 
      `Right: ${r.title}\nCategory: ${r.category}\nWho is eligible: ${r.occupation.join(', ')}\nSummary: ${r.summary}\nBenefit: ${r.benefit}`
    ).join('\n\n');
  } catch (err) {
    console.error('Failed to load rights data:', err);
  }

  const systemPrompt = `You are the FinScheme AI Assistant. You are a highly empathetic, knowledgeable, and patient expert on Indian Central and State Government schemes. 
Your primary goal is to help citizens (especially farmers, students, marginalized communities, and senior citizens) discover schemes they are eligible for.

Here is the official FinScheme database of citizen rights you MUST use to answer questions:
=== RIGHTS DATABASE ===
${contextData}
=======================

Rules:
1. Strip away all bureaucratic jargon. Use extremely simple, plain English.
2. If asked about employee rights, insurance, or specific domains, provide clear, actionable summaries based ONLY on the Rights Database above.
3. If they ask "Am I eligible?" remind them they can use the FinScheme Eligibility Wizard above.
4. Always be polite and encouraging. Frame government benefits as their rightful claim, not charity.`;

  try {
    const result = await streamText({
      model: openai('openai/gpt-5.4'),
      messages,
      system: systemPrompt,
    });

    return result.toDataStreamResponse();
  } catch (err) {
    console.error('Chat API Error:', err);
    return new Response(JSON.stringify({ error: 'AI Gateway Error' }), { status: 500 });
  }
}


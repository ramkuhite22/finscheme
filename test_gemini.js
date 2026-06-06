import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

console.log('Environment variables check:');
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('GOOGLE_API_KEY exists:', !!process.env.GOOGLE_API_KEY);

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.log('No Gemini or Google API key found in environment.');
  process.exit(0);
}

try {
  const google = createGoogleGenerativeAI({
    apiKey
  });

  console.log('Running test query with gemini-2.5-flash...');
  const { text } = await generateText({
    model: google('gemini-2.5-flash'),
    prompt: 'Respond with the word "Success" and nothing else.'
  });
  console.log('Result:', text);
} catch (error) {
  console.error('Error running Gemini:', error);
}

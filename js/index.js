import { streamText, generateImage, experimental_generateVideo } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { writeFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const gatewayKey = process.env.AI_GATEWAY_API_KEY;

// Setup Providers with AI Gateway
const openai = createOpenAI({
  apiKey: gatewayKey,
  baseURL: 'https://gateway.ai.vercel.com/v1',
});

const google = createGoogleGenerativeAI({
  apiKey: gatewayKey,
  baseURL: 'https://gateway.ai.vercel.com/v1',
});

async function main() {
  console.log('--- Text Generation ---');
  try {
    const { textStream, usage } = await streamText({
      model: openai('openai/gpt-5.4'),
      prompt: 'Summarize the benefits of government schemes for rural farmers.',
    });

    for await (const textPart of textStream) {
      process.stdout.write(textPart);
    }
    
    const finalUsage = await usage;
    console.log('\n\nToken Usage:', finalUsage);
  } catch (error) {
    console.error('Text Gen Error:', error.message || error);
  }

  console.log('\n--- Image Generation ---');
  try {
    const { image } = await generateImage({
      model: google.image('google/gemini-3.1-flash-image-preview'),
      prompt: 'A futuristic digital portal for government schemes, high-tech, welcoming atmosphere.',
    });

    writeFileSync('generated-image.png', image.uint8Array);
    console.log('Image saved to generated-image.png');
  } catch (error) {
    console.error('Image Gen Error:', error.message || error);
  }

  console.log('\n--- Video Generation ---');
  try {
    const { video } = await experimental_generateVideo({
      model: google.video('google/veo-3.1-generate-001'),
      prompt: 'A cinematic walkthrough of a Digital India service center, vibrant and professional.',
    });

    writeFileSync('generated-video.mp4', video.uint8Array);
    console.log('Video saved to generated-video.mp4');
  } catch (error) {
    console.error('Video Gen Error:', error.message || error);
  }
}

main().catch(console.error);

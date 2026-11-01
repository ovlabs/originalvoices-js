/**
 * Example: Using the askTwins tool with Vercel AI SDK
 *
 * This example demonstrates how to use the askTwins tool to gather
 * audience insights using OriginalVoices Digital Twins.
 *
 * Prerequisites:
 * 1. Set ORIGINALVOICES_API_KEY environment variable
 * 2. Install @ai-sdk/openai and set OPENAI_API_KEY (or use another AI provider)
 *
 * Run with: npx tsx examples/askTwins.example.ts
 */

import { askTwins, listAudiences, listStudies } from '../src/index.js';

async function main() {
  console.log('OriginalVoices AI SDK - askTwins Tool Example\n');
  console.log('='.repeat(50) + '\n');

  // Check for required environment variables
  if (!process.env.ORIGINALVOICES_API_KEY) {
    console.error('Error: ORIGINALVOICES_API_KEY environment variable is not set.');
    console.error('Please set it before running this example.\n');
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable is not set.');
    console.error('Please set it before running this example.\n');
    console.error('(Or modify this example to use a different AI provider)\n');
    process.exit(1);
  }

  // Dynamic import to avoid requiring @ai-sdk/openai as a dependency
  // You can replace this with any other AI SDK provider
  const { generateText, stepCountIs } = await import('ai');
  // @ts-expect-error - @ai-sdk/openai is an optional dependency for this example
  const { openai } = await import('@ai-sdk/openai');

  console.log('Asking UK fitness enthusiasts about running shoes...\n');

  const result = await generateText({
    model: openai('gpt-4o'),
    tools: { askTwins, listAudiences, listStudies },
    stopWhen: stepCountIs(5),
    prompt:
      'I want to understand what influences UK fitness enthusiasts aged 18-30 when buying new running shoes',
  });

  console.log('AI Response:', result.text);
  console.log('\nTool Calls:', JSON.stringify(result.toolCalls, null, 2));
  console.log('\nTool Results:', JSON.stringify(result.toolResults, null, 2));

  console.log('\n' + '='.repeat(50));
  console.log('Example completed!');
}

main().catch(console.error);

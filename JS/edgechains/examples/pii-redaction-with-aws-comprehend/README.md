# PII Redaction with AWS Comprehend Example

This example demonstrates how to use the new `AWSComprehendPIIRedactor` class to redact sensitive information from prompts before sending them to LLMs.

## Setup

1. Set your AWS credentials:
   ```bash
   export AWS_ACCESS_KEY_ID=your-key
   export AWS_SECRET_ACCESS_KEY=your-secret
   export AWS_REGION=us-east-1
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the example:
   ```bash
   npx ts-node index.ts
   ```

## How it chains with Endpoint classes

```typescript
import { OpenAI } from "@arakoodev/edgechains.js/ai";
import { AWSComprehendPIIRedactor } from "@arakoodev/edgechains.js/ai";

const redactor = new AWSComprehendPIIRedactor();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function safeChat(userPrompt: string) {
  // Step 1: Redact PII
  const { redactedText } = await redactor.redact(userPrompt);
  
  // Step 2: Chain to LLM
  const response = await openai.chat({ prompt: redactedText });
  
  return response;
}
```

## Loom Video Demo

(Record a short loom.com video showing the example running and post it in the PR comments)

This fulfills the bounty requirement for a full working example.

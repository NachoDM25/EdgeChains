import { AWSComprehendPIIRedactor } from "../../arakoodev/src/ai/src/lib/comprehend/aws-comprehend-redactor";

// Simple demo (in real usage import from the package)
async function main() {
  const redactor = new AWSComprehendPIIRedactor({
    region: "us-east-1",
    // credentials will be loaded from env vars
  });

  const sensitivePrompt = "My name is John Doe and my email is john.doe@company.com. Please analyze my resume.";

  console.log("Original prompt:", sensitivePrompt);

  const result = await redactor.redact(sensitivePrompt);

  console.log("\nRedacted prompt:", result.redactedText);
  console.log("\nDetected entities:", result.entities);

  // Example of chaining with an LLM (pseudo-code)
  // const openai = new OpenAI({ apiKey: "..." });
  // const response = await openai.chat({ prompt: result.redactedText });
  // console.log("LLM Response:", response);
}

main().catch(console.error);

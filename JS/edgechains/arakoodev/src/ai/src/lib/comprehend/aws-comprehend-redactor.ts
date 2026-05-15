import { ComprehendClient, DetectPiiEntitiesCommand, PiiEntity } from "@aws-sdk/client-comprehend";

interface AWSComprehendOptions {
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

interface RedactResult {
  redactedText: string;
  entities: PiiEntity[];
}

export class AWSComprehendPIIRedactor {
  private client: ComprehendClient;
  private region: string;

  constructor(options: AWSComprehendOptions = {}) {
    this.region = options.region || process.env.AWS_REGION || "us-east-1";
    
    const accessKeyId = options.accessKeyId || process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = options.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY;

    if (!accessKeyId || !secretAccessKey) {
      console.warn("AWS credentials not provided. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in environment.");
    }

    this.client = new ComprehendClient({
      region: this.region,
      credentials: accessKeyId && secretAccessKey ? {
        accessKeyId,
        secretAccessKey,
      } : undefined,
    });
  }

  /**
   * Redacts PII from the given text using AWS Comprehend.
   * Can be chained with other Endpoint classes by calling redact() before passing prompt to OpenAI/Gemini/etc.
   */
  async redact(text: string, languageCode: "en" | "es" | "fr" | "de" | "it" | "pt" | "ar" | "hi" | "ja" | "ko" | "zh" | "zh-TW" = "en"): Promise<RedactResult> {
    if (!text || text.trim().length === 0) {
      return { redactedText: text, entities: [] };
    }

    try {
      const command = new DetectPiiEntitiesCommand({
        Text: text,
        LanguageCode: languageCode as any,
      });

      const response = await this.client.send(command);
      const entities = response.Entities || [];

      let redactedText = text;

      // Sort entities by BeginOffset descending to avoid index shifting issues
      const sortedEntities = [...entities].sort((a, b) => (b.BeginOffset || 0) - (a.BeginOffset || 0));

      for (const entity of sortedEntities) {
        if (entity.BeginOffset !== undefined && entity.EndOffset !== undefined) {
          const before = redactedText.substring(0, entity.BeginOffset);
          const after = redactedText.substring(entity.EndOffset);
          const replacement = `[${entity.Type || "REDACTED"}]`;
          redactedText = before + replacement + after;
        }
      }

      return {
        redactedText,
        entities,
      };
    } catch (error) {
      console.error("AWS Comprehend PII detection failed:", error);
      // Fallback: return original text if API fails
      return { redactedText: text, entities: [] };
    }
  }

  /**
   * Helper method for easy chaining in prompts.
   * Example usage:
   *   const redactor = new AWSComprehendPIIRedactor();
   *   const { redactedText } = await redactor.redact(userPrompt);
   *   const response = await openai.chat({ prompt: redactedText });
   */
  async redactPrompt(prompt: string): Promise<string> {
    const result = await this.redact(prompt);
    return result.redactedText;
  }
}

import { AWSComprehendPIIRedactor } from "../lib/comprehend/aws-comprehend-redactor";

describe("AWSComprehendPIIRedactor", () => {
  let redactor: AWSComprehendPIIRedactor;

  beforeEach(() => {
    // Mock environment variables for testing
    process.env.AWS_ACCESS_KEY_ID = "test-key";
    process.env.AWS_SECRET_ACCESS_KEY = "test-secret";
    process.env.AWS_REGION = "us-east-1";
    
    redactor = new AWSComprehendPIIRedactor();
  });

  afterEach(() => {
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
  });

  test("should redact PII from text", async () => {
    // Mock the AWS client response
    const mockEntities = [
      {
        BeginOffset: 10,
        EndOffset: 20,
        Type: "NAME",
        Score: 0.99,
      },
      {
        BeginOffset: 30,
        EndOffset: 42,
        Type: "EMAIL",
        Score: 0.95,
      },
    ];

    // Override the client send method for testing
    (redactor as any).client.send = jest.fn().mockResolvedValue({
      Entities: mockEntities,
    });

    const inputText = "Hello John Doe, your email is john@example.com";
    const result = await redactor.redact(inputText);

    expect(result.redactedText).toContain("[NAME]");
    expect(result.redactedText).toContain("[EMAIL]");
    expect(result.entities.length).toBe(2);
  });

  test("should return original text when no PII detected", async () => {
    (redactor as any).client.send = jest.fn().mockResolvedValue({
      Entities: [],
    });

    const inputText = "This is a normal sentence without any personal data.";
    const result = await redactor.redact(inputText);

    expect(result.redactedText).toBe(inputText);
    expect(result.entities.length).toBe(0);
  });

  test("should handle empty input gracefully", async () => {
    const result = await redactor.redact("");
    expect(result.redactedText).toBe("");
    expect(result.entities.length).toBe(0);
  });

  test("redactPrompt helper should return redacted text", async () => {
    (redactor as any).client.send = jest.fn().mockResolvedValue({
      Entities: [{ BeginOffset: 0, EndOffset: 10, Type: "NAME" }],
    });

    const redacted = await redactor.redactPrompt("Sensitive name here");
    expect(redacted).toContain("[NAME]");
  });
});

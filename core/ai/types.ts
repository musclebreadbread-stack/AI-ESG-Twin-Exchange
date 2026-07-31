/**
 * Task 16: AI Provider Abstraction — core types.
 */

export interface AiTaskConfig {
  readonly taskType: string;
  readonly primary: AiProviderConfig;
  readonly alternate?: AiProviderConfig;
  readonly deadline: number; // ms
  readonly costCapMinorUnits?: bigint;
  readonly requiresReproducibility?: boolean;
}

export interface AiProviderConfig {
  readonly providerId: string;
  readonly model: string;
  readonly temperature?: number;
  readonly seed?: number;
  readonly maxTokens?: number;
  readonly capabilities: readonly AiCapability[];
}

export type AiCapability = 'structuredOutput' | 'toolCalling' | 'streaming' | 'vision';

export interface AiRequest {
  readonly systemInstruction: string;
  readonly messages: readonly AiMessage[];
  readonly tools?: readonly AiToolDef[];
  readonly outputSchema?: unknown; // Zod schema for structured output
  readonly temperature?: number;
  readonly seed?: number;
}

export interface AiMessage {
  readonly role: 'user' | 'assistant' | 'tool';
  readonly content: string;
  readonly toolCallId?: string;
}

export interface AiToolDef {
  readonly name: string;
  readonly description: string;
  readonly parameters: unknown; // JSON Schema
}

export interface AiResponse {
  readonly content: string;
  readonly toolCalls?: readonly AiToolCall[];
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly finishReason: 'stop' | 'tool_calls' | 'length' | 'content_filter';
  readonly canonicalInputHash: string;
  readonly providerId: string;
  readonly model: string;
}

export interface AiToolCall {
  readonly id: string;
  readonly name: string;
  readonly arguments: string;
}

export type AiError =
  | 'CAPABILITY_UNSUPPORTED'
  | 'MODEL_UNAVAILABLE'
  | 'CONTEXT_LIMIT_EXCEEDED'
  | 'RESIDENCY_POLICY_EXCLUDED'
  | 'SCHEMA_VALIDATION_FAILED'
  | 'COST_CEILING_REACHED'
  | 'ALL_PROVIDERS_UNAVAILABLE'
  | 'TIMEOUT'
  | 'RATE_LIMITED';

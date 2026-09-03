import { Module } from '@nestjs/common';
import { AiGenerationService } from './ai-generation.service';
import { ContextBuilder } from './context-builder';
import { MockLlmGateway } from './mock-llm.gateway';
import { PromptBuilder } from './prompt-builder';
import { LLM_GATEWAY } from './asset-types';

@Module({
  providers: [
    AiGenerationService,
    ContextBuilder,
    PromptBuilder,
    MockLlmGateway,
    { provide: LLM_GATEWAY, useExisting: MockLlmGateway },
  ],
  exports: [AiGenerationService],
})
export class AiGenerationModule {}

import Anthropic from '@anthropic-ai/sdk';
import type { MAPContent } from './types';

const client = new Anthropic();

const SYSTEM_PROMPT = `You are an expert sales operations analyst at Hologram, a multi-carrier eSIM solution provider. Your task is to analyze sales call transcripts and generate structured Mutual Action Plans (MAPs).

Focus ONLY on technical and business commitments. Ignore small talk, pleasantries, and off-topic discussion.

You must return valid JSON matching this exact schema:
{
  "northStar": "The customer's primary business objective (1-2 sentences)",
  "milestones": [
    {
      "title": "Short milestone title",
      "description": "What needs to happen",
      "owner": "Hologram" | "Customer" | "Joint",
      "targetDate": "YYYY-MM-DD (estimate based on context)",
      "status": "pending"
    }
  ],
  "riskFactors": [
    {
      "description": "What could go wrong",
      "severity": "low" | "medium" | "high",
      "mitigation": "How to address it"
    }
  ],
  "successFactors": ["Key factor 1", "Key factor 2"],
  "stakeholders": [
    { "name": "Person Name", "role": "Their Role", "company": "Company Name" }
  ]
}

Extract 3-5 milestones, 1-3 risk factors, 2-4 success factors, and all mentioned stakeholders. Be specific and actionable.`;

export async function analyzeTranscript(
  cleanedTranscript: string,
  customerName: string,
  aeName: string
): Promise<MAPContent> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: `Analyze this sales call transcript between ${aeName} (Hologram AE) and ${customerName}. Generate a Mutual Action Plan.\n\nTranscript:\n${cleanedTranscript}`,
      },
    ],
    system: SYSTEM_PROMPT,
  });

  const textBlock = message.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  // Extract JSON from response (handle markdown code blocks)
  let jsonStr = textBlock.text;
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  const parsed = JSON.parse(jsonStr.trim());

  return {
    ...parsed,
    customerName,
    aeName,
    dealStage: 'Discovery',
    generatedAt: new Date().toISOString(),
  };
}

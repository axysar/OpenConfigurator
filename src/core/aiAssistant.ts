/**
 * AI-Powered Configuration Assistant
 *
 * Provides natural-language configuration via an LLM API.
 * Users can describe their ideal product in plain English and get
 * auto-set dimensions, materials, textures, and load scenarios.
 *
 * The module is backend-agnostic: it sends a prompt + current spec
 * to an API endpoint and receives a partial spec update. The endpoint
 * can be backed by Claude, GPT, or any LLM service.
 *
 * API contract:
 *   POST /api/ai/configure
 *   Body: { prompt: string, currentSpec: object, templateId: string }
 *   Response: { specPatch: object, explanation: string }
 */

export interface AiConfigRequest {
  prompt: string;
  currentSpec: Record<string, unknown>;
  templateId: string;
}

export interface AiConfigResponse {
  specPatch: Record<string, unknown>;
  explanation: string;
  confidence: number;
}

export interface AiRecommendation {
  id: string;
  title: string;
  description: string;
  specPatch: Record<string, unknown>;
  reason: string;
}

const AI_API_BASE = typeof window !== 'undefined'
  ? (window as unknown as Record<string, unknown>).__OC_AI_API__ as string | undefined
  : undefined;

export const isAiAvailable = (): boolean => Boolean(AI_API_BASE);

export const aiConfigure = async (request: AiConfigRequest): Promise<AiConfigResponse> => {
  if (!AI_API_BASE) {
    return localAiConfigure(request);
  }

  const res = await fetch(`${AI_API_BASE}/configure`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) throw new Error(`AI API ${res.status}`);
  return res.json() as Promise<AiConfigResponse>;
};

export const aiRecommend = async (
  currentSpec: Record<string, unknown>,
  templateId: string,
): Promise<AiRecommendation[]> => {
  if (!AI_API_BASE) {
    return localAiRecommend(currentSpec, templateId);
  }

  const res = await fetch(`${AI_API_BASE}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentSpec, templateId }),
  });

  if (!res.ok) throw new Error(`AI API ${res.status}`);
  return res.json() as Promise<AiRecommendation[]>;
};

/**
 * Local fallback AI — keyword-based pattern matching when no LLM API
 * is configured. Handles common natural-language patterns.
 */
const localAiConfigure = async (request: AiConfigRequest): Promise<AiConfigResponse> => {
  const prompt = request.prompt.toLowerCase();
  const patch: Record<string, unknown> = {};
  const explanations: string[] = [];

  if (prompt.includes('large') || prompt.includes('big') || prompt.includes('spacious')) {
    patch['dimensions'] = { width: 6, depth: 7, height: 3 };
    patch['sizeId'] = 'pavilion';
    explanations.push('Set to large pavilion dimensions (6x7m).');
  } else if (prompt.includes('small') || prompt.includes('compact') || prompt.includes('cozy')) {
    patch['dimensions'] = { width: 3, depth: 3, height: 2.5 };
    patch['sizeId'] = 'compact';
    explanations.push('Set to compact dimensions (3x3m).');
  }

  if (prompt.includes('wood') || prompt.includes('rustic') || prompt.includes('warm') || prompt.includes('natural')) {
    patch['materialId'] = 'walnut_wood';
    patch['texturePreset'] = 'oak';
    explanations.push('Selected walnut wood with oak texture for a warm, natural feel.');
  } else if (prompt.includes('modern') || prompt.includes('sleek') || prompt.includes('minimal')) {
    patch['materialId'] = 'graphite_matte';
    patch['texturePreset'] = 'none';
    explanations.push('Selected graphite matte with solid finish for a modern look.');
  } else if (prompt.includes('industrial') || prompt.includes('steel') || prompt.includes('dark')) {
    patch['materialId'] = 'carbon_steel';
    patch['texturePreset'] = 'slate';
    explanations.push('Selected carbon steel with slate texture for an industrial style.');
  } else if (prompt.includes('elegant') || prompt.includes('luxury') || prompt.includes('premium')) {
    patch['materialId'] = 'champagne_alloy';
    patch['texturePreset'] = 'brushed';
    explanations.push('Selected champagne alloy with brushed finish for an elegant look.');
  } else if (prompt.includes('white') || prompt.includes('bright') || prompt.includes('light')) {
    patch['materialId'] = 'ivory_satin';
    patch['texturePreset'] = 'none';
    explanations.push('Selected ivory satin for a bright, airy appearance.');
  }

  if (prompt.includes('snow') || prompt.includes('mountain') || prompt.includes('alpine') || prompt.includes('cold')) {
    patch['loadScenarioId'] = 'heavy_snow';
    explanations.push('Set heavy snow loading scenario for cold climates.');
  } else if (prompt.includes('coast') || prompt.includes('wind') || prompt.includes('beach') || prompt.includes('ocean')) {
    patch['loadScenarioId'] = 'coastal';
    explanations.push('Set coastal wind loading scenario.');
  }

  if (prompt.includes('budget') || prompt.includes('cheap') || prompt.includes('affordable')) {
    patch['materialId'] = patch['materialId'] ?? 'graphite_matte';
    patch['texturePreset'] = 'none';
    patch['dimensions'] = patch['dimensions'] ?? { width: 3, depth: 3, height: 2.5 };
    explanations.push('Optimized for budget: compact size, standard material.');
  }

  if (prompt.includes('entertain') || prompt.includes('party') || prompt.includes('dining') || prompt.includes('family')) {
    patch['dimensions'] = { width: 5, depth: 6, height: 2.85 };
    patch['sizeId'] = 'grand';
    explanations.push('Sized for entertaining: grand dimensions (5x6m) with generous clearance.');
  }

  const explanation = explanations.length > 0
    ? explanations.join(' ')
    : 'I understood your request but couldn\'t map it to specific settings. Try describing size, material, or style preferences.';

  return {
    specPatch: patch,
    explanation,
    confidence: explanations.length > 0 ? 0.7 + explanations.length * 0.05 : 0.2,
  };
};

const localAiRecommend = async (
  currentSpec: Record<string, unknown>,
  _templateId: string,
): Promise<AiRecommendation[]> => {
  const recommendations: AiRecommendation[] = [];
  const dims = currentSpec['dimensions'] as { width: number; depth: number } | undefined;
  const materialId = currentSpec['materialId'] as string | undefined;

  if (dims && dims.width * dims.depth > 25 && materialId === 'walnut_wood') {
    recommendations.push({
      id: 'upgrade-material',
      title: 'Consider aluminum for large spans',
      description: 'Large wood structures need significantly thicker beams. Aluminum alloy would reduce weight by 75%.',
      specPatch: { materialId: 'graphite_matte' },
      reason: 'Structural efficiency for large footprint',
    });
  }

  if (materialId === 'carbon_steel') {
    recommendations.push({
      id: 'coastal-warning',
      title: 'Add coastal protection for steel',
      description: 'Carbon steel near saltwater requires galvanization. Consider champagne alloy for corrosion resistance.',
      specPatch: { materialId: 'champagne_alloy' },
      reason: 'Corrosion prevention',
    });
  }

  recommendations.push({
    id: 'optimize-shade',
    title: 'Optimize shade coverage',
    description: 'Tighter slat spacing provides better sun protection without significantly increasing cost.',
    specPatch: { parameters: { slatSpacing: 0.16 } },
    reason: 'UV protection improvement',
  });

  return recommendations;
};

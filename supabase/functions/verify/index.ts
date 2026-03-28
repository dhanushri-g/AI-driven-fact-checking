import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface VerifyRequest {
  input: string;
  isUrl?: boolean;
}

interface Claim {
  claim: string;
  verdict: "True" | "False" | "Partially True" | "Unverifiable";
  confidence: number;
  sources: string[];
  explanation: string;
}

interface FinalVerdict {
  verdict: "TRUE" | "FALSE" | "MIXED" | "UNVERIFIABLE";
  trustScore: number;
  explanation: string;
  aiLikelihood: number;
  claims: Claim[];
}

async function extractTextFromUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.substring(0, 5000);
  } catch (error) {
    throw new Error(`Failed to fetch URL: ${error.message}`);
  }
}

async function extractClaims(text: string, groqApiKey: string): Promise<string[]> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${groqApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a fact-checking assistant. Extract factual claims from the given text. Return only a JSON array of claims as strings, nothing else. Example: [\"claim 1\", \"claim 2\"]"
        },
        {
          role: "user",
          content: `Extract factual claims from this text:\n\n${text}`
        }
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content.trim();

  try {
    const claims = JSON.parse(content);
    return Array.isArray(claims) ? claims.slice(0, 5) : [];
  } catch {
    const matches = content.match(/\[.*\]/s);
    if (matches) {
      return JSON.parse(matches[0]).slice(0, 5);
    }
    return [];
  }
}

async function searchClaim(claim: string, tavilyApiKey: string): Promise<any[]> {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: tavilyApiKey,
      query: claim,
      max_results: 3,
    }),
  });

  if (!response.ok) {
    throw new Error(`Tavily API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results || [];
}

async function verifyClaim(
  claim: string,
  searchResults: any[],
  groqApiKey: string
): Promise<{ verdict: string; confidence: number; sources: string[]; explanation: string }> {
  const context = searchResults
    .map((r) => `Source: ${r.url}\nContent: ${r.content}`)
    .join("\n\n");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${groqApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a fact-checking assistant. Based on the provided sources, verify the claim and return ONLY a JSON object with this exact format: {\"verdict\": \"True|False|Partially True|Unverifiable\", \"confidence\": 0.0-1.0, \"explanation\": \"brief explanation\"}. Nothing else."
        },
        {
          role: "user",
          content: `Claim: ${claim}\n\nSources:\n${context}\n\nVerify this claim based on the sources. Provide a brief explanation.`
        }
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content.trim();

  try {
    const result = JSON.parse(content);
    return {
      verdict: result.verdict,
      confidence: result.confidence,
      explanation: result.explanation || "",
      sources: searchResults.map((r) => r.url),
    };
  } catch {
    const matches = content.match(/\{.*\}/s);
    if (matches) {
      const result = JSON.parse(matches[0]);
      return {
        verdict: result.verdict,
        confidence: result.confidence,
        explanation: result.explanation || "",
        sources: searchResults.map((r) => r.url),
      };
    }
    return {
      verdict: "Unverifiable",
      confidence: 0,
      explanation: "Could not verify this claim",
      sources: [],
    };
  }
}

async function detectAIContent(text: string, groqApiKey: string): Promise<number> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${groqApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Analyze the given text and determine the likelihood it was generated by AI. Return ONLY a JSON object: {\"aiLikelihood\": 0-100}. Consider factors like writing style, repetition patterns, lack of personal anecdotes, perfect grammar, etc."
        },
        {
          role: "user",
          content: `Analyze this text for AI-generated content:\n\n${text.substring(0, 1000)}`
        }
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    return 30;
  }

  const data = await response.json();
  const content = data.choices[0].message.content.trim();

  try {
    const result = JSON.parse(content);
    return Math.max(0, Math.min(100, result.aiLikelihood));
  } catch {
    const matches = content.match(/\d+/);
    return matches ? Math.max(0, Math.min(100, parseInt(matches[0]))) : 30;
  }
}

function calculateFinalVerdict(claims: Claim[], aiLikelihood: number): FinalVerdict {
  if (claims.length === 0) {
    return {
      verdict: "UNVERIFIABLE",
      trustScore: 0,
      explanation: "No verifiable claims found in the content.",
      aiLikelihood,
      claims: [],
    };
  }

  const trueCount = claims.filter((c) => c.verdict === "True").length;
  const falseCount = claims.filter((c) => c.verdict === "False").length;
  const partialCount = claims.filter((c) => c.verdict === "Partially True").length;
  const unverifiableCount = claims.filter(
    (c) => c.verdict === "Unverifiable"
  ).length;

  const avgConfidence =
    claims.reduce((sum, c) => sum + c.confidence, 0) / claims.length;

  let verdict: "TRUE" | "FALSE" | "MIXED" | "UNVERIFIABLE";
  let trustScore: number;
  let explanation: string;

  if (unverifiableCount === claims.length) {
    verdict = "UNVERIFIABLE";
    trustScore = 30;
    explanation =
      "Insufficient evidence found to verify the claims in this content.";
  } else if (falseCount > trueCount && falseCount > partialCount) {
    verdict = "FALSE";
    trustScore = Math.max(0, 100 - Math.round(avgConfidence * 100));
    explanation = `Most claims (${falseCount}/${claims.length}) are false or contradicted by evidence.`;
  } else if (trueCount > falseCount && trueCount > partialCount) {
    verdict = "TRUE";
    trustScore = Math.round(avgConfidence * 100);
    explanation = `Most claims (${trueCount}/${claims.length}) are verified as true with strong evidence.`;
  } else if (partialCount > 0 && (falseCount > 0 || trueCount > 0)) {
    verdict = "MIXED";
    trustScore = Math.round((avgConfidence * 100) / 2 + 30);
    explanation = `The content contains both verified and false claims (True: ${trueCount}, False: ${falseCount}, Partial: ${partialCount}).`;
  } else {
    verdict = "MIXED";
    trustScore = Math.round(avgConfidence * 100);
    explanation = "The content contains a mix of true and unverified claims.";
  }

  return {
    verdict,
    trustScore: Math.max(0, Math.min(100, trustScore)),
    explanation,
    aiLikelihood,
    claims,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const groqApiKey = Deno.env.get("GROQ_API_KEY");
    const tavilyApiKey = Deno.env.get("TAVILY_API_KEY");

    if (!groqApiKey || !tavilyApiKey) {
      return new Response(
        JSON.stringify({ error: "API keys not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { input, isUrl }: VerifyRequest = await req.json();

    if (!input) {
      return new Response(
        JSON.stringify({ error: "Input is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let text = input;
    if (isUrl) {
      text = await extractTextFromUrl(input);
    }

    const claimTexts = await extractClaims(text, groqApiKey);
    const aiLikelihood = await detectAIContent(text, groqApiKey);

    if (claimTexts.length === 0) {
      return new Response(
        JSON.stringify({
          verdict: "UNVERIFIABLE",
          trustScore: 0,
          explanation: "No verifiable claims found in the content.",
          aiLikelihood,
          claims: [],
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const claims: Claim[] = [];

    for (const claimText of claimTexts) {
      const searchResults = await searchClaim(claimText, tavilyApiKey);
      const verification = await verifyClaim(claimText, searchResults, groqApiKey);

      claims.push({
        claim: claimText,
        verdict: verification.verdict as any,
        confidence: verification.confidence,
        explanation: verification.explanation,
        sources: verification.sources,
      });
    }

    const finalVerdict = calculateFinalVerdict(claims, aiLikelihood);

    return new Response(JSON.stringify(finalVerdict), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

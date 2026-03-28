import { useState } from 'react';
import { Shield } from 'lucide-react';
import VerifyForm from './components/VerifyForm';
import ResultCard from './components/ResultCard';
import FinalVerdictCard from './components/FinalVerdictCard';
import ProcessingSteps from './components/ProcessingSteps';
import ImageUpload from './components/ImageUpload';
import ImageAnalysisResult from './components/ImageAnalysisResult';

interface Claim {
  claim: string;
  verdict: 'True' | 'False' | 'Partially True' | 'Unverifiable';
  confidence: number;
  sources: string[];
  explanation: string;
}

interface VerificationResult {
  verdict: 'TRUE' | 'FALSE' | 'MIXED' | 'UNVERIFIABLE';
  trustScore: number;
  explanation: string;
  aiLikelihood: number;
  claims: Claim[];
}

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState(0);
  const [, setImagePreview] = useState<string | null>(null);
  const [imageAnalysisResult, setImageAnalysisResult] = useState<{
    fakeProbability: number;
    preview: string;
  } | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const handleVerify = async (input: string, isUrl: boolean) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setProcessingStep(0);

    const stepInterval = setInterval(() => {
      setProcessingStep((prev) => (prev < 3 ? prev + 1 : 3));
    }, 2000);

    try {
      const url = `https://ivbwlpqzjsdtskytnpjx.supabase.co/functions/v1/verify`; 

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input, isUrl }),
      });

      clearInterval(stepInterval);
      setProcessingStep(4);

      if (!response.ok) {
        throw new Error('Failed to verify facts');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (err) {
      clearInterval(stepInterval);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleImageAnalyze = async (imageBase64: string) => {
    setImageLoading(true);
    setImagePreview(imageBase64);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ input: imageBase64, isImage: true }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();

      setImageAnalysisResult({
        fakeProbability: data.fakeProbability || 45,
        preview: imageBase64,
      });
    } catch (err) {
      console.error('Image analysis error:', err);
      setImageAnalysisResult({
        fakeProbability: 45,
        preview: imageBase64,
      });
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full">
              <Shield className="w-12 h-12 text-blue-400" />
            </div>
          </div>
          <h1 className="text-6xl font-black bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-4">
            AI Fact Checker
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Verify claims, detect AI-generated content, and analyze media with advanced AI analysis
          </p>
        </div>

        <VerifyForm onVerify={handleVerify} loading={loading} />

        {loading && (
          <div className="max-w-2xl mx-auto mt-12">
            <ProcessingSteps currentStep={processingStep} />
          </div>
        )}

        {error && (
          <div className="max-w-4xl mx-auto mt-8 bg-red-500/10 backdrop-blur-xl border-2 border-red-500/50 rounded-2xl p-6">
            <p className="text-red-300 font-medium">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-16 space-y-8">
            <FinalVerdictCard
              verdict={result.verdict}
              trustScore={result.trustScore}
              explanation={result.explanation}
              aiLikelihood={result.aiLikelihood}
            />

            {result.claims.length > 0 && (
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-6 text-gray-100">
                  Individual Claims Analysis
                </h2>
                <div className="grid gap-6">
                  {result.claims.map((claim, index) => (
                    <ResultCard key={index} claim={claim} index={index} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-16 pt-12 border-t border-gray-800">
          <ImageUpload onAnalyze={handleImageAnalyze} loading={imageLoading} />

          {imageAnalysisResult && (
            <ImageAnalysisResult
              fakeProbability={imageAnalysisResult.fakeProbability}
              preview={imageAnalysisResult.preview}
            />
          )}
        </div>

        {!loading && !result && !error && (
          <div className="max-w-4xl mx-auto mt-16 text-center text-gray-500">
            <p className="text-lg">Enter text or a URL above to start fact-checking</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

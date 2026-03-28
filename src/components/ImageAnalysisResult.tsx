import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

interface ImageAnalysisResultProps {
  fakeProbability: number;
  preview: string;
}

export default function ImageAnalysisResult({
  fakeProbability,
  preview,
}: ImageAnalysisResultProps) {
  const getAnalysisLabel = (probability: number) => {
    if (probability < 30) return 'Real';
    if (probability < 70) return 'Suspicious';
    return 'Likely AI-Generated';
  };

  const getAnalysisColor = (probability: number) => {
    if (probability < 30)
      return {
        icon: CheckCircle,
        text: 'text-emerald-300',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/50',
        bar: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
      };
    if (probability < 70)
      return {
        icon: AlertCircle,
        text: 'text-amber-300',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/50',
        bar: 'bg-gradient-to-r from-amber-500 to-amber-400',
      };
    return {
      icon: AlertTriangle,
      text: 'text-red-300',
      bg: 'bg-red-500/10',
      border: 'border-red-500/50',
      bar: 'bg-gradient-to-r from-red-500 to-red-400',
    };
  };

  const style = getAnalysisColor(fakeProbability);
  const Icon = style.icon;
  const label = getAnalysisLabel(fakeProbability);

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div
        className={`${style.bg} backdrop-blur-xl border-2 ${style.border} rounded-2xl p-6`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <img
              src={preview}
              alt="Analyzed"
              className="w-full h-auto object-contain rounded-xl"
            />
          </div>

          <div className="flex flex-col justify-center space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-2">
                AI Generation Score
              </h4>
              <div className="flex items-center space-x-4">
                <Icon className={`w-8 h-8 ${style.text}`} />
                <div>
                  <p className={`text-3xl font-bold ${style.text}`}>
                    {fakeProbability}%
                  </p>
                  <p className="text-sm text-gray-400">{label}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">
                Confidence Bar
              </p>
              <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
                  style={{ width: `${fakeProbability}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-700/50">
              <p className="text-xs text-gray-400 leading-relaxed">
                {fakeProbability < 30
                  ? "This image appears to be authentic with no significant indicators of AI generation or manipulation."
                  : fakeProbability < 70
                    ? "This image shows some suspicious patterns that could indicate AI generation or digital manipulation. Review carefully."
                    : "This image shows strong indicators of AI generation. High likelihood of synthetic or heavily manipulated content."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

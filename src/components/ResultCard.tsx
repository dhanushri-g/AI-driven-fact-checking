import { CheckCircle, XCircle, AlertCircle, HelpCircle, ExternalLink } from 'lucide-react';

interface Claim {
  claim: string;
  verdict: 'True' | 'False' | 'Partially True' | 'Unverifiable';
  confidence: number;
  sources: string[];
  explanation: string;
}

interface ResultCardProps {
  claim: Claim;
  index: number;
}

export default function ResultCard({ claim, index }: ResultCardProps) {
  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case 'True':
        return {
          gradient: 'from-emerald-500/20 to-emerald-600/20',
          border: 'border-emerald-500/50',
          text: 'text-emerald-300',
          icon: <CheckCircle className="w-6 h-6" />,
          label: 'True',
        };
      case 'False':
        return {
          gradient: 'from-red-500/20 to-red-600/20',
          border: 'border-red-500/50',
          text: 'text-red-300',
          icon: <XCircle className="w-6 h-6" />,
          label: 'False',
        };
      case 'Partially True':
        return {
          gradient: 'from-amber-500/20 to-amber-600/20',
          border: 'border-amber-500/50',
          text: 'text-amber-300',
          icon: <AlertCircle className="w-6 h-6" />,
          label: 'Partially True',
        };
      default:
        return {
          gradient: 'from-gray-500/20 to-gray-600/20',
          border: 'border-gray-500/50',
          text: 'text-gray-300',
          icon: <HelpCircle className="w-6 h-6" />,
          label: 'Unverifiable',
        };
    }
  };

  const style = getVerdictStyle(claim.verdict);

  return (
    <div
      className={`bg-gradient-to-br ${style.gradient} backdrop-blur-xl border-2 ${style.border} rounded-2xl p-6 hover:border-opacity-100 border-opacity-75 transition-all duration-300 animate-fade-in`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Claim #{index + 1}
          </h3>
          <p className="text-gray-100 leading-relaxed font-medium">{claim.claim}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={style.text}>{style.icon}</div>
            <div>
              <p className={`font-bold text-lg ${style.text}`}>{style.label}</p>
              <p className="text-xs text-gray-400">
                Confidence: {Math.round(claim.confidence * 100)}%
              </p>
            </div>
          </div>
          <div className="w-16 h-16">
            <svg className="transform -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className="stroke-current text-gray-700"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className={`stroke-current ${style.text}`}
                strokeWidth="3"
                strokeDasharray={`${claim.confidence * 100}, 100`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {claim.explanation && (
          <p className="text-sm text-gray-300 leading-relaxed pt-2 border-t border-gray-700/50">
            {claim.explanation}
          </p>
        )}

        {claim.sources.length > 0 && (
          <div className="pt-2 border-t border-gray-700/50">
            <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase">
              Sources
            </h4>
            <div className="space-y-2">
              {claim.sources.map((source, idx) => (
                <a
                  key={idx}
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                >
                  <ExternalLink className="w-3 h-3 mr-2 flex-shrink-0" />
                  <span className="truncate">{source}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

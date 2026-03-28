import { CheckCircle, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';

interface FinalVerdictCardProps {
  verdict: 'TRUE' | 'FALSE' | 'MIXED' | 'UNVERIFIABLE';
  trustScore: number;
  explanation: string;
  aiLikelihood: number;
}

export default function FinalVerdictCard({
  verdict,
  trustScore,
  explanation,
  aiLikelihood,
}: FinalVerdictCardProps) {
  const getVerdictStyle = (v: string) => {
    switch (v) {
      case 'TRUE':
        return {
          gradient: 'from-emerald-500/20 to-emerald-600/20',
          border: 'border-emerald-500/50',
          textColor: 'text-emerald-300',
          bgColor: 'bg-emerald-500/10',
          icon: <CheckCircle className="w-8 h-8" />,
          label: 'TRUE',
        };
      case 'FALSE':
        return {
          gradient: 'from-red-500/20 to-red-600/20',
          border: 'border-red-500/50',
          textColor: 'text-red-300',
          bgColor: 'bg-red-500/10',
          icon: <XCircle className="w-8 h-8" />,
          label: 'FALSE',
        };
      case 'MIXED':
        return {
          gradient: 'from-amber-500/20 to-amber-600/20',
          border: 'border-amber-500/50',
          textColor: 'text-amber-300',
          bgColor: 'bg-amber-500/10',
          icon: <AlertTriangle className="w-8 h-8" />,
          label: 'MIXED',
        };
      default:
        return {
          gradient: 'from-gray-500/20 to-gray-600/20',
          border: 'border-gray-500/50',
          textColor: 'text-gray-300',
          bgColor: 'bg-gray-500/10',
          icon: <HelpCircle className="w-8 h-8" />,
          label: 'UNVERIFIABLE',
        };
    }
  };

  const style = getVerdictStyle(verdict);

  const getAILabel = (score: number) => {
    if (score < 30) return 'Likely Human';
    if (score < 70) return 'Possibly AI';
    return 'Likely AI';
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div
        className={`bg-gradient-to-br ${style.gradient} backdrop-blur-xl border-2 ${style.border} rounded-3xl p-8 shadow-2xl`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col justify-center">
            <h2 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-widest">
              Final Verdict
            </h2>
            <div className="flex items-center space-x-4 mb-6">
              <div className={`${style.textColor}`}>{style.icon}</div>
              <h1 className={`text-5xl font-black ${style.textColor}`}>
                {style.label}
              </h1>
            </div>
            <p className="text-gray-300 leading-relaxed text-lg">{explanation}</p>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-400">
                  Trust Score
                </span>
                <span className={`text-2xl font-bold ${style.textColor}`}>
                  {trustScore}%
                </span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    trustScore >= 70
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                      : trustScore >= 40
                        ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                        : 'bg-gradient-to-r from-red-500 to-red-400'
                  }`}
                  style={{ width: `${trustScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-400">
                  AI Likelihood
                </span>
                <span className="text-2xl font-bold text-blue-300">
                  {aiLikelihood}%
                </span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${aiLikelihood}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">{getAILabel(aiLikelihood)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

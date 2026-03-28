import { useState } from 'react';
import { Search } from 'lucide-react';

interface VerifyFormProps {
  onVerify: (input: string, isUrl: boolean) => void;
  loading: boolean;
}

export default function VerifyForm({ onVerify, loading }: VerifyFormProps) {
  const [input, setInput] = useState('');
  const [isUrl, setIsUrl] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onVerify(input.trim(), isUrl);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 space-y-6 shadow-2xl hover:border-gray-600/50 transition-colors">
        <div className="space-y-3">
          <label htmlFor="input" className="block text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Enter text or URL to verify
          </label>
          <textarea
            id="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste text, paste article content, or enter a URL..."
            className="w-full px-4 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none h-40 text-gray-100 placeholder-gray-500"
            disabled={loading}
          />
        </div>

        <div className="flex items-center space-x-3 pt-2">
          <input
            type="checkbox"
            id="isUrl"
            checked={isUrl}
            onChange={(e) => setIsUrl(e.target.checked)}
            className="w-5 h-5 accent-blue-500 rounded cursor-pointer"
            disabled={loading}
          />
          <label htmlFor="isUrl" className="text-sm text-gray-300 cursor-pointer font-medium">
            This is a URL (will fetch and analyze the page)
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Analyzing Content...</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>Verify Facts</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

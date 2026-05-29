import React, { useState } from 'react';
import { Link2, FileText, UploadCloud, X, HelpCircle, ArrowRight } from 'lucide-react';

const GenerateForm = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    const extension = selectedFile.name.split('.').pop().toLowerCase();
    if (extension !== 'pdf' && extension !== 'docx') {
      setError('Only PDF and DOCX files are supported currently.');
      return;
    }
    setFile({
      name: selectedFile.name,
      size: (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB',
      type: extension
    });
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!url.trim() && !file) {
      setError('Please provide either an article URL or upload a document.');
      return;
    }

    if (url.trim()) {
      try {
        // Quick basic URL check
        new URL(url);
      } catch (err) {
        setError('Please enter a valid URL (including https://).');
        return;
      }
    }

    // Submit url. If file is present, let parent know it's a file draft (UI only)
    onSubmit({
      url: url.trim(),
      file: file
    });
  };

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 animate-fade-in shadow-xl">
      <h2 className="text-xl font-semibold text-white mb-1.5 flex items-center gap-2">
        Create New Draft
      </h2>
      <p className="text-sm text-slate-400 mb-6">
        Input an article URL or upload a file to formulate tailored social posts using Groq AI.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* URL Input field */}
        <div className="space-y-2">
          <label htmlFor="url-input" className="text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <Link2 className="h-3.5 w-3.5 text-brand-400" />
            Article URL
          </label>
          <div className="relative">
            <input
              type="text"
              id="url-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://techcrunch.com/article/ai-breakthrough"
              disabled={isLoading}
              className="w-full bg-darkbg border border-darkborder focus:border-brand-500 rounded-xl py-3 pl-4 pr-10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors disabled:opacity-50"
            />
            {url && (
              <button
                type="button"
                onClick={() => setUrl('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-darkborder/60"></div>
          </div>
          <span className="relative px-3 bg-darkcard text-xs text-slate-500 uppercase tracking-widest font-semibold">Or</span>
        </div>

        {/* File Drag and Drop */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-indigo-400" />
              Upload Briefing (PDF/DOCX)
            </span>
            <span className="text-[10px] text-brand-400 lowercase font-medium bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded-full">
              UI Only
            </span>
          </label>

          {!file ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                dragActive 
                  ? 'border-brand-500 bg-brand-500/5' 
                  : 'border-darkborder hover:border-slate-800 hover:bg-slate-900/10'
              }`}
            >
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                accept=".pdf,.docx"
                className="hidden"
                disabled={isLoading}
              />
              <label htmlFor="file-upload" className="cursor-pointer block">
                <UploadCloud className="h-8 w-8 mx-auto text-slate-500 mb-2 group-hover:scale-105 transition-transform" />
                <span className="text-xs font-medium text-slate-300 block mb-1">
                  Drag and drop file here, or <span className="text-brand-400 hover:text-brand-300">browse</span>
                </span>
                <span className="text-[10px] text-slate-500">
                  Supports PDF or DOCX up to 10MB
                </span>
              </label>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-darkborder rounded-xl p-4 flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="bg-brand-500/10 border border-brand-500/20 text-brand-400 p-2.5 rounded-lg">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-medium text-slate-200 truncate max-w-[200px] sm:max-w-[320px]">
                    {file.name}
                  </h4>
                  <p className="text-[10px] text-slate-500">{file.size} • {file.type.toUpperCase()}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-slate-500 hover:text-slate-300 hover:bg-slate-800/80 p-1.5 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Error notification */}
        {error && (
          <div className="text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 rounded-xl animate-pulse-subtle">
            {error}
          </div>
        )}

        {/* Submit Action */}
        <button
          type="submit"
          disabled={isLoading || (!url.trim() && !file)}
          className="btn-primary w-full py-3 text-sm justify-center glow-border"
        >
          {isLoading ? (
            <span>Generating Posts...</span>
          ) : (
            <>
              <span>Generate Content</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Helpful Hint footer */}
      <div className="flex items-start gap-2 bg-slate-950/30 rounded-xl p-3.5 mt-6 border border-darkborder/50 text-[11px] text-slate-500">
        <HelpCircle className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          Tip: Submitting a URL contacts the active n8n API which pipes content to Groq AI. Uploading document files simulates local output previews.
        </span>
      </div>
    </div>
  );
};

export default GenerateForm;

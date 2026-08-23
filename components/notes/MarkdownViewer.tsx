'use client';

import React from 'react';

interface MarkdownViewerProps {
  content: string;
}

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  if (!content || !content.trim()) {
    return (
      <div className="text-gray-400 italic text-sm py-8 text-center">
        This note is empty. Click "Edit Note" to add content.
      </div>
    );
  }

  // Parse markdown lines into styled elements
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  lines.forEach((line, idx) => {
    // Code blocks ```
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${idx}`}
            className="my-3 p-4 rounded-2xl bg-gray-900 text-gray-100 font-mono text-xs overflow-x-auto border border-gray-800 shadow-inner leading-relaxed"
          >
            <code>{codeBuffer.join('\n')}</code>
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // Headings
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={idx} className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-6 mb-3 tracking-tight border-b border-gray-100 dark:border-gray-800 pb-2">
          {line.replace('# ', '')}
        </h1>
      );
      return;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={idx} className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mt-5 mb-2 tracking-tight">
          {line.replace('## ', '')}
        </h2>
      );
      return;
    }
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={idx} className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-4 mb-2">
          {line.replace('### ', '')}
        </h3>
      );
      return;
    }
    if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={idx} className="text-base font-semibold text-gray-800 dark:text-gray-200 mt-3 mb-1">
          {line.replace('#### ', '')}
        </h4>
      );
      return;
    }

    // Blockquotes
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={idx}
          className="my-2 pl-4 py-2 border-l-4 border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 text-xs sm:text-sm italic rounded-r-xl"
        >
          {renderFormattedInlineText(line.replace('> ', ''))}
        </blockquote>
      );
      return;
    }

    // Task list items [ ] or [x]
    if (line.trim().startsWith('- [ ]') || line.trim().startsWith('- [x]')) {
      const isChecked = line.trim().startsWith('- [x]');
      const text = line.trim().replace(/- \[[ x]\] /, '');
      elements.push(
        <div key={idx} className="flex items-start gap-2.5 my-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={isChecked}
            readOnly
            className="mt-1 w-4 h-4 rounded-md accent-amber-500 border-gray-300 pointer-events-none"
          />
          <span className={isChecked ? 'line-through text-gray-400' : ''}>
            {renderFormattedInlineText(text)}
          </span>
        </div>
      );
      return;
    }

    // Bullet list
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const text = line.trim().replace(/^[-*]\s+/, '');
      elements.push(
        <li key={idx} className="ml-5 list-disc text-xs sm:text-sm text-gray-700 dark:text-gray-300 my-1 leading-relaxed">
          {renderFormattedInlineText(text)}
        </li>
      );
      return;
    }

    // Empty lines
    if (!line.trim()) {
      elements.push(<div key={idx} className="h-3" />);
      return;
    }

    // Normal paragraph
    elements.push(
      <p key={idx} className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 my-1.5 leading-relaxed">
        {renderFormattedInlineText(line)}
      </p>
    );
  });

  return <div className="space-y-1 font-sans">{elements}</div>;
}

// Helper to format inline bold, italic, inline code
function renderFormattedInlineText(text: string): React.ReactNode {
  // Replace bold **text** or __text__
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-extrabold text-gray-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-amber-600 dark:text-amber-400 font-mono text-xs border border-gray-200 dark:border-gray-700"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

import React from 'react';
import Modal from './Modal';
import { marked } from 'marked';

interface ChangelogEntry {
  version: string;
  date: string;
  description: string;
}

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
  changelog: ChangelogEntry[];
}


const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose, changelog }) => {
  
  const createMarkup = (markdownText: string) => {
    const rawMarkup = marked.parse(markdownText, { breaks: true, gfm: true });
    return { __html: rawMarkup as string };
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="What's New" maxWidth="max-w-2xl">
      <div className="max-h-[70vh] overflow-y-auto pr-4 space-y-6">
        {changelog.map((entry) => (
          <div key={entry.version} className="border-b border-slate-200 pb-4 last:border-b-0">
            <div className="flex justify-between items-baseline">
              <h3 className="text-xl font-bold text-primary">Version {entry.version}</h3>
              <p className="text-sm text-slate-500">{entry.date}</p>
            </div>
            <div
              className="mt-2 text-sm text-slate-700 prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-slate-800 prose-ul:list-disc prose-ul:pl-5 prose-strong:font-semibold"
              dangerouslySetInnerHTML={createMarkup(entry.description)}
            />
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default ChangelogModal;
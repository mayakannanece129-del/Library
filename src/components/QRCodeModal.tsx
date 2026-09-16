import React, { useRef } from 'react';
import { X, Printer, Download, BookOpen, MapPin, Hash, User } from 'lucide-react';
import { Book } from '../types';

interface QRCodeModalProps {
  book: Book | null;
  qrDataUrl: string | null;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ book, qrDataUrl, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!book || !qrDataUrl) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR-${book.isbn || book.id}.png`;
    a.click();
  };

  return (
    <div
      id="qrcode-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Book Accession QR Code
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Printable label for catalog indexing and circulation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Label Card */}
        <div className="p-6">
          <div
            ref={printRef}
            id="printable-book-label"
            className="p-5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-center flex flex-col items-center"
          >
            <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 dark:text-indigo-400 mb-1">
              ATHENA CENTRAL LIBRARY • ACCESSION
            </p>

            {/* QR Image */}
            <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200 my-3">
              <img
                src={qrDataUrl}
                alt={`QR code for ${book.title}`}
                className="w-44 h-44 object-contain"
              />
            </div>

            <h4 className="text-sm font-bold text-slate-900 dark:text-white max-w-xs leading-snug">
              {book.title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              By {book.author}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 w-full text-[11px] text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1 font-mono font-semibold">
                <Hash className="w-3 h-3" /> {book.isbn}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 font-medium">
                <MapPin className="w-3 h-3 text-indigo-500" /> {book.shelf_location || 'General Stacks'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download PNG
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Spine Label
          </button>
        </div>
      </div>
    </div>
  );
};

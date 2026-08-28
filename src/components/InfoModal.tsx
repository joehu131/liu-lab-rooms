'use client';

import React, { useEffect } from 'react';
import { X, MapPin, Clock, Shield, Monitor, ExternalLink } from 'lucide-react';
import { Language } from '@/lib/i18n';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, lang = 'sv' }) => {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isEn = lang === 'en';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-modal-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
    >
      <div
        className="panel-glass max-w-lg w-full p-6 text-[var(--ink)] border-[var(--rule)] relative max-h-[85vh] overflow-y-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--rule)]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-linux animate-pulse" />
            <h2 id="info-modal-title" className="font-mono text-sm font-semibold tracking-wider uppercase text-[var(--ink)]">
              {isEn ? 'LiU Lab Rooms • Campus Valla' : 'LiU Labbsalar • Campus Valla'}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label={isEn ? 'Close modal' : 'Stäng ruta'}
            className="p-1 rounded-md text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--panel-hover)] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 text-xs leading-relaxed text-[var(--ink-2)]">
          <div>
            <h3 className="text-sm font-medium text-[var(--ink)] mb-1 flex items-center gap-1.5">
              <Monitor size={15} className="text-accent-linux" />
              {isEn ? 'About the Service' : 'Om Tjänsten'}
            </h3>
            <p>
              {isEn ? (
                <>
                  A fast and real-time updated overview of all <strong>42 computer labs</strong> on Campus Valla at Linköping University (22 Linux labs and 20 Windows labs).
                </>
              ) : (
                <>
                  En snabb och realtidsuppdaterad översikt över alla <strong>42 datorsalar</strong> på Campus Valla vid Linköpings universitet (22 Linux-salar och 20 Windows-salar).
                </>
              )}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[var(--panel-hover)] border border-[var(--rule)] space-y-2">
            <div className="flex items-start gap-2">
              <Clock size={14} className="text-accent-linux shrink-0 mt-0.5" />
              <div>
                <strong className="text-[var(--ink)]">{isEn ? 'Academic Quarter (kvart)' : 'Akademisk kvart'}:</strong>{' '}
                {isEn
                  ? 'University lectures typically start at :15. Bookings in TimeEdit run from :15 to :00.'
                  : 'Undervisning börjar oftast kvart över (:15). Bokningar i TimeEdit sträcker sig från :15 till :00.'}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Shield size={14} className="text-status-sim shrink-0 mt-0.5" />
              <div>
                <strong className="text-[var(--ink)]">{isEn ? 'LiU-Card Night Access' : 'LiU-kort kvällsaccess'}:</strong>{' '}
                {isEn
                  ? 'Computer labs are generally accessible 24/7 with a valid LiU card and PIN.'
                  : 'Datorsalarna är i regel tillgängliga dygnet runt med giltigt LiU-kort och pinkod.'}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-[var(--ink)] mb-1 flex items-center gap-1.5">
              <MapPin size={15} className="text-accent-linux" />
              {isEn ? 'Mazemap Navigation' : 'Mazemap Navigering'}
            </h3>
            <p>
              {isEn
                ? 'Each computer lab card contains a direct Mazemap link that displays the exact building entrance, floor, and corridor placement on Campus Valla.'
                : 'Varje sal har en direktlänk till Mazemap som visar exakt placering på våningsplan och i korridorer på Campus Valla.'}
            </p>
          </div>

          <div className="pt-3 border-t border-[var(--rule)] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--ink-3)] font-mono">
            <span>{isEn ? 'Data from TimeEdit LiU' : 'Data från TimeEdit LiU'}</span>
            <a
              href="https://cloud.timeedit.net/liu/web/schema/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-linux hover:underline flex items-center gap-1"
            >
              <span>TimeEdit Web</span>
              <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

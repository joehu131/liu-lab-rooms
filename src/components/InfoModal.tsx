'use client';

import React from 'react';
import { X, MapPin, Clock, Shield, Monitor, ExternalLink } from 'lucide-react';
import { Language } from '@/lib/i18n';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, lang = 'sv' }) => {
  if (!isOpen) return null;

  const isEn = lang === 'en';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="panel-glass max-w-lg w-full p-6 text-[var(--ink)] border-[var(--rule)] relative max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--rule)]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-linux animate-pulse" />
            <h2 className="font-mono text-sm font-semibold tracking-wider uppercase text-[var(--ink)]">
              {isEn ? 'LiU Lab Rooms • Campus Valla' : 'LiU Labbsalar • Campus Valla'}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label={isEn ? 'Close modal' : 'Stäng ruta'}
            className="p-1 rounded-md text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--panel-hover)] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
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
              <Clock size={15} className="text-status-warn shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[var(--ink)]">
                  {isEn ? 'Future Lab Availability:' : 'Framtida salstillgång:'}
                </span>{' '}
                {isEn
                  ? 'Use the button below the clock to simulate lab occupancy at any chosen date and lecture pass up to 14 days ahead.'
                  : 'Använd knappen under klockan för att simulera salstillgång valfri dag och lektionspass framåt i tiden.'}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Shield size={15} className="text-status-free shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[var(--ink)]">
                  {isEn ? 'Building Access & Keycards:' : 'Tillträde & Passerkort:'}
                </span>{' '}
                {isEn
                  ? 'Entrance doors lock at 17:00 on weekdays and are locked on weekends. LiU card with PIN is required. Buildings close at 22:00.'
                  : 'Entrédörrar låses kl. 17:00 på vardagar och är låsta under helger. LiU-kort med PIN-kod krävs. Byggnaderna stänger kl. 22:00.'}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={15} className="text-accent-linux shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[var(--ink)]">Mazemap:</span>{' '}
                {isEn
                  ? 'Click the map button on any lab row for direct indoor navigation on Campus Valla.'
                  : 'Klicka på kartknappen på valfri salsrad för direkt inomhusnavigering på Campus Valla.'}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-[var(--ink)] mb-1">
              {isEn ? 'Schedule Data' : 'Schemakälla'}
            </h3>
            <p>
              {isEn
                ? 'Schedules are fetched directly from LiU TimeEdit Cloud in real time and cached at Vercel Edge.'
                : 'Schemat hämtas direkt från LiU TimeEdit Cloud i realtid och cachas effektivt på Vercel Edge.'}
            </p>
          </div>

          <div className="pt-2 border-t border-[var(--rule)] flex justify-between items-center text-[11px] text-[var(--ink-3)] font-mono">
            <span>LiU Campus Valla</span>
            <a
              href="https://cloud.timeedit.net/liu/web/schema/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-linux hover:underline flex items-center gap-1"
            >
              TimeEdit <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

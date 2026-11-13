import {useEffect} from 'react';
import {MessageCircle, Phone, X} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import {BOUTIQUE_INFO, type CollectionPiece} from '../data/boutiqueData';
import {ResilientImage} from './ResilientImage';

interface CollectionDetailModalProps {
  piece: CollectionPiece | null;
  onClose: () => void;
  onBookFitting: (piece: CollectionPiece) => void;
}

export function CollectionDetailModal({
  piece,
  onClose,
  onBookFitting,
}: CollectionDetailModalProps) {
  useEffect(() => {
    if (!piece) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [piece, onClose]);

  return (
    <AnimatePresence>
      {piece && (
        <motion.div
          key="modal-backdrop"
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          transition={{duration: 0.2}}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2E1620]/65 p-4 backdrop-blur-[2px] sm:p-6"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="piece-modal-title"
        >
          <motion.div
            key={piece.id}
            initial={{opacity: 0, y: 12, scale: 0.98}}
            animate={{opacity: 1, y: 0, scale: 1}}
            exit={{opacity: 0, y: 8, scale: 0.98}}
            transition={{duration: 0.24, ease: [0.16, 1, 0.3, 1]}}
            className="relative grid max-h-[90vh] w-full max-w-4xl grid-cols-1 overflow-y-auto rounded-3xl border border-[#B87463]/25 bg-[#FDF6F7] shadow-2xl md:grid-cols-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close lookbook details"
              className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#FDF6F7]/90 text-[#2E1620] transition-colors hover:bg-[#F9E3E8] focus-visible:outline-2 focus-visible:outline-[#B87463]"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="aspect-[4/3] w-full bg-[#F9E8EC] md:aspect-auto md:h-full">
              <ResilientImage
                src={piece.image}
                alt={piece.alt}
                fallbackTitle={piece.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
              <div>
                <p className="text-xs font-medium tracking-[0.12em] uppercase text-[#B87463]">
                  {piece.category} · {piece.subcategory}
                </p>
                <h3
                  id="piece-modal-title"
                  className="mt-2 font-serif text-3xl font-medium leading-tight text-[#2E1620]"
                >
                  {piece.title}
                </h3>
                <p className="mt-2 font-sans text-lg font-semibold tabular-nums text-[#2E1620]">
                  {piece.price}{' '}
                  <span className="ml-2 text-xs font-normal text-[#664954]">
                    Available at Barking Boutique
                  </span>
                </p>

                <p className="mt-5 text-sm leading-relaxed text-[#664954]">
                  {piece.description}
                </p>

                <dl className="mt-6 space-y-3 border-t border-[#B87463]/20 pt-5 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#664954]">Sizes</dt>
                    <dd className="text-right font-medium text-[#2E1620] tabular-nums">
                      {piece.sizes}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="shrink-0 text-[#664954]">Fabric</dt>
                    <dd className="text-right text-[#2E1620]">
                      {piece.fabric}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="shrink-0 text-[#664954]">Occasion</dt>
                    <dd className="text-right text-[#2E1620]">
                      {piece.occasion}
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 rounded-2xl bg-[#F9E8EC] p-4">
                  <p className="text-xs font-medium tracking-[0.08em] uppercase text-[#B87463]">
                    Stylist Note
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#664954]">
                    {piece.stylingNote}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => onBookFitting(piece)}
                  className="w-full rounded-full bg-[#2E1620] px-5 py-3 text-sm font-medium text-[#FDF6F7] transition-colors hover:bg-[#3D1F2B] focus-visible:outline-2 focus-visible:outline-[#B87463] whitespace-nowrap"
                >
                  Request In-Store Fitting
                </button>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <a
                    href={`https://wa.me/442085919797?text=${encodeURIComponent(
                      `Hello PrettyAngel's Boutique, I would like to check availability for the ${piece.title} (${piece.price}).`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[#B87463]/40 bg-white px-4 py-2.5 text-xs font-medium text-[#2E1620] transition-colors hover:bg-[#F9E8EC] whitespace-nowrap"
                  >
                    <MessageCircle
                      className="h-4 w-4 text-[#B87463]"
                      aria-hidden="true"
                    />
                    WhatsApp Boutique
                  </a>
                  <a
                    href={BOUTIQUE_INFO.phoneHref}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[#B87463]/40 bg-white px-4 py-2.5 text-xs font-medium text-[#2E1620] transition-colors hover:bg-[#F9E8EC] tabular-nums whitespace-nowrap"
                  >
                    <Phone
                      className="h-4 w-4 text-[#B87463]"
                      aria-hidden="true"
                    />
                    Call +44 20 8591 9797
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {type FormEvent, useEffect, useMemo, useRef, useState} from 'react';
import {
  ArrowRight,
  ArrowUp,
  CalendarCheck,
  Check,
  Clock,
  MapPin,
  Menu,
  MessageCircle,
  Navigation,
  Phone,
  Sparkles,
  X,
} from 'lucide-react';
import {AnimatePresence, motion, MotionConfig} from 'motion/react';
import {BoutiqueMap} from './components/BoutiqueMap';
import {CollectionDetailModal} from './components/CollectionDetailModal';
import {ResilientImage} from './components/ResilientImage';
import {
  ATELIER_SALON_IMAGE,
  BOOKING_OCCASIONS,
  BOOKING_TIME_SLOTS,
  BOUTIQUE_INFO,
  CATEGORIES,
  COLLECTIONS,
  getBoutiqueOpenStatus,
  HERO_SLIDES,
  TESTIMONIALS,
  type CollectionCategory,
  type CollectionPiece,
} from './data/boutiqueData';

const EASE_LUXURY = [0.16, 1, 0.3, 1] as const;

const textStaggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.04,
    },
  },
};

const textStaggerItem = {
  hidden: {opacity: 0, y: 20},
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: EASE_LUXURY,
    },
  },
};

const cardGridContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.11,
    },
  },
};

const cardSlideUpItem = {
  hidden: {opacity: 0, y: 24},
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: EASE_LUXURY,
    },
  },
};

interface BookingReceipt {
  reference: string;
  name: string;
  contact: string;
  occasion: string;
  category: string;
  date: string;
  timeSlot: string;
  notes: string;
}

export default function App() {
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [activeCategory, setActiveCategory] =
    useState<CollectionCategory>('All Collections');
  const [selectedPiece, setSelectedPiece] = useState<CollectionPiece | null>(
    null
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);

  // Dedicated Private Booking Studio state
  const [selectedOccasionId, setSelectedOccasionId] = useState<string>(
    BOOKING_OCCASIONS[0].id
  );
  const [preferredCategory, setPreferredCategory] = useState<string>(
    BOOKING_OCCASIONS[0].defaultCategory
  );
  const [bookingDate, setBookingDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(
    BOOKING_TIME_SLOTS[1]
  );
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [enquiryNotes, setEnquiryNotes] = useState('');
  const [bookingReceipt, setBookingReceipt] = useState<BookingReceipt | null>(
    null
  );

  useEffect(() => {
    const handleQuotaExceeded = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () =>
      window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  // Auto-cycle full-bleed hero editorial photography
  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, []);

  // Reveal floating Back-to-Top button once user scrolls past Hero
  useEffect(() => {
    const heroEl = heroRef.current;
    if (!heroEl || typeof IntersectionObserver === 'undefined') {
      const onScroll = () => setShowBackToTop(window.scrollY > 560);
      window.addEventListener('scroll', onScroll, {passive: true});
      return () => window.removeEventListener('scroll', onScroll);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowBackToTop(!entry.isIntersecting);
      },
      {threshold: 0.08}
    );

    observer.observe(heroEl);
    return () => observer.disconnect();
  }, []);

  const openStatus = useMemo(() => getBoutiqueOpenStatus(), []);

  const filteredPieces = useMemo(() => {
    if (activeCategory === 'All Collections') return COLLECTIONS;
    return COLLECTIONS.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const currentSlide = HERO_SLIDES[heroSlideIndex] ?? HERO_SLIDES[0];

  const isSundaySelected = useMemo(() => {
    if (!bookingDate) return false;
    const parsed = new Date(`${bookingDate}T12:00:00Z`);
    return parsed.getUTCDay() === 0;
  }, [bookingDate]);

  const selectedOccasion =
    BOOKING_OCCASIONS.find((o) => o.id === selectedOccasionId) ??
    BOOKING_OCCASIONS[0];

  const handleOccasionChange = (occasionId: string) => {
    setSelectedOccasionId(occasionId);
    const match = BOOKING_OCCASIONS.find((o) => o.id === occasionId);
    if (match) {
      setPreferredCategory(match.defaultCategory);
    }
  };

  const handleBookFromPiece = (piece: CollectionPiece) => {
    setSelectedPiece(null);
    setPreferredCategory(piece.category);
    if (piece.category === "Women's Suits") {
      setSelectedOccasionId('tailored-suit');
    } else if (piece.category === 'Shoes' || piece.category === 'Bags') {
      setSelectedOccasionId('shoes-bags');
    } else {
      setSelectedOccasionId('wedding-guest');
    }
    setEnquiryNotes(
      `I would love to try on the ${piece.title} (${piece.price}).`
    );
    setBookingReceipt(null);
    const target = document.getElementById('booking');
    target?.scrollIntoView({behavior: 'smooth', block: 'start'});
  };

  const handleBookingSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientContact.trim() || isSundaySelected) {
      return;
    }

    const refNumber = `PA-${String(Date.now()).slice(-4)}`;
    const formattedDate = bookingDate
      ? new Date(`${bookingDate}T12:00:00`).toLocaleDateString('en-GB', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : 'Next available Monday–Saturday';

    setBookingReceipt({
      reference: refNumber,
      name: clientName.trim(),
      contact: clientContact.trim(),
      occasion: selectedOccasion.title,
      category: preferredCategory,
      date: formattedDate,
      timeSlot: selectedTimeSlot,
      notes: enquiryNotes.trim(),
    });

    setClientName('');
    setClientContact('');
    setBookingDate('');
    setEnquiryNotes('');
  };

  const scrollToTop = () => {
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const todayIso = new Date().toISOString().split('T')[0];

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#FDF6F7] text-[#2E1620] selection:bg-[#F2C9D4] selection:text-[#2E1620]">
        {quotaExceeded && (
          <div className="sticky top-0 z-50 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-xs text-amber-900 shadow-sm md:text-sm">
            <span>
              Google Maps Platform quota reached. If you are the app owner,
              visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-amber-950 underline hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}

        {/* Strict 3-Zone Top Bar */}
        <header className="sticky top-0 z-40 border-b border-[#B87463]/20 bg-[#FDF6F7]/95 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-8 px-6 lg:px-12">
            {/* Zone 1: Brand Wordmark */}
            <a
              href="#"
              className="font-serif text-2xl font-medium tracking-tight text-[#2E1620] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#B87463]"
            >
              PrettyAngel&apos;s
            </a>

            {/* Zone 2: Single-line Nav Links */}
            <nav
              aria-label="Primary navigation"
              className="hidden items-center gap-8 text-sm font-medium text-[#664954] md:flex"
            >
              <a
                href="#collections"
                className="transition-colors duration-150 hover:text-[#2E1620] hover:underline hover:decoration-[#B87463] hover:underline-offset-4 whitespace-nowrap shrink-0"
              >
                Collections
              </a>
              <a
                href="#about"
                className="transition-colors duration-150 hover:text-[#2E1620] hover:underline hover:decoration-[#B87463] hover:underline-offset-4 whitespace-nowrap shrink-0"
              >
                Our Story
              </a>
              <a
                href="#booking"
                className="transition-colors duration-150 hover:text-[#2E1620] hover:underline hover:decoration-[#B87463] hover:underline-offset-4 whitespace-nowrap shrink-0"
              >
                Book Fitting
              </a>
              <a
                href="#visit"
                className="transition-colors duration-150 hover:text-[#2E1620] hover:underline hover:decoration-[#B87463] hover:underline-offset-4 whitespace-nowrap shrink-0"
              >
                Visit Us
              </a>
            </nav>

            {/* Zone 3: Primary Action + Mobile Drawer Toggle */}
            <div className="flex items-center gap-3 shrink-0">
              <a
                href="#booking"
                className="hidden rounded-full bg-[#2E1620] px-5 py-2.5 text-xs font-medium tracking-wide text-[#FDF6F7] transition-colors duration-150 hover:bg-[#3D1F2B] focus-visible:outline-2 focus-visible:outline-[#B87463] whitespace-nowrap shrink-0 md:inline-flex"
              >
                Book Styling
              </a>
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-expanded={mobileMenuOpen}
                aria-label={
                  mobileMenuOpen
                    ? 'Close navigation menu'
                    : 'Open navigation menu'
                }
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[#2E1620] transition-colors hover:bg-[#F9E3E8] focus-visible:outline-2 focus-visible:outline-[#B87463] md:hidden"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.nav
                initial={{opacity: 0, y: -6}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -6}}
                transition={{duration: 0.16}}
                aria-label="Mobile navigation"
                className="border-t border-[#B87463]/15 bg-[#FDF6F7] px-6 py-4 md:hidden"
              >
                <div className="flex flex-col gap-1">
                  <a
                    href="#collections"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-sm font-medium text-[#2E1620]"
                  >
                    Collections
                  </a>
                  <a
                    href="#about"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-sm font-medium text-[#2E1620]"
                  >
                    Our Story
                  </a>
                  <a
                    href="#booking"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-sm font-medium text-[#2E1620]"
                  >
                    Book Fitting
                  </a>
                  <a
                    href="#visit"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-sm font-medium text-[#2E1620]"
                  >
                    Visit Us
                  </a>
                  <a
                    href="#booking"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-2 inline-flex justify-center rounded-full bg-[#2E1620] px-5 py-3 text-sm font-medium text-[#FDF6F7]"
                  >
                    Book Styling
                  </a>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </header>

        <main>
          {/* Full-Bleed Changing Hero with Soft Rose-Plum Fade Scrim */}
          <section
            ref={heroRef}
            id="hero"
            className="relative overflow-hidden bg-[#2E1620]"
          >
            <div className="relative flex min-h-[600px] items-end lg:min-h-[690px] lg:items-center">
              {/* Background Changing Photography Layer: all slides mounted and smoothly cross-dissolved */}
              <div className="absolute inset-0 overflow-hidden bg-[#2E1620]">
                {HERO_SLIDES.map((slide, idx) => {
                  const isActive = idx === heroSlideIndex;
                  return (
                    <motion.div
                      key={slide.id}
                      initial={false}
                      animate={{
                        opacity: isActive ? 1 : 0,
                        scale: isActive ? 1 : 1.04,
                      }}
                      transition={{
                        opacity: {duration: 1.4, ease: [0.22, 1, 0.36, 1]},
                        scale: {duration: 6.5, ease: [0.22, 1, 0.36, 1]},
                      }}
                      style={{
                        zIndex: isActive ? 1 : 0,
                        pointerEvents: 'none',
                      }}
                      className="absolute inset-0 h-full w-full"
                    >
                      <ResilientImage
                        src={slide.image}
                        alt={slide.alt}
                        fallbackTitle={slide.captionTitle}
                        className="h-full w-full object-cover object-center"
                      />
                    </motion.div>
                  );
                })}

                {/* Directional Soft Rose-Plum Fade Scrim: protects left text while keeping the imagery radiant */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-r from-[#2E1620]/90 via-[#4A2232]/62 to-[#2E1620]/15"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-[#2E1620]/85 via-transparent to-[#2E1620]/25"
                />
                {/* Subtle animated rose-gold silk glow */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-24 -left-16 z-[2] h-[420px] w-[420px] rounded-full bg-radial from-[#E7B8A9]/22 via-[#F2C9D4]/10 to-transparent blur-3xl animate-silk-aurora"
                />
              </div>

              {/* Foreground Editorial Content Fading Smoothly Over the Photography */}
              <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 pt-20 pb-14 lg:px-12 lg:py-24">
                <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
                  <motion.div
                    variants={textStaggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="max-w-2xl"
                  >
                    <motion.p
                      variants={textStaggerItem}
                      className="text-xs font-medium tracking-[0.18em] uppercase text-[#E7B8A9]"
                    >
                      Unit 23/24 · Vicarage Field · Barking IG11 8DH
                    </motion.p>
                    <motion.h1
                      variants={textStaggerItem}
                      className="mt-4 font-serif text-[clamp(2.65rem,4.8vw,4.35rem)] font-medium leading-[1.04] tracking-tight text-[#FDF6F7] [text-wrap:balance]"
                    >
                      Silk Blush Elegance,{' '}
                      <span className="italic text-[#F2C9D4]">
                        Dressed in Rose Gold
                      </span>
                    </motion.h1>
                    <motion.p
                      variants={textStaggerItem}
                      className="mt-5 max-w-xl text-base leading-[1.75] text-[#FDF6F7]/90"
                    >
                      Step into Barking&apos;s premier women&apos;s
                      occasion-wear house. For over ten years, PrettyAngel&apos;s
                      Boutique has curated alluring silk gowns, sculpted
                      women&apos;s suits, pleated skirts, heels, and evening
                      clutches made for unforgettable entrances.
                    </motion.p>

                    {/* Primary CTA + WhatsApp + Click-to-Call */}
                    <motion.div
                      variants={textStaggerItem}
                      className="mt-8 flex flex-wrap items-center gap-3.5"
                    >
                      <a
                        href="#collections"
                        className="inline-flex items-center gap-2 rounded-full bg-[#E7B8A9] px-6 py-3.5 text-sm font-semibold text-[#2E1620] shadow-md transition-colors duration-150 hover:bg-[#F2C9D4] focus-visible:outline-2 focus-visible:outline-[#FDF6F7] whitespace-nowrap shrink-0"
                      >
                        Explore Collections
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </a>
                      <a
                        href={BOUTIQUE_INFO.whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-[#E7B8A9]/65 bg-[#2E1620]/65 px-5 py-3.5 text-sm font-medium text-[#FDF6F7] backdrop-blur-sm transition-colors duration-150 hover:bg-[#3D1F2B] focus-visible:outline-2 focus-visible:outline-[#E7B8A9] whitespace-nowrap shrink-0"
                      >
                        <MessageCircle
                          className="h-4 w-4 text-[#E7B8A9]"
                          aria-hidden="true"
                        />
                        WhatsApp Us
                      </a>
                      <a
                        href={BOUTIQUE_INFO.phoneHref}
                        className="inline-flex items-center gap-2 rounded-full border border-[#FDF6F7]/35 bg-[#2E1620]/50 px-5 py-3.5 text-sm font-medium text-[#FDF6F7] backdrop-blur-sm transition-colors duration-150 hover:bg-[#3D1F2B] focus-visible:outline-2 focus-visible:outline-[#E7B8A9] tabular-nums whitespace-nowrap shrink-0"
                      >
                        <Phone
                          className="h-4 w-4 text-[#E7B8A9]"
                          aria-hidden="true"
                        />
                        {BOUTIQUE_INFO.phoneDisplay}
                      </a>
                    </motion.div>

                    <motion.p
                      variants={textStaggerItem}
                      className="mt-6 text-xs font-medium text-[#E7B8A9]"
                    >
                      {openStatus.label} · Monday–Saturday 9:30am–6:00pm
                    </motion.p>
                  </motion.div>

                  {/* Right Hero Look Switcher & Current Slide Caption */}
                  <motion.div
                    initial={{opacity: 0, y: 18}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.55, delay: 0.25, ease: EASE_LUXURY}}
                    className="flex flex-col items-start gap-3 lg:items-end"
                  >
                    <div className="border-t border-[#E7B8A9]/40 pt-3 lg:text-right">
                      <p className="font-serif text-xl font-medium text-[#FDF6F7]">
                        {currentSlide.captionTitle}
                      </p>
                      <p className="mt-0.5 text-xs text-[#E7B8A9]">
                        {currentSlide.captionSubtitle}
                      </p>
                    </div>
                    <div
                      className="flex items-center gap-2"
                      role="group"
                      aria-label="Hero showcase slides"
                    >
                      {HERO_SLIDES.map((slide, idx) => {
                        const active = idx === heroSlideIndex;
                        return (
                          <button
                            key={slide.id}
                            type="button"
                            onClick={() => setHeroSlideIndex(idx)}
                            aria-label={`Show look ${idx + 1}: ${slide.captionTitle}`}
                            aria-pressed={active}
                            className={`h-9 rounded-full px-3.5 text-xs font-medium tabular-nums transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#E7B8A9] ${
                              active
                                ? 'bg-[#E7B8A9] text-[#2E1620]'
                                : 'border border-[#E7B8A9]/40 bg-[#2E1620]/60 text-[#FDF6F7] hover:bg-[#3D1F2B]'
                            }`}
                          >
                            0{idx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Deep Velvet Mulberry Boutique Pillars Ribbon */}
            <div className="relative border-t border-[#E7B8A9]/25 bg-[#2E1620] text-[#FDF6F7]">
              <motion.div
                variants={cardGridContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{once: true, amount: 0.2}}
                className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 px-6 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 lg:px-12"
              >
                <motion.div variants={textStaggerItem}>
                  <p className="font-serif text-xl font-medium text-[#E7B8A9] tabular-nums">
                    10+ Years in Barking
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#FDF6F7]/75">
                    Trusted by generations across East London &amp; Essex
                  </p>
                </motion.div>
                <motion.div
                  variants={textStaggerItem}
                  className="lg:border-l lg:border-[#E7B8A9]/20 lg:pl-8"
                >
                  <p className="font-serif text-xl font-medium text-[#E7B8A9]">
                    Head-to-Toe Outfitting
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#FDF6F7]/75">
                    Dresses, skirts, tailored suits, shoes &amp; evening bags
                  </p>
                </motion.div>
                <motion.div
                  variants={textStaggerItem}
                  className="lg:border-l lg:border-[#E7B8A9]/20 lg:pl-8"
                >
                  <p className="font-serif text-xl font-medium text-[#E7B8A9]">
                    One-to-One Styling
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#FDF6F7]/75">
                    Warm personal fittings across UK sizes 8 through 20
                  </p>
                </motion.div>
                <motion.div
                  variants={textStaggerItem}
                  className="lg:border-l lg:border-[#E7B8A9]/20 lg:pl-8"
                >
                  <p className="font-serif text-xl font-medium text-[#E7B8A9]">
                    Vicarage Field Salon
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#FDF6F7]/75">
                    Unit 23/24 · Three minutes from Barking Station
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Fashion Gallery Section */}
          <section
            id="collections"
            className="relative overflow-hidden border-b border-[#B87463]/20 bg-gradient-to-b from-[#FDF6F7] via-[#FBF0F3] to-[#FDF6F7] py-16 lg:py-24"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-10 right-0 h-96 w-96 rounded-full bg-radial from-[#F2C9D4]/45 to-transparent blur-3xl animate-gold-drift"
            />

            <div className="relative mx-auto max-w-[1440px] px-6 lg:px-12">
              <div className="flex flex-col justify-between gap-6 border-b border-[#B87463]/20 pb-8 lg:flex-row lg:items-end">
                <motion.div
                  variants={textStaggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{once: true, amount: 0.2}}
                >
                  <motion.p
                    variants={textStaggerItem}
                    className="text-xs font-medium tracking-[0.14em] uppercase text-[#B87463]"
                  >
                    Curated Fashion Gallery
                  </motion.p>
                  <motion.h2
                    variants={textStaggerItem}
                    className="mt-2 font-serif text-[clamp(1.95rem,3.2vw,2.9rem)] font-medium leading-tight text-[#2E1620] [text-wrap:balance]"
                  >
                    Signature Silhouettes,{' '}
                    <span className="italic text-[#B87463]">
                      Crafted to Turn Heads
                    </span>
                  </motion.h2>
                  <motion.p
                    variants={textStaggerItem}
                    className="mt-3 max-w-xl text-sm leading-relaxed text-[#664954]"
                  >
                    Explore our flagship dresses, pleated skirts, sculpted
                    women&apos;s suits, cushioned heels, and structured clutches
                    available to try in our Barking boutique.
                  </motion.p>
                </motion.div>

                {/* Interactive Category Filter Controls */}
                <motion.div
                  variants={textStaggerItem}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{once: true, amount: 0.2}}
                  role="tablist"
                  aria-label="Filter fashion gallery by category"
                  className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-[#B87463]/20 bg-[#F9E8EC] p-1.5"
                >
                  {CATEGORIES.map((category) => {
                    const isActive = activeCategory === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveCategory(category)}
                        className={`rounded-xl px-3.5 py-2 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#B87463] whitespace-nowrap shrink-0 ${
                          isActive
                            ? 'bg-[#2E1620] text-[#FDF6F7] shadow-xs'
                            : 'text-[#664954] hover:bg-[#FDF6F7] hover:text-[#2E1620]'
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </motion.div>
              </div>

              <motion.div
                layout
                className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
              >
                <AnimatePresence mode="popLayout">
                  {filteredPieces.map((piece, idx) => (
                    <motion.article
                      key={piece.id}
                      layout
                      initial={{opacity: 0, y: 26}}
                      whileInView={{opacity: 1, y: 0}}
                      exit={{opacity: 0, y: 12, scale: 0.97}}
                      viewport={{once: true, amount: 0.1}}
                      whileHover={{
                        y: -4,
                        transition: {duration: 0.2, ease: EASE_LUXURY},
                      }}
                      transition={{
                        opacity: {
                          duration: 0.5,
                          delay: (idx % 3) * 0.09,
                          ease: EASE_LUXURY,
                        },
                        y: {
                          duration: 0.5,
                          delay: (idx % 3) * 0.09,
                          ease: EASE_LUXURY,
                        },
                        layout: {duration: 0.35, ease: EASE_LUXURY},
                      }}
                      className="group flex flex-col overflow-hidden rounded-3xl border border-[#B87463]/25 bg-white transition-[border-color,box-shadow] duration-200 hover:border-[#B87463]/70 hover:shadow-[0_14px_34px_-14px_rgba(46,22,32,0.18)]"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedPiece(piece)}
                        className="relative aspect-[4/3] w-full overflow-hidden bg-[#F9E8EC] text-left focus-visible:outline-2 focus-visible:outline-[#B87463]"
                      >
                        <ResilientImage
                          src={piece.image}
                          alt={piece.alt}
                          fallbackTitle={piece.title}
                          className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                        />
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#2E1620]/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        />
                      </button>

                      <div className="flex flex-1 flex-col justify-between p-6">
                        <div>
                          <p className="text-xs font-medium tracking-[0.09em] uppercase text-[#B87463]">
                            {piece.category} · {piece.subcategory}
                          </p>
                          <h3 className="mt-2 font-serif text-2xl font-medium leading-snug text-[#2E1620]">
                            {piece.title}
                          </h3>
                          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#664954]">
                            {piece.description}
                          </p>
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-[#B87463]/15 pt-4">
                          <div>
                            <p className="text-base font-semibold tabular-nums text-[#2E1620]">
                              {piece.price}
                            </p>
                            <p className="text-xs text-[#664954] tabular-nums">
                              {piece.sizes}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedPiece(piece)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#B87463]/45 bg-[#FDF6F7] px-4 py-2 text-xs font-medium text-[#2E1620] transition-colors duration-150 hover:bg-[#2E1620] hover:text-[#FDF6F7] focus-visible:outline-2 focus-visible:outline-[#B87463] whitespace-nowrap shrink-0"
                          >
                            View Piece
                            <ArrowRight
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          </section>

          {/* About Us Section — Silk Blush Pink & Rose Gold Gradient */}
          <section
            id="about"
            className="border-b border-[#B87463]/20 bg-gradient-to-br from-[#F9E3E8] via-[#FDF6F7] to-[#F3DBD4] py-16 lg:py-24"
          >
            <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-stretch gap-10 px-6 lg:grid-cols-12 lg:gap-14 lg:px-12">
              <motion.div
                variants={cardSlideUpItem}
                initial="hidden"
                whileInView="visible"
                viewport={{once: true, amount: 0.15}}
                className="lg:col-span-6"
              >
                <div className="h-full overflow-hidden rounded-3xl border border-[#B87463]/30 bg-white p-2.5 shadow-sm sm:p-3">
                  <div className="aspect-[4/3] h-full w-full overflow-hidden rounded-2xl">
                    <ResilientImage
                      src={ATELIER_SALON_IMAGE}
                      alt="Inside PrettyAngel's Boutique at Vicarage Field with blush, champagne, and ivory dresses on brass rails"
                      fallbackTitle="PrettyAngel's Boutique Interior"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={textStaggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{once: true, amount: 0.15}}
                className="flex flex-col justify-center lg:col-span-6"
              >
                <motion.p
                  variants={textStaggerItem}
                  className="text-xs font-medium tracking-[0.14em] uppercase text-[#B87463]"
                >
                  Our Heritage · Over 10 Years in Barking
                </motion.p>
                <motion.h2
                  variants={textStaggerItem}
                  className="mt-3 font-serif text-[clamp(1.95rem,3.2vw,2.9rem)] font-medium leading-tight text-[#2E1620] [text-wrap:balance]"
                >
                  A Decade of Dressing Women for Life&apos;s Defining Moments
                </motion.h2>
                <motion.p
                  variants={textStaggerItem}
                  className="mt-5 text-base leading-[1.75] text-[#553A44]"
                >
                  For more than ten years inside Vicarage Field Shopping Centre,
                  PrettyAngel&apos;s Boutique has been a cherished wardrobe
                  sanctuary for women across Barking, Redbridge, and Essex. What
                  began with a single rail of hand-picked occasion gowns has
                  blossomed into a full-service styling salon trusted by
                  mothers, brides&apos; families, and celebrants alike.
                </motion.p>
                <motion.p
                  variants={textStaggerItem}
                  className="mt-4 text-base leading-[1.75] text-[#553A44]"
                >
                  Whether you are drawn to fluid silk-chiffon movement, a
                  sculpted blush tailored suit, or the exact champagne heel and
                  clutch to complete your silhouette, our stylists welcome every
                  visitor with unhurried warmth and honest fitting care.
                </motion.p>

                <motion.div
                  variants={textStaggerItem}
                  className="mt-8 grid grid-cols-1 gap-6 border-t border-[#B87463]/25 pt-6 sm:grid-cols-2"
                >
                  <div>
                    <p className="font-serif text-xl font-medium text-[#2E1620]">
                      Complete Occasion Styling
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#664954]">
                      Coordinated dresses, skirts, women&apos;s suits, shoes,
                      and evening bags curated under one roof.
                    </p>
                  </div>
                  <div>
                    <p className="font-serif text-xl font-medium text-[#2E1620]">
                      Personal Fitting Guidance
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#664954]">
                      Walk into Unit 23/24 or reserve a private appointment
                      tailored around your celebration date.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Customer Testimonials Section — Deep Mulberry Velvet Contrast */}
          <section
            id="testimonials"
            className="border-b border-[#B87463]/25 bg-[#2E1620] py-16 text-[#FDF6F7] lg:py-24"
          >
            <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
              <motion.div
                variants={textStaggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{once: true, amount: 0.2}}
                className="max-w-2xl"
              >
                <motion.p
                  variants={textStaggerItem}
                  className="text-xs font-medium tracking-[0.14em] uppercase text-[#E7B8A9]"
                >
                  Client Stories · Real Boutique Experiences
                </motion.p>
                <motion.h2
                  variants={textStaggerItem}
                  className="mt-2 font-serif text-[clamp(1.95rem,3.2vw,2.85rem)] font-medium leading-tight text-[#FDF6F7] [text-wrap:balance]"
                >
                  Remembered Long After the Last Toast
                </motion.h2>
              </motion.div>

              <motion.div
                variants={cardGridContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{once: true, amount: 0.15}}
                className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3"
              >
                {TESTIMONIALS.map((item) => (
                  <motion.blockquote
                    key={item.id}
                    variants={cardSlideUpItem}
                    className="flex flex-col justify-between rounded-3xl border border-[#E7B8A9]/25 bg-[#3D1F2B] p-7 sm:p-8"
                  >
                    <div>
                      <span
                        aria-hidden="true"
                        className="font-serif text-4xl leading-none text-[#E7B8A9]"
                      >
                        &ldquo;
                      </span>
                      <p className="mt-2 text-sm leading-[1.8] text-[#FDF6F7]/90">
                        {item.quote}
                      </p>
                    </div>
                    <footer className="mt-6 border-t border-[#E7B8A9]/20 pt-4">
                      <p className="font-serif text-lg font-medium text-[#FDF6F7]">
                        {item.clientName}
                      </p>
                      <p className="mt-0.5 text-xs text-[#E7B8A9]">
                        {item.occasion} · {item.location}
                      </p>
                    </footer>
                  </motion.blockquote>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Dedicated Private Styling & Booking Section */}
          <section
            id="booking"
            className="border-b border-[#B87463]/20 bg-gradient-to-br from-[#FDF6F7] via-[#F9E8EC] to-[#F4DFD9] py-16 lg:py-24"
          >
            <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
              <motion.div
                variants={textStaggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{once: true, amount: 0.2}}
                className="max-w-2xl"
              >
                <motion.p
                  variants={textStaggerItem}
                  className="text-xs font-medium tracking-[0.14em] uppercase text-[#B87463]"
                >
                  Private Salon Concierge
                </motion.p>
                <motion.h2
                  variants={textStaggerItem}
                  className="mt-2 font-serif text-[clamp(1.95rem,3.2vw,2.9rem)] font-medium leading-tight text-[#2E1620] [text-wrap:balance]"
                >
                  Reserve Your Personal{' '}
                  <span className="italic text-[#B87463]">
                    Styling Appointment
                  </span>
                </motion.h2>
                <motion.p
                  variants={textStaggerItem}
                  className="mt-3 text-sm leading-relaxed text-[#664954]"
                >
                  Choose your occasion, preferred date, and salon time slot
                  below. We will prepare a curated rail in your size ready for
                  your arrival at Unit 23/24.
                </motion.p>
              </motion.div>

              <motion.div
                variants={cardGridContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{once: true, amount: 0.08}}
                className="mt-10 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12"
              >
                {/* Left Luxury Salon Info Column */}
                <motion.div
                  variants={cardSlideUpItem}
                  className="flex flex-col justify-between rounded-3xl border border-[#B87463]/30 bg-[#2E1620] p-8 text-[#FDF6F7] sm:p-10 lg:col-span-4"
                >
                  <div>
                    <Sparkles
                      className="h-6 w-6 text-[#E7B8A9]"
                      aria-hidden="true"
                    />
                    <h3 className="mt-4 font-serif text-3xl font-medium leading-snug text-[#FDF6F7]">
                      The PrettyAngel&apos;s Fitting Experience
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-[#FDF6F7]/80">
                      Every private appointment includes 45 minutes of
                      one-to-one styling in our Vicarage Field boutique—no rush,
                      no guesswork.
                    </p>

                    <ul className="mt-8 space-y-4 border-t border-[#E7B8A9]/20 pt-6 text-sm text-[#FDF6F7]/90">
                      <li className="flex items-start gap-3">
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#E7B8A9]"
                          aria-hidden="true"
                        />
                        <span>
                          Pre-pulled dresses, skirts, and tailored suits in UK
                          sizes 8–20
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#E7B8A9]"
                          aria-hidden="true"
                        />
                        <span>
                          Side-by-side satin heel and evening clutch colour
                          matching
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#E7B8A9]"
                          aria-hidden="true"
                        />
                        <span>
                          Complimentary pinning &amp; tailoring guidance for
                          your event date
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-10 border-t border-[#E7B8A9]/20 pt-6 text-xs text-[#E7B8A9]">
                    <p className="uppercase tracking-[0.12em]">
                      Appointment Hours
                    </p>
                    <p className="mt-1.5 text-sm font-medium tabular-nums text-[#FDF6F7]">
                      Monday – Saturday: 9:30am – 6:00pm
                    </p>
                    <p className="mt-0.5 text-[#FDF6F7]/70">
                      Sunday: Closed · Walk-ins always welcome Mon–Sat
                    </p>
                  </div>
                </motion.div>

                {/* Right Interactive Booking Studio */}
                <motion.div
                  variants={cardSlideUpItem}
                  className="rounded-3xl border border-[#B87463]/25 bg-white p-7 shadow-sm sm:p-10 lg:col-span-8"
                >
                  {bookingReceipt ? (
                    <motion.div
                      initial={{opacity: 0, y: 10}}
                      animate={{opacity: 1, y: 0}}
                      transition={{duration: 0.3}}
                      className="flex h-full flex-col justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#B87463]/20 pb-5">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F9E8EC] text-[#B87463]">
                              <Check className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <div>
                              <p className="text-xs font-medium tracking-[0.12em] uppercase text-[#B87463]">
                                Private Fitting Requested
                              </p>
                              <h3 className="font-serif text-2xl font-medium text-[#2E1620]">
                                Reference {bookingReceipt.reference}
                              </h3>
                            </div>
                          </div>
                          <span className="text-xs font-medium text-[#664954] tabular-nums">
                            {bookingReceipt.date} · {bookingReceipt.timeSlot}
                          </span>
                        </div>

                        <dl className="mt-6 grid grid-cols-1 gap-4 rounded-2xl bg-[#FDF6F7] p-6 text-sm sm:grid-cols-2">
                          <div>
                            <dt className="text-xs uppercase tracking-wider text-[#664954]">
                              Guest Name
                            </dt>
                            <dd className="mt-1 font-medium text-[#2E1620]">
                              {bookingReceipt.name}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase tracking-wider text-[#664954]">
                              Contact Details
                            </dt>
                            <dd className="mt-1 font-medium text-[#2E1620]">
                              {bookingReceipt.contact}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase tracking-wider text-[#664954]">
                              Occasion Focus
                            </dt>
                            <dd className="mt-1 font-medium text-[#2E1620]">
                              {bookingReceipt.occasion}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase tracking-wider text-[#664954]">
                              Collection Rail
                            </dt>
                            <dd className="mt-1 font-medium text-[#2E1620]">
                              {bookingReceipt.category}
                            </dd>
                          </div>
                          {bookingReceipt.notes && (
                            <div className="sm:col-span-2">
                              <dt className="text-xs uppercase tracking-wider text-[#664954]">
                                Styling Notes
                              </dt>
                              <dd className="mt-1 text-[#2E1620]">
                                {bookingReceipt.notes}
                              </dd>
                            </div>
                          )}
                        </dl>

                        <p className="mt-5 text-sm leading-relaxed text-[#664954]">
                          Send your reservation straight to our Barking stylists
                          via WhatsApp for instant priority confirmation, or
                          call{' '}
                          <a
                            href={BOUTIQUE_INFO.phoneHref}
                            className="font-medium text-[#2E1620] underline decoration-[#B87463] underline-offset-2"
                          >
                            {BOUTIQUE_INFO.phoneDisplay}
                          </a>
                          .
                        </p>
                      </div>

                      <div className="mt-8 flex flex-wrap items-center gap-4">
                        <a
                          href={`https://wa.me/442085919797?text=${encodeURIComponent(
                            `Hello PrettyAngel's Boutique! Booking Ref ${bookingReceipt.reference} — Name: ${bookingReceipt.name}, Occasion: ${bookingReceipt.occasion}, Collection: ${bookingReceipt.category}, Preferred Date: ${bookingReceipt.date} at ${bookingReceipt.timeSlot}. ${bookingReceipt.notes}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-[#2E1620] px-6 py-3.5 text-sm font-medium text-[#FDF6F7] transition-colors hover:bg-[#3D1F2B] whitespace-nowrap"
                        >
                          <MessageCircle
                            className="h-4 w-4 text-[#E7B8A9]"
                            aria-hidden="true"
                          />
                          Confirm via WhatsApp
                        </a>
                        <button
                          type="button"
                          onClick={() => setBookingReceipt(null)}
                          className="rounded-full border border-[#B87463]/45 px-5 py-3.5 text-sm font-medium text-[#2E1620] transition-colors hover:bg-[#F9E8EC] whitespace-nowrap"
                        >
                          Modify or Book Another Slot
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleBookingSubmit} className="space-y-6">
                      {/* Step 1: Occasion Picker */}
                      <div>
                        <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[#B87463]">
                          01. Select Your Occasion
                        </p>
                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {BOOKING_OCCASIONS.map((occasion) => {
                            const active = occasion.id === selectedOccasionId;
                            return (
                              <button
                                key={occasion.id}
                                type="button"
                                onClick={() => handleOccasionChange(occasion.id)}
                                aria-pressed={active}
                                className={`rounded-2xl border p-4 text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#B87463] ${
                                  active
                                    ? 'border-[#B87463] bg-[#F9E8EC] text-[#2E1620]'
                                    : 'border-[#B87463]/20 bg-[#FDF6F7] text-[#2E1620] hover:border-[#B87463]/50'
                                }`}
                              >
                                <p className="font-serif text-lg font-medium leading-snug">
                                  {occasion.title}
                                </p>
                                <p className="mt-1 text-xs text-[#664954]">
                                  {occasion.subtitle}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Step 2: Collection, Date & Time Slot */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="booking-category"
                            className="block text-xs font-semibold tracking-[0.1em] uppercase text-[#B87463]"
                          >
                            02. Preferred Collection
                          </label>
                          <select
                            id="booking-category"
                            value={preferredCategory}
                            onChange={(e) =>
                              setPreferredCategory(e.target.value)
                            }
                            className="mt-2 w-full rounded-xl border border-[#B87463]/30 bg-[#FDF6F7] px-3.5 py-2.5 text-sm text-[#2E1620] focus:border-[#B87463] focus:outline-none"
                          >
                            <option value="Dresses">Dresses</option>
                            <option value="Skirts">Skirts</option>
                            <option value="Women's Suits">
                              Women&apos;s Suits
                            </option>
                            <option value="Shoes">Shoes</option>
                            <option value="Bags">Bags</option>
                            <option value="Complete Outfit">
                              Complete Outfit Styling
                            </option>
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="booking-date"
                            className="block text-xs font-semibold tracking-[0.1em] uppercase text-[#B87463]"
                          >
                            03. Preferred Date (Mon–Sat)
                          </label>
                          <input
                            id="booking-date"
                            type="date"
                            min={todayIso}
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            className="mt-2 w-full rounded-xl border border-[#B87463]/30 bg-[#FDF6F7] px-3.5 py-2.5 text-sm text-[#2E1620] tabular-nums focus:border-[#B87463] focus:outline-none"
                          />
                          {isSundaySelected && (
                            <p
                              role="alert"
                              className="mt-1.5 text-xs font-medium text-[#9D2E42]"
                            >
                              We are closed on Sundays. Please choose a Monday
                              to Saturday date.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Time Slots */}
                      <div>
                        <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[#B87463]">
                          04. Preferred Time Slot
                        </p>
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {BOOKING_TIME_SLOTS.map((slot) => {
                            const active = selectedTimeSlot === slot;
                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => setSelectedTimeSlot(slot)}
                                aria-pressed={active}
                                className={`rounded-xl border px-4 py-2 text-xs font-medium tabular-nums transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#B87463] whitespace-nowrap ${
                                  active
                                    ? 'border-[#2E1620] bg-[#2E1620] text-[#FDF6F7]'
                                    : 'border-[#B87463]/30 bg-[#FDF6F7] text-[#2E1620] hover:bg-[#F9E8EC]'
                                }`}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Step 5: Contact Info */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="booking-name"
                            className="block text-xs font-medium text-[#664954]"
                          >
                            Your Full Name
                          </label>
                          <input
                            id="booking-name"
                            type="text"
                            required
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            placeholder="e.g. Amara Okonkwo"
                            className="mt-1.5 w-full rounded-xl border border-[#B87463]/30 bg-[#FDF6F7] px-3.5 py-2.5 text-sm text-[#2E1620] placeholder:text-[#664954]/60 focus:border-[#B87463] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="booking-contact"
                            className="block text-xs font-medium text-[#664954]"
                          >
                            Phone Number or Email
                          </label>
                          <input
                            id="booking-contact"
                            type="text"
                            required
                            value={clientContact}
                            onChange={(e) => setClientContact(e.target.value)}
                            placeholder="e.g. 07700 900123"
                            className="mt-1.5 w-full rounded-xl border border-[#B87463]/30 bg-[#FDF6F7] px-3.5 py-2.5 text-sm text-[#2E1620] placeholder:text-[#664954]/60 focus:border-[#B87463] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="booking-notes"
                          className="block text-xs font-medium text-[#664954]"
                        >
                          Sizing, Colours or Piece Notes (Optional)
                        </label>
                        <input
                          id="booking-notes"
                          type="text"
                          value={enquiryNotes}
                          onChange={(e) => setEnquiryNotes(e.target.value)}
                          placeholder="e.g. UK size 14, looking for blush or champagne tones"
                          className="mt-1.5 w-full rounded-xl border border-[#B87463]/30 bg-[#FDF6F7] px-3.5 py-2.5 text-sm text-[#2E1620] placeholder:text-[#664954]/60 focus:border-[#B87463] focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSundaySelected}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2E1620] px-6 py-4 text-sm font-medium text-[#FDF6F7] transition-colors duration-150 hover:bg-[#3D1F2B] focus-visible:outline-2 focus-visible:outline-[#B87463] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <CalendarCheck className="h-4 w-4 text-[#E7B8A9]" aria-hidden="true" />
                        Reserve My Private Styling Slot
                      </button>
                    </form>
                  )}
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Visit Us, Opening Hours, Contact & Store Map */}
          <section id="visit" className="bg-[#FDF6F7] py-16 lg:py-24">
            <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
              <motion.div
                variants={textStaggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{once: true, amount: 0.2}}
                className="max-w-2xl"
              >
                <motion.p
                  variants={textStaggerItem}
                  className="text-xs font-medium tracking-[0.14em] uppercase text-[#B87463]"
                >
                  Visit the Boutique
                </motion.p>
                <motion.h2
                  variants={textStaggerItem}
                  className="mt-2 font-serif text-[clamp(1.95rem,3.2vw,2.85rem)] font-medium leading-tight text-[#2E1620] [text-wrap:balance]"
                >
                  Find PrettyAngel&apos;s in Vicarage Field, Barking
                </motion.h2>
              </motion.div>

              <motion.div
                variants={cardGridContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{once: true, amount: 0.08}}
                className="mt-10 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12"
              >
                {/* Left Column: Address, Opening Hours & Direct Contact */}
                <motion.div
                  variants={cardSlideUpItem}
                  className="flex flex-col justify-between gap-8 rounded-3xl border border-[#B87463]/25 bg-white p-7 sm:p-9 lg:col-span-5"
                >
                  <div className="space-y-6">
                    {/* Location */}
                    <div className="flex items-start gap-3.5">
                      <MapPin
                        className="mt-1 h-5 w-5 shrink-0 text-[#B87463]"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-xs font-medium tracking-[0.1em] uppercase text-[#B87463]">
                          Boutique Address
                        </p>
                        <p className="mt-1 font-serif text-xl font-medium text-[#2E1620]">
                          {BOUTIQUE_INFO.addressLine1}
                        </p>
                        <p className="text-sm text-[#664954]">
                          {BOUTIQUE_INFO.addressLine2}
                        </p>
                      </div>
                    </div>

                    {/* Opening Hours */}
                    <div className="flex items-start gap-3.5 border-t border-[#B87463]/15 pt-6">
                      <Clock
                        className="mt-1 h-5 w-5 shrink-0 text-[#B87463]"
                        aria-hidden="true"
                      />
                      <div className="w-full">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-medium tracking-[0.1em] uppercase text-[#B87463]">
                            Opening Hours
                          </p>
                          <span className="text-xs font-medium text-[#2E1620]">
                            {openStatus.label}
                          </span>
                        </div>
                        <dl className="mt-3 space-y-2 text-sm">
                          {BOUTIQUE_INFO.hours.map((row) => (
                            <div
                              key={row.day}
                              className="flex items-center justify-between gap-4"
                            >
                              <dt className="text-[#664954]">{row.day}</dt>
                              <dd className="font-medium tabular-nums text-[#2E1620]">
                                {row.time}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    </div>

                    {/* Getting Here */}
                    <div className="border-t border-[#B87463]/15 pt-6">
                      <p className="text-xs font-medium tracking-[0.1em] uppercase text-[#B87463]">
                        Getting Here
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-[#664954]">
                        Situated inside Vicarage Field Shopping Centre on Ripple
                        Road, a three-minute walk from Barking Station
                        (District, Hammersmith &amp; City, Overground, and c2c)
                        with multi-storey parking on site.
                      </p>
                    </div>
                  </div>

                  {/* Click-to-Call & WhatsApp */}
                  <div className="border-t border-[#B87463]/15 pt-6">
                    <p className="text-xs font-medium tracking-[0.1em] uppercase text-[#B87463]">
                      Direct Boutique Concierge
                    </p>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <a
                        href={BOUTIQUE_INFO.phoneHref}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2E1620] px-4 py-3 text-xs font-medium text-[#FDF6F7] transition-colors duration-150 hover:bg-[#3D1F2B] focus-visible:outline-2 focus-visible:outline-[#B87463] tabular-nums whitespace-nowrap"
                      >
                        <Phone className="h-4 w-4" aria-hidden="true" />
                        {BOUTIQUE_INFO.phoneDisplay}
                      </a>
                      <a
                        href={BOUTIQUE_INFO.whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-[#B87463]/45 bg-[#FDF6F7] px-4 py-3 text-xs font-medium text-[#2E1620] transition-colors duration-150 hover:bg-[#F9E8EC] focus-visible:outline-2 focus-visible:outline-[#B87463] whitespace-nowrap"
                      >
                        <MessageCircle
                          className="h-4 w-4 text-[#B87463]"
                          aria-hidden="true"
                        />
                        Message on WhatsApp
                      </a>
                    </div>
                    <a
                      href="#booking"
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#B87463]/35 bg-[#F9E8EC] px-4 py-3 text-xs font-semibold text-[#2E1620] transition-colors hover:bg-[#F2C9D4]"
                    >
                      <CalendarCheck
                        className="h-4 w-4 text-[#B87463]"
                        aria-hidden="true"
                      />
                      Reserve a Private Fitting Slot
                    </a>
                  </div>
                </motion.div>

                {/* Right Column: Interactive Store Location Map */}
                <motion.div
                  variants={cardSlideUpItem}
                  className="flex flex-col overflow-hidden rounded-3xl border border-[#B87463]/25 bg-white lg:col-span-7"
                >
                  <div className="min-h-[420px] flex-1">
                    <BoutiqueMap />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#B87463]/20 bg-[#F9E8EC] px-6 py-4 text-xs text-[#664954]">
                    <span>
                      3-minute walk from Barking Station · Vicarage Field
                      multi-storey parking available
                    </span>
                    <a
                      href={BOUTIQUE_INFO.directionsHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-medium text-[#2E1620] underline decoration-[#B87463] underline-offset-4 hover:text-[#B87463] whitespace-nowrap shrink-0"
                    >
                      <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
                      Open in Google Maps
                    </a>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </section>
        </main>

        {/* Luxury Footer */}
        <footer className="border-t border-[#E7B8A9]/20 bg-[#210F17] py-12 text-[#FDF6F7]">
          <motion.div
            variants={cardGridContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{once: true, amount: 0.15}}
            className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-6 md:grid-cols-3 lg:px-12"
          >
            <motion.div variants={textStaggerItem}>
              <p className="font-serif text-2xl font-medium">
                PrettyAngel&apos;s Boutique
              </p>
              <p className="mt-2 max-w-xs text-xs leading-relaxed text-[#FDF6F7]/75">
                Women&apos;s occasion wear, tailored suits, skirts, shoes, and
                evening bags in the heart of Barking for over 10 years.
              </p>
            </motion.div>

            <motion.div
              variants={textStaggerItem}
              className="text-xs leading-relaxed text-[#FDF6F7]/80"
            >
              <p className="font-medium tracking-[0.1em] uppercase text-[#E7B8A9]">
                Store &amp; Hours
              </p>
              <p className="mt-2">{BOUTIQUE_INFO.addressLine1}</p>
              <p>{BOUTIQUE_INFO.addressLine2}</p>
              <p className="mt-2 tabular-nums">
                Mon–Sat: 9:30am–6:00pm · Sun: Closed
              </p>
            </motion.div>

            <motion.div
              variants={textStaggerItem}
              className="text-xs leading-relaxed text-[#FDF6F7]/80"
            >
              <p className="font-medium tracking-[0.1em] uppercase text-[#E7B8A9]">
                Concierge
              </p>
              <div className="mt-2 flex flex-col gap-1.5">
                <a
                  href={BOUTIQUE_INFO.phoneHref}
                  className="tabular-nums hover:text-[#E7B8A9]"
                >
                  Tel: {BOUTIQUE_INFO.phoneDisplay}
                </a>
                <a
                  href={BOUTIQUE_INFO.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#E7B8A9]"
                >
                  WhatsApp Styling Enquiries
                </a>
                <a
                  href={BOUTIQUE_INFO.directionsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#E7B8A9]"
                >
                  Google Maps Directions
                </a>
              </div>
            </motion.div>
          </motion.div>

          <div className="mx-auto mt-10 flex max-w-[1440px] flex-wrap items-center justify-between gap-4 border-t border-[#FDF6F7]/10 px-6 pt-6 text-xs text-[#FDF6F7]/65 lg:px-12">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <p>
                &copy; {new Date().getFullYear()} PrettyAngel&apos;s Boutique.
                All rights reserved.
              </p>
              <span aria-hidden="true" className="text-[#FDF6F7]/30">
                ·
              </span>
              <p>
                Built &amp; designed by{' '}
                <a
                  href={BOUTIQUE_INFO.portfolioHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#E7B8A9] underline decoration-[#E7B8A9]/50 underline-offset-4 transition-colors hover:text-[#FDF6F7]"
                >
                  ebastech
                </a>
              </p>
            </div>
            <div className="flex items-center gap-6">
              <a href="#collections" className="hover:text-[#FDF6F7]">
                Collections
              </a>
              <a href="#booking" className="hover:text-[#FDF6F7]">
                Book Fitting
              </a>
              <a href="#visit" className="hover:text-[#FDF6F7]">
                Visit Us
              </a>
            </div>
          </div>
        </footer>

        {/* Smooth-Scrolling Back to Top Floating Action Button */}
        <AnimatePresence>
          {showBackToTop && (
            <motion.button
              type="button"
              onClick={scrollToTop}
              initial={{opacity: 0, y: 12, scale: 0.92}}
              animate={{opacity: 1, y: 0, scale: 1}}
              exit={{opacity: 0, y: 12, scale: 0.92}}
              transition={{duration: 0.22, ease: [0.16, 1, 0.3, 1]}}
              aria-label="Back to top"
              className="fixed right-5 bottom-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-[#E7B8A9]/70 bg-[#2E1620] text-[#FDF6F7] shadow-lg transition-colors duration-150 hover:bg-[#3D1F2B] focus-visible:outline-2 focus-visible:outline-[#E7B8A9]"
            >
              <ArrowUp className="h-4 w-4 text-[#E7B8A9]" aria-hidden="true" />
            </motion.button>
          )}
        </AnimatePresence>

        <CollectionDetailModal
          piece={selectedPiece}
          onClose={() => setSelectedPiece(null)}
          onBookFitting={handleBookFromPiece}
        />
      </div>
    </MotionConfig>
  );
}

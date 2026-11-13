import heroGownImg from '../assets/images/hero_boutique_gown_1794611207273.jpg';
import atelierSalonImg from '../assets/images/about_atelier_salon_1794611207398.jpg';
import eveningDressImg from '../assets/images/collection_dress_evening_1794611207764.jpg';
import cocktailDressImg from '../assets/images/collection_dress_cocktail_1794611208375.jpg';
import pleatedSkirtImg from '../assets/images/collection_skirt_pleated_1794611209029.jpg';
import tailoredSuitImg from '../assets/images/collection_suit_tailored_1794611209029.jpg';
import champagneShoesImg from '../assets/images/collection_shoes_heels_1794611209579.jpg';
import blushClutchImg from '../assets/images/collection_bag_clutch_1794611211031.jpg';

export type CollectionCategory =
  | 'All Collections'
  | 'Dresses'
  | 'Skirts'
  | "Women's Suits"
  | 'Shoes'
  | 'Bags';

export interface CollectionPiece {
  id: string;
  title: string;
  category: Exclude<CollectionCategory, 'All Collections'>;
  subcategory: string;
  price: string;
  sizes: string;
  fabric: string;
  occasion: string;
  description: string;
  stylingNote: string;
  image: string;
  alt: string;
}

export interface HeroSlide {
  id: string;
  image: string;
  alt: string;
  captionTitle: string;
  captionSubtitle: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  clientName: string;
  occasion: string;
  location: string;
}

export const ATELIER_SALON_IMAGE = atelierSalonImg;

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-salon-gown',
    image: heroGownImg,
    alt: "Woman in an elegant blush-pink pleated silk chiffon evening gown with gold embroidery inside PrettyAngel's Boutique",
    captionTitle: 'The Blush Silk Chiffon Edit',
    captionSubtitle: 'Hand-finished evening silhouettes in Barking',
  },
  {
    id: 'slide-evening-drape',
    image: eveningDressImg,
    alt: 'Floor-length blush-pink pleated silk chiffon evening gown with champagne-gold embroidered waist sash',
    captionTitle: 'Céleste Pleated Gown',
    captionSubtitle: 'Sculpted metallic waist detail · UK 8–20',
  },
  {
    id: 'slide-atelier-suite',
    image: atelierSalonImg,
    alt: "Inside PrettyAngel's Boutique showing curated blush, ivory, and champagne occasion gowns on brushed brass rails",
    captionTitle: 'Unit 23/24 Styling Salon',
    captionSubtitle: 'Over 10 years at Vicarage Field Shopping Centre',
  },
];

export const BOUTIQUE_INFO = {
  name: "PrettyAngel's Boutique",
  shortName: "PrettyAngel's",
  addressLine1: 'Unit 23/24, Vicarage Field Shopping Centre',
  addressLine2: 'Barking IG11 8DH, United Kingdom',
  fullAddress: 'Unit 23/24, Vicarage Field Shopping Centre, Barking IG11 8DH',
  phoneDisplay: '+44 20 8591 9797',
  phoneHref: 'tel:+442085919797',
  whatsappHref:
    "https://wa.me/442085919797?text=Hello%20PrettyAngel's%20Boutique%2C%20I%20would%20love%20to%20enquire%20about%20your%20occasion-wear%20collection.",
  directionsHref:
    'https://www.google.com/maps/search/?api=1&query=Vicarage+Field+Shopping+Centre,+Barking+IG11+8DH',
  portfolioHref: 'https://portfolio-five-omega-27.vercel.app',
  hours: [
    {day: 'Monday – Saturday', time: '9:30am – 6:00pm'},
    {day: 'Sunday', time: 'Closed'},
  ],
};

export function getBoutiqueOpenStatus(): {isOpen: boolean; label: string} {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const weekday = parts.find((p) => p.type === 'weekday')?.value ?? '';
    const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
    const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
    const totalMinutes = hour * 60 + minute;

    if (weekday === 'Sun') {
      return {isOpen: false, label: 'Closed on Sundays · Opens Monday 9:30am'};
    }

    const openMinutes = 9 * 60 + 30;
    const closeMinutes = 18 * 60;

    if (totalMinutes >= openMinutes && totalMinutes < closeMinutes) {
      return {isOpen: true, label: 'Open today until 6:00pm'};
    }

    if (totalMinutes < openMinutes) {
      return {isOpen: false, label: 'Opens today at 9:30am'};
    }

    return {
      isOpen: false,
      label:
        weekday === 'Sat'
          ? 'Closed now · Opens Monday 9:30am'
          : 'Closed now · Opens tomorrow 9:30am',
    };
  } catch {
    return {isOpen: true, label: 'Mon–Sat 9:30am–6:00pm'};
  }
}

export const CATEGORIES: CollectionCategory[] = [
  'All Collections',
  'Dresses',
  'Skirts',
  "Women's Suits",
  'Shoes',
  'Bags',
];

export const COLLECTIONS: CollectionPiece[] = [
  {
    id: 'celeste-blush-gown',
    title: 'Céleste Pleated Chiffon Gown',
    category: 'Dresses',
    subcategory: 'Evening & Black Tie',
    price: '£265',
    sizes: 'UK 8 – UK 20',
    fabric: 'Silk-blend chiffon with metallic champagne waist embroidery',
    occasion: 'Mother of the Bride, Wedding Guest & Black Tie Galas',
    description:
      'Floor-sweeping rose chiffon finely knife-pleated for weightless movement, cinched with a hand-beaded champagne-gold embroidery belt.',
    stylingNote:
      'Pair with our Aura Champagne Ankle-Strap Heels and Seraphina Clutch for seamless ceremony-to-evening poise.',
    image: eveningDressImg,
    alt: 'Blush-pink pleated silk chiffon evening gown with champagne-gold embroidered waist detail',
  },
  {
    id: 'clara-jacquard-midi',
    title: 'Clara Champagne Jacquard Midi',
    category: 'Dresses',
    subcategory: 'Cocktail & Ceremonial',
    price: '£215',
    sizes: 'UK 8 – UK 18',
    fabric: 'Woven gold botanical jacquard bodice & ivory duchesse satin skirt',
    occasion: 'Daytime Weddings, Ascot & Milestone Celebrations',
    description:
      'A sculpted corseted bodice woven in luminous gold botanical jacquard meeting a crisp A-line ivory satin midi skirt with concealed pockets.',
    stylingNote:
      'Tailored to frame the collarbone and cinch the waist cleanly for garden ceremonies and sunlit receptions.',
    image: cocktailDressImg,
    alt: 'Champagne-gold jacquard bodice and ivory satin A-line midi occasion dress',
  },
  {
    id: 'margaux-pleated-skirt',
    title: 'Margaux Rose-Satin Midi Skirt',
    category: 'Skirts',
    subcategory: 'Separates & Occasion',
    price: '£135',
    sizes: 'UK 8 – UK 18',
    fabric: 'Lustrous rose-blush satin with breathable silk-chiffon lining',
    occasion: 'Engagement Dinners, Christenings & Evening Receptions',
    description:
      'Sunburst-pleated midi skirt cut in liquid rose satin that catches candlelight with every stride. Shown with an ivory silk blouse and gold chain belt.',
    stylingNote:
      'Style with crisp ivory silk for daytime elegance or swap to a metallic camisole for evening champagne toasts.',
    image: pleatedSkirtImg,
    alt: 'Flowing rose-blush pleated satin midi skirt styled with ivory silk blouse and gold chain belt',
  },
  {
    id: 'eleanor-tailored-suit',
    title: 'Eleanor Blush Tailored Trouser Suit',
    category: "Women's Suits",
    subcategory: 'Architectural Tailoring',
    price: '£285',
    sizes: 'UK 8 – UK 20',
    fabric: 'Structured Italian crepe with silk-satin peak lapels & brass buttons',
    occasion: 'Registry Weddings, Mother of the Groom & Formal Luncheons',
    description:
      'Precision-cut two-piece occasion suit in soft dusty rose, elevated with satin-faced peak lapels, brushed gold buttons, and fluid wide-leg trousers.',
    stylingNote:
      'Complimentary in-store pinning and local trouser hemming advice available during your Vicarage Field fitting.',
    image: tailoredSuitImg,
    alt: "Tailored dusty-blush women's two-piece occasion blazer and wide-leg trouser suit with gold buttons",
  },
  {
    id: 'aura-champagne-heels',
    title: 'Aura Champagne Ankle-Strap Heels',
    category: 'Shoes',
    subcategory: 'Occasion Footwear',
    price: '£115',
    sizes: 'UK 3 – UK 8 (Half sizes in store)',
    fabric: 'Champagne-gold duchesse satin with cushioned blush leather footbed',
    occasion: 'All-Day Wedding Wear & Evening Receptions',
    description:
      'Architectural pointed-toe court silhouette crafted in warm champagne satin with a balanced 75mm heel and slender gold-buckled ankle strap.',
    stylingNote:
      'Memory-foam leather insoles are chosen specifically for effortless comfort from morning photographs to the final dance.',
    image: champagneShoesImg,
    alt: 'Champagne-gold satin and blush leather pointed-toe heeled occasion shoes on travertine plinth',
  },
  {
    id: 'seraphina-blush-clutch',
    title: 'Seraphina Satin & Gold Frame Clutch',
    category: 'Bags',
    subcategory: 'Evening Handbags',
    price: '£95',
    sizes: '22cm × 13cm · Detachable 115cm gold chain',
    fabric: 'Blush-pink satin and supple calfskin trim with brushed brass clasp',
    occasion: 'Weddings, Formal Dinners & Cocktail Evenings',
    description:
      'Structured evening envelope clutch finished in pearlescent blush satin with crisp tonal piping, bespoke brushed-gold clasp, and hideaway chain.',
    stylingNote:
      'Thoughtfully proportioned to hold your smartphone, compact mirror, and evening lipstick while preserving a sleek silhouette.',
    image: blushClutchImg,
    alt: 'Structured blush-pink satin evening clutch bag with brushed gold clasp and fine chain strap',
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'amara-okonkwo',
    quote:
      "I arrived three weeks before my daughter's wedding feeling overwhelmed after visiting four larger stores. Within forty minutes at PrettyAngel's, they paired a blush chiffon gown with champagne heels and a clutch that felt made for me.",
    clientName: 'Amara Okonkwo',
    occasion: 'Mother of the Bride',
    location: 'Barking, East London',
  },
  {
    id: 'claire-whitaker',
    quote:
      "I have visited PrettyAngel's in Vicarage Field for nearly eight years whenever our family marks a milestone celebration. Their eye for tailoring—especially their women's suits—is unmatched anywhere locally.",
    clientName: 'Claire Whitaker',
    occasion: 'Returning Boutique Client',
    location: 'Upminster, Essex',
  },
  {
    id: 'nadia-hussein',
    quote:
      'I wanted an understated yet celebratory look for a Town Hall ceremony and dinner. Their stylist matched a blush tailored suit with delicate gold accessories and arranged the trouser hem in time for the weekend.',
    clientName: 'Nadia Hussein',
    occasion: 'Civil Ceremony & Reception',
    location: 'Ilford, Redbridge',
  },
];

export interface BookingOccasionOption {
  id: string;
  title: string;
  subtitle: string;
  defaultCategory: string;
}

export const BOOKING_OCCASIONS: BookingOccasionOption[] = [
  {
    id: 'mother-of-bride',
    title: 'Mother of the Bride / Groom',
    subtitle: 'Full gown or skirt set with heel & clutch pairing',
    defaultCategory: 'Dresses',
  },
  {
    id: 'wedding-guest',
    title: 'Wedding Guest & Gala',
    subtitle: 'Statement evening dresses & cocktail silhouettes',
    defaultCategory: 'Dresses',
  },
  {
    id: 'tailored-suit',
    title: "Tailored Women's Suit",
    subtitle: 'Structured blush & cream two-piece fitting',
    defaultCategory: "Women's Suits",
  },
  {
    id: 'shoes-bags',
    title: 'Shoes & Evening Bag Styling',
    subtitle: 'Bring your outfit to match satin heels & clutches',
    defaultCategory: 'Shoes',
  },
];

export const BOOKING_TIME_SLOTS = [
  '10:00am',
  '11:30am',
  '1:30pm',
  '3:00pm',
  '4:30pm',
] as const;


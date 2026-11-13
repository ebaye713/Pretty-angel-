import {useEffect, useState} from 'react';
import {
  AdvancedMarker,
  APIProvider,
  APILoadingStatus,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import {ExternalLink, MapPin, Navigation} from 'lucide-react';
import {BOUTIQUE_INFO} from '../data/boutiqueData';

interface ResolvedPlace {
  location: {lat: number; lng: number};
  displayName: string;
  formattedAddress: string;
}

function isQuotaError(err: unknown): boolean {
  const text = String(err ?? '');
  return (
    text.includes('RESOURCE_EXHAUSTED') ||
    text.includes('OVER_QUERY_LIMIT') ||
    text.includes('Quota') ||
    text.includes('429')
  );
}

function StoreMapCanvas() {
  const placesLib = useMapsLibrary('places');
  const loadingStatus = useApiLoadingStatus();
  const [resolvedPlace, setResolvedPlace] = useState<ResolvedPlace | null>(null);
  const [lookupState, setLookupState] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );
  const [infoOpen, setInfoOpen] = useState(true);
  const [markerRef, marker] = useAdvancedMarkerRef();

  useEffect(() => {
    if (
      loadingStatus === APILoadingStatus.FAILED ||
      loadingStatus === APILoadingStatus.AUTH_FAILURE
    ) {
      setLookupState('error');
      window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    }
  }, [loadingStatus]);

  useEffect(() => {
    if (!placesLib) return;
    let cancelled = false;

    async function resolveBoutiquePlace() {
      try {
        setLookupState('loading');
        const queries = [
          "PrettyAngel's Boutique, Vicarage Field Shopping Centre, Barking IG11 8DH",
          'Vicarage Field Shopping Centre, Barking IG11 8DH, UK',
        ];

        for (const textQuery of queries) {
          const response = await placesLib!.Place.searchByText({
            textQuery,
            fields: ['displayName', 'location', 'formattedAddress'],
            region: 'gb',
            language: 'en-GB',
            maxResultCount: 1,
          });

          const place = response?.places?.[0];
          if (place?.location) {
            if (!cancelled) {
              setResolvedPlace({
                location: {
                  lat: place.location.lat(),
                  lng: place.location.lng(),
                },
                displayName:
                  place.displayName || "PrettyAngel's Boutique",
                formattedAddress:
                  place.formattedAddress || BOUTIQUE_INFO.fullAddress,
              });
              setLookupState('ready');
            }
            return;
          }
        }

        if (!cancelled) {
          setLookupState('error');
        }
      } catch (err) {
        if (isQuotaError(err)) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        if (!cancelled) {
          setLookupState('error');
        }
      }
    }

    void resolveBoutiquePlace();

    return () => {
      cancelled = true;
    };
  }, [placesLib]);

  if (lookupState === 'error') {
    return <MapFallbackCard reason="interactive-unavailable" />;
  }

  if (lookupState === 'loading' || !resolvedPlace) {
    return (
      <div className="flex h-full min-h-[420px] w-full flex-col items-center justify-center bg-[#F9E8EC] p-8 text-center">
        <MapPin className="mb-3 h-7 w-7 text-[#B87463]" aria-hidden="true" />
        <p className="font-serif text-xl text-[#2E1620]">
          Locating Vicarage Field Shopping Centre
        </p>
        <p className="mt-1 text-sm text-[#664954]">
          Unit 23/24 · Barking IG11 8DH
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[420px] w-full">
      <GoogleMap
        defaultCenter={resolvedPlace.location}
        defaultZoom={16}
        mapId="DEMO_MAP_ID"
        gestureHandling="cooperative"
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={true}
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        style={{width: '100%', height: '100%', minHeight: '420px'}}
      >
        <AdvancedMarker
          ref={markerRef}
          position={resolvedPlace.location}
          onClick={() => setInfoOpen(true)}
          title="PrettyAngel's Boutique — Unit 23/24, Vicarage Field Shopping Centre"
        >
          <Pin
            background="#B87463"
            borderColor="#2E1620"
            glyphColor="#FDF6F7"
            scale={1.15}
          />
        </AdvancedMarker>

        {infoOpen && marker && (
          <InfoWindow
            anchor={marker}
            maxWidth={260}
            onCloseClick={() => setInfoOpen(false)}
          >
            <div className="p-1 font-sans text-[#2E1620]">
              <p className="font-serif text-base font-semibold leading-tight text-[#2E1620]">
                PrettyAngel&apos;s Boutique
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#664954]">
                Unit 23/24, Vicarage Field Shopping Centre
                <br />
                Barking IG11 8DH
              </p>
              <p className="mt-1.5 text-xs font-medium text-[#B87463]">
                Mon–Sat: 9:30am – 6:00pm
              </p>
              <a
                href={BOUTIQUE_INFO.directionsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#2E1620] underline decoration-[#B87463] underline-offset-2 hover:text-[#B87463]"
              >
                Open Directions
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

function MapFallbackCard({
  reason,
}: {
  reason: 'missing-key' | 'interactive-unavailable';
}) {
  return (
    <div className="flex h-full min-h-[420px] w-full flex-col justify-between bg-gradient-to-br from-[#F9E3E8] via-[#FDF6F7] to-[#F3DBD4] p-8">
      <div>
        <p className="text-xs font-medium tracking-[0.14em] uppercase text-[#B87463]">
          Vicarage Field · Barking IG11 8DH
        </p>
        <h3 className="mt-2 font-serif text-2xl font-medium text-[#2E1620]">
          Unit 23/24, Vicarage Field Shopping Centre
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-[#664954]">
          Located in the heart of Barking town centre on Ripple Road, just a
          three-minute walk from Barking Underground &amp; Overground Station
          with multi-storey shopping centre parking directly above.
        </p>
        {reason === 'interactive-unavailable' && (
          <p className="mt-3 text-xs text-[#664954]">
            Interactive map preview is temporarily unavailable; use the direct
            Google Maps link below for live turn-by-turn navigation.
          </p>
        )}
      </div>

      <div className="mt-8 border-t border-[#B87463]/25 pt-6">
        <div className="flex flex-wrap items-center gap-4">
          <a
            href={BOUTIQUE_INFO.directionsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#2E1620] px-5 py-2.5 text-sm font-medium text-[#FDF6F7] transition-colors hover:bg-[#3D1F2B] whitespace-nowrap shrink-0"
          >
            <Navigation className="h-4 w-4" aria-hidden="true" />
            Get Directions in Google Maps
          </a>
          <span className="text-xs text-[#664954]">
            3 min walk from Barking Station (District, Hammersmith &amp; City,
            c2c)
          </span>
        </div>
      </div>
    </div>
  );
}

export function BoutiqueMap() {
  const globalApiKey = (
    globalThis as unknown as {GOOGLE_MAPS_API_KEY?: string}
  ).GOOGLE_MAPS_API_KEY;
  const apiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || globalApiKey || '';

  if (!apiKey) {
    return <MapFallbackCard reason="missing-key" />;
  }

  return (
    <APIProvider
      apiKey={apiKey}
      libraries={['places', 'marker']}
      language="en"
      region="GB"
    >
      <StoreMapCanvas />
    </APIProvider>
  );
}

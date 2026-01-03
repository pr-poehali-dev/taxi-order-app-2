import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/icon';

interface MapPoint {
  lng: number;
  lat: number;
  type: 'pickup' | 'dropoff';
}

interface ProvinceMapProps {
  onPickupSet?: (point: MapPoint) => void;
  onDropoffSet?: (point: MapPoint) => void;
  pickupPoint?: MapPoint | null;
  dropoffPoint?: MapPoint | null;
  isPlacingPickup?: boolean;
  isPlacingDropoff?: boolean;
}

declare global {
  interface Window {
    OPM: any;
  }
}

const ProvinceMap = ({
  onPickupSet,
  onDropoffSet,
  pickupPoint,
  dropoffPoint,
  isPlacingPickup,
  isPlacingDropoff,
}: ProvinceMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const pickupMarkerRef = useRef<any>(null);
  const dropoffMarkerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMapScripts = async () => {
      try {
        const existingEngine = document.querySelector('script[src*="opm.engine.js"]');
        if (existingEngine) return;

        const engineScript = document.createElement('script');
        engineScript.src = 'https://fantastic-game.ru/openprovincemap/js/v4/opm.engine.js';
        engineScript.async = true;
        document.head.appendChild(engineScript);

        await new Promise((resolve, reject) => {
          engineScript.onload = resolve;
          engineScript.onerror = reject;
        });

        const mapScript = document.createElement('script');
        mapScript.src = 'https://fantastic-game.ru/openprovincemap/js/v4/opm.map.js?v=1.2.1';
        mapScript.async = true;
        document.head.appendChild(mapScript);

        await new Promise((resolve, reject) => {
          mapScript.onload = resolve;
          mapScript.onerror = reject;
        });

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fantastic-game.ru/openprovincemap/css/map.css';
        document.head.appendChild(link);

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load map scripts:', err);
        setError('Не удалось загрузить карту');
        setIsLoading(false);
      }
    };

    loadMapScripts();
  }, []);

  useEffect(() => {
    if (isLoading || error || !mapContainerRef.current || !window.OPM) return;

    const initMap = () => {
      try {
        if (mapRef.current) {
          mapRef.current.remove();
        }

        const map = new window.OPM.Map({
          container: mapContainerRef.current,
          center: [34.776, 32.064],
          zoom: 12,
          style: 'https://fantastic-game.ru/openprovincemap/js/vector/opm-dark.json',
        });

        map.on('load', () => {
          console.log('Map loaded successfully');
        });

        map.on('click', (e: any) => {
          const { lng, lat } = e.lngLat;

          if (isPlacingPickup && onPickupSet) {
            onPickupSet({ lng, lat, type: 'pickup' });
          } else if (isPlacingDropoff && onDropoffSet) {
            onDropoffSet({ lng, lat, type: 'dropoff' });
          }
        });

        mapRef.current = map;
      } catch (err) {
        console.error('Failed to initialize map:', err);
        setError('Ошибка инициализации карты');
      }
    };

    const timeout = setTimeout(initMap, 500);
    return () => clearTimeout(timeout);
  }, [isLoading, error, isPlacingPickup, isPlacingDropoff]);

  useEffect(() => {
    if (!mapRef.current || !window.OPM) return;

    if (pickupMarkerRef.current) {
      pickupMarkerRef.current.remove();
      pickupMarkerRef.current = null;
    }

    if (pickupPoint) {
      const el = document.createElement('div');
      el.className = 'custom-marker pickup-marker';
      el.innerHTML = `
        <div style="
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)) 80%);
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 2s infinite;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `;

      pickupMarkerRef.current = new window.OPM.Marker({ element: el })
        .setLngLat([pickupPoint.lng, pickupPoint.lat])
        .addTo(mapRef.current);
    }
  }, [pickupPoint]);

  useEffect(() => {
    if (!mapRef.current || !window.OPM) return;

    if (dropoffMarkerRef.current) {
      dropoffMarkerRef.current.remove();
      dropoffMarkerRef.current = null;
    }

    if (dropoffPoint) {
      const el = document.createElement('div');
      el.className = 'custom-marker dropoff-marker';
      el.innerHTML = `
        <div style="
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--secondary)) 80%);
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 2s infinite;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
            <line x1="4" y1="22" x2="4" y2="15"></line>
          </svg>
        </div>
      `;

      dropoffMarkerRef.current = new window.OPM.Marker({ element: el })
        .setLngLat([dropoffPoint.lng, dropoffPoint.lat])
        .addTo(mapRef.current);
    }
  }, [dropoffPoint]);

  if (error) {
    return (
      <div className="w-full aspect-square rounded-2xl bg-muted/50 flex items-center justify-center border-2 border-border">
        <div className="text-center p-6">
          <Icon name="AlertCircle" size={48} className="text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-border shadow-lg">
      {isLoading && (
        <div className="absolute inset-0 bg-muted/50 backdrop-blur flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Загрузка карты Province...</p>
          </div>
        </div>
      )}
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        style={{
          cursor: isPlacingPickup || isPlacingDropoff ? 'crosshair' : 'grab',
        }}
      />
      {(isPlacingPickup || isPlacingDropoff) && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-3 bg-card/95 backdrop-blur rounded-2xl shadow-xl border border-border z-40 animate-fade-in">
          <p className="text-sm font-semibold flex items-center gap-2">
            <Icon
              name={isPlacingPickup ? 'MapPin' : 'Flag'}
              size={16}
              className={isPlacingPickup ? 'text-primary' : 'text-secondary'}
            />
            {isPlacingPickup ? 'Укажите точку подачи на карте' : 'Укажите точку назначения на карте'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProvinceMap;

"use client";

import { useState } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import { mapLocations } from '@/lib/data';
import type { MapLocation } from '@/lib/types';
import { Button } from './ui/button';
import Link from 'next/link';

export function MapView() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const position = { lat: 34.0522, lng: -118.2437 };
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full bg-muted rounded-lg">
        <p className="text-center text-muted-foreground p-8">
          Google Maps API key is not configured.
          <br />
          Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file.
        </p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div style={{ height: '100%', width: '100%' }}>
        <Map
          defaultCenter={position}
          defaultZoom={13}
          mapId="culinary_hub_map"
          gestureHandling={'greedy'}
          disableDefaultUI={true}
        >
          {mapLocations.map((location) => (
            <AdvancedMarker
              key={location.id}
              position={location.position}
              onClick={() => setSelectedLocation(location)}
            >
              <Pin
                background={'hsl(var(--primary))'}
                borderColor={'hsl(var(--primary-foreground))'}
                glyphColor={'hsl(var(--primary-foreground))'}
              />
            </AdvancedMarker>
          ))}
          {selectedLocation && (
            <InfoWindow
              position={selectedLocation.position}
              onCloseClick={() => setSelectedLocation(null)}
            >
              <div className="p-2 max-w-xs">
                <h3 className="font-bold text-lg font-headline text-primary">{selectedLocation.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Serving: {selectedLocation.recipeTitle}
                </p>
                <Button asChild size="sm" className="mt-4 w-full">
                  <Link href={`/recipes/${selectedLocation.recipeId}`}>
                    View Recipe
                  </Link>
                </Button>
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>
    </APIProvider>
  );
}

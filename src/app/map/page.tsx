import { MapView } from '@/components/map-view';

export default function MapPage() {
  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-10rem)] flex flex-col">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline">Public Food Map</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Discover dishes from our community available near you.
        </p>
      </div>
      <div className="flex-grow rounded-lg overflow-hidden shadow-lg">
        <MapView />
      </div>
    </div>
  );
}

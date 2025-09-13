import { MapView } from '@/components/map-view';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Code } from 'lucide-react';

const dataStructure = `
[
  {
    "id": "loc1",
    "name": "Tony's Pasta Place",
    "recipeId": "1",
    "recipeTitle": "Spicy Tomato Pasta",
    "position": {
      "lat": 34.0522,
      "lng": -118.2437
    }
  },
  ...
]`;

export default function MapPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline">Public Food Map</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Discover dishes from our community available near you.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="h-[60vh] md:h-[calc(100vh-16rem)] rounded-lg overflow-hidden shadow-lg">
          <MapView />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Code className="mr-2" />
              Data Structure
            </CardTitle>
            <CardDescription>
              The map markers are generated from a simple array of location objects.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
              <code>{dataStructure.trim()}</code>
            </pre>
            <p className="text-sm text-muted-foreground mt-4">
              Each location object contains the coordinates, a name for the marker, and a link to the corresponding recipe. This data is currently mocked in <code className='bg-muted p-1 rounded-sm text-xs'>src/lib/data.ts</code> but could easily be fetched from a database.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

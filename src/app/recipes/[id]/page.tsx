import { recipes } from '@/lib/data';
import type { Recipe } from '@/lib/types';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Clock,
  Users,
  ChefHat,
  Vegan,
  WheatOff,
  Zap,
  DollarSign,
} from 'lucide-react';
import React from 'react';
import RecipePrintButton from '@/components/recipe-print-button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function getRecipe(id: string): Recipe | undefined {
  return recipes.find((recipe) => recipe.id === id);
}

const tagIcons: { [key in Recipe['tags'][number]]: React.ReactNode } = {
  Quick: <Zap className="h-4 w-4 mr-2" />,
  Vegan: <Vegan className="h-4 w-4 mr-2" />,
  'Gluten-Free': <WheatOff className="h-4 w-4 mr-2" />,
};

const dummyOrders = [
    { id: 'ORD001', user: 'Bob Johnson', timestamp: '2024-05-20 10:30 AM' },
    { id: 'ORD002', user: 'Charlie Brown', timestamp: '2024-05-20 11:15 AM' },
    { id: 'ORD003', user: 'Diana Prince', timestamp: '2024-05-21 09:00 AM' },
];

export default function RecipePage({ params }: { params: { id: string } }) {
  const recipe = getRecipe(params.id);

  if (!recipe) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 print-container">
      <header className="mb-8 no-print">
        <h1 className="text-4xl font-bold font-headline mb-2">{recipe.title}</h1>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-muted-foreground">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={recipe.authorImage} alt={recipe.author} />
              <AvatarFallback>{recipe.author.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>By {recipe.author}</span>
          </div>
          <div className="flex items-center text-2xl font-bold text-primary">
            <DollarSign className="h-6 w-6 mr-1" />
            <span>{recipe.price.toFixed(2)}</span>
          </div>
        </div>
      </header>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-lg">
            <Image
              src={recipe.imageUrl}
              alt={recipe.title}
              data-ai-hint={recipe.imageHint}
              fill
              className="object-cover"
            />
          </div>

          <p className="text-lg">{recipe.description}</p>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Ingredients</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside grid sm:grid-cols-2 gap-x-8 gap-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="text-base">
                    <span className="font-semibold">{ingredient.quantity}</span> {ingredient.item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-outside pl-5 space-y-4">
                {recipe.instructions.map((step, index) => (
                  <li key={index} className="text-base leading-relaxed">
                    {step}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card className="no-print">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Order History</CardTitle>
              <p className="text-sm text-muted-foreground">Recent orders for this recipe.</p>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Timestamp</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dummyOrders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.id}</TableCell>
                                <TableCell>{order.user}</TableCell>
                                <TableCell>{order.timestamp}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>

        </div>

        <aside className="space-y-8 md:col-span-1">
          <RecipePrintButton />

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-around text-center">
                <div>
                  <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">{recipe.prepTime} min</p>
                  <p className="text-sm text-muted-foreground">Prep</p>
                </div>
                <div>
                  <ChefHat className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">{recipe.cookTime} min</p>
                  <p className="text-sm text-muted-foreground">Cook</p>
                </div>
                <div>
                  <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">{recipe.servings}</p>
                  <p className="text-sm text-muted-foreground">Servings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle className="font-headline">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recipe.tags.map(tag => (
                <div key={tag} className="flex items-center">
                  {tagIcons[tag]}
                  <span className='font-medium'>{tag}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Nutrition Facts</CardTitle>
              <p className="text-sm text-muted-foreground">per serving</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Calories</span>
                <span className="font-semibold">{recipe.nutrition.calories}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span>Fat</span>
                <span>{recipe.nutrition.fat}g</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span>Carbs</span>
                <span>{recipe.nutrition.carbs}g</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span>Protein</span>
                <span>{recipe.nutrition.protein}g</span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
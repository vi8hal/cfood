import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Utensils, BookOpen, Star } from "lucide-react";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import { redirect } from "next/navigation";
import { Recipe } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

async function getUserStats(userId: string) {
    const recipeCountResult = await pool.query('SELECT COUNT(*) FROM "Recipe" WHERE "authorId" = $1', [userId]);
    const recipes = parseInt(recipeCountResult.rows[0].count, 10) || 0;

    return {
        recipes,
        orders: 12, // Mocked
        favorites: 23, // Mocked
    }
}

async function getLatestRecipes(userId: string): Promise<Pick<Recipe, 'id' | 'title'>[]> {
    const result = await pool.query(
        `SELECT id, title FROM "Recipe" WHERE "authorId" = $1 ORDER BY createdat DESC LIMIT 5`,
        [userId]
    );
    return result.rows;
}


export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user) {
    redirect('/login');
  }

  const userStats = await getUserStats(session.user.id);
  const latestRecipes = await getLatestRecipes(session.user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline">Welcome, {session.user.name}!</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Here's a quick look at your Culinary Hub activity.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Recipes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.recipes}</div>
            <p className="text-xs text-muted-foreground">
              Recipes you have shared
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Orders</CardTitle>
             <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-4">
              <div className="text-2xl font-bold">{userStats.orders}</div>
              <Badge variant="outline">Coming Soon</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Meals you have ordered
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Favorites</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-4">
              <div className="text-2xl font-bold">{userStats.favorites}</div>
              <Badge variant="outline">Coming Soon</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Recipes you have saved
            </p>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>My Latest Recipes</CardTitle>
            <CardDescription>A list of recipes you have recently shared.</CardDescription>
          </CardHeader>
          <CardContent>
            {latestRecipes.length > 0 ? (
                <ul className="space-y-2">
                    {latestRecipes.map(recipe => (
                        <li key={recipe.id} className="text-muted-foreground hover:text-primary transition-colors">
                          <a href={`/recipes/${recipe.id}`}>{recipe.title}</a>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-muted-foreground">You haven't shared any recipes yet.</p>
            )}
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>My Recent Orders</CardTitle>
            <CardDescription>A list of meals you have recently ordered.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Order history will be implemented here. Stay tuned!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Utensils, BookOpen, Star } from "lucide-react";

export default function DashboardPage() {
  // This will be replaced with real user data after authentication is built
  const userName = "Mock User";
  const userStats = {
    recipes: 5,
    orders: 12,
    favorites: 23,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline">Welcome, {userName}!</h1>
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
            <div className="text-2xl font-bold">{userStats.orders}</div>
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
            <div className="text-2xl font-bold">{userStats.favorites}</div>
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
            <p className="text-muted-foreground">Recipe list will be implemented here.</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>My Recent Orders</CardTitle>
            <CardDescription>A list of meals you have recently ordered.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Order history will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { User } from '@/lib/types';
import { pool } from '@/lib/db';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';

async function getUserProfile(userId: string): Promise<User | null> {
  const result = await pool.query('SELECT * FROM "User" WHERE id = $1', [userId]);
  if (result.rows.length === 0) {
    return null;
  }
  const dbUser = result.rows[0];

  return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      image: dbUser.image,
      location: dbUser.location,
      emailVerified: dbUser.emailVerified,
      createdAt: dbUser.createdat,
      updatedAt: dbUser.updatedat,
  };
}

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.user) {
    redirect('/login');
  }

  const user = await getUserProfile(session.user.id);

  if (!user) {
    // This case should be rare if a session exists, but it's good practice
    // to handle it. It might mean the user was deleted from the DB
    // while their session was still active.
    redirect('/login'); 
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary">
            <AvatarImage src={user.image || `https://i.pravatar.cc/150?u=${user.email}`} alt={user.name || ''} />
            <AvatarFallback className="text-4xl">{(user.name || 'U').charAt(0)}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-headline">{user.name}</CardTitle>
          <p className="text-muted-foreground">{user.email}</p>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
            <div className="flex items-center text-muted-foreground">
                <Mail className="h-5 w-5 mr-3" />
                <span>{user.email} {user.emailVerified ? `(Verified)`: '(Not Verified)'}</span>
            </div>
             {user.location && (
                <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-5 w-5 mr-3" />
                    <span>{user.location}</span>
                </div>
            )}
             <div className="flex items-center text-muted-foreground">
                <Calendar className="h-5 w-5 mr-3" />
                <span>Joined on {format(new Date(user.createdAt), "MMMM d, yyyy")}</span>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

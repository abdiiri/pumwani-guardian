import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const STUDENT_EMAIL_DOMAIN = 'students.pumwani.local';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const id = identifier.trim();
    if (!id || !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }
    // If no @, treat as student username and append synthetic domain
    const emailToUse = id.includes('@') ? id : `${id.toLowerCase()}@${STUDENT_EMAIL_DOMAIN}`;
    setLoading(true);
    const result = await login(emailToUse, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Invalid credentials.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Pumwani Boys School
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-body">
              Record Management System
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="identifier"
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                className="h-10"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-10"
                autoComplete="current-password"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t">
            <p className="text-xs text-muted-foreground">
              Students sign in with their username. Admins sign in with email.
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-[480px] bg-primary items-center justify-center">
        <div className="text-center px-12">
          <h2 className="font-heading text-2xl font-bold text-primary-foreground">
            School Records,
            <br />
            Simplified.
          </h2>
          <p className="text-sm text-primary-foreground/70 mt-4 font-body leading-relaxed">
            Manage student records, attendance, and fee payments in one secure, efficient system.
          </p>
        </div>
      </div>
    </div>
  );
}

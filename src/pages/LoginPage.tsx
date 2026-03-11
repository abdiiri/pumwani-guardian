import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    const success = login(email.trim(), password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left: Form */}
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
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@pumwani.ac.ke"
                className="h-10"
                autoComplete="email"
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
                placeholder="••••••••"
                className="h-10"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full h-10">
              Sign in
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t">
            <p className="text-xs text-muted-foreground">
              Demo accounts (any password):
            </p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground font-body">
              <li><span className="font-medium text-foreground">Admin:</span> admin@pumwani.ac.ke</li>
              <li><span className="font-medium text-foreground">Manager:</span> manager@pumwani.ac.ke</li>
              <li><span className="font-medium text-foreground">Student:</span> james@pumwani.ac.ke</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right: Accent panel */}
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

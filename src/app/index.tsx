import { Redirect } from 'expo-router';

import { LoadingState } from '@/components/ui/states';
import { useAuth } from '@/providers/auth-provider';

export default function Index() {
  const { session, loading } = useAuth();
  if (loading) return <LoadingState />;
  return <Redirect href={session ? '/(tabs)' : '/login'} />;
}

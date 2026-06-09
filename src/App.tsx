import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useKitchenStore } from './store/kitchen-store';

export default function App() {
  useEffect(() => {
    // Initialize the Supabase connection and fetch orders on app mount
    useKitchenStore.getState().initialize();
  }, []);

  return <RouterProvider router={router} />;
}

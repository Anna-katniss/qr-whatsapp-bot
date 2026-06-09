import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { LiveOrderGrid } from './pages/LiveOrderGrid';
import { ProductionBatching } from './pages/ProductionBatching';
import { InventoryDashboard } from './pages/InventoryDashboard';
import { RunnerHandshake } from './pages/RunnerHandshake';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: LiveOrderGrid },
      { path: 'batching', Component: ProductionBatching },
      { path: 'inventory', Component: InventoryDashboard },
      { path: 'runner', Component: RunnerHandshake },
    ],
  },
]);

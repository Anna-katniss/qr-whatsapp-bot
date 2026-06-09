import { Outlet, Link, useLocation } from 'react-router';
import { LayoutGrid, Package, Utensils, ClipboardCheck, Lock, LockOpen } from 'lucide-react';
import { useState } from 'react';

export function Layout() {
  const location = useLocation();
  const [isFullscreenLocked, setIsFullscreenLocked] = useState(false);

  const toggleFullscreenLock = () => {
    if (!isFullscreenLocked) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreenLocked(!isFullscreenLocked);
  };

  const navItems = [
    { path: '/', icon: LayoutGrid, label: 'Live Orders' },
    { path: '/batching', icon: Package, label: 'Batching' },
    { path: '/inventory', icon: Utensils, label: 'Inventory' },
    { path: '/runner', icon: ClipboardCheck, label: 'Runner' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl text-white">Kitchen Display System</h1>
            <div className="flex gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-lg">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <button
            onClick={toggleFullscreenLock}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isFullscreenLocked
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {isFullscreenLocked ? (
              <>
                <Lock className="w-5 h-5" />
                <span>Locked</span>
              </>
            ) : (
              <>
                <LockOpen className="w-5 h-5" />
                <span>Unlock</span>
              </>
            )}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}

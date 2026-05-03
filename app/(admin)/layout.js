"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Drawer } from 'vaul';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/admin/logout', { method: 'POST' });
      if (res.ok) {
        toast.success("Logged out successfully");
        router.push('/admin/login');
      }
    } catch (_e) {
      toast.error("Logout failed");
    }
  };

  const { data: statsData } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const pendingCount = statsData?.stats?.pendingOrders ?? 0;

  const sidebarLinks = [
    { 
      name: "Dashboard", 
      path: "/admin/dashboard", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    { 
      name: "Products", 
      path: "/admin/products", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    { 
      name: "Category", 
      path: "/admin/categories", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      )
    },
    { 
      name: "Orders", 
      path: "/admin/orders", 
      badge: pendingCount > 0 ? pendingCount : null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    },
    { 
      name: "Settings", 
      path: "/admin/settings", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
  ];

  const NavLinks = ({ mobile = false }) => (
    <div className={`flex flex-col gap-1 ${mobile ? 'mt-8 px-4' : 'mt-4 px-3'}`}>
      {sidebarLinks.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.name}
            href={item.path}
            onClick={() => mobile && setOpen(false)}
            className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive 
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                : "text-gray-600 hover:bg-gray-100 hover:text-indigo-600"
            }`}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </div>
            {item.badge && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                isActive ? "bg-white text-indigo-600" : "bg-indigo-600 text-white"
              }`}>
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );

  const getPageTitle = () => {
    if (pathname.includes('/add')) {
      const type = pathname.split('/')[2];
      const titles = { products: 'Product', categories: 'Category', orders: 'Order' };
      return `Add ${titles[type] || type}`;
    }
    if (pathname.includes('/edit')) {
      const type = pathname.split('/')[2];
      const titles = { products: 'Product', categories: 'Category', orders: 'Order' };
      return `Edit ${titles[type] || type}`;
    }
    return sidebarLinks.find(l => l.path === pathname)?.name || "Dashboard";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-gray-300 flex items-center justify-between px-4 md:px-8 sticky top-0 z-[100] transition-all duration-300">
        <Link href="/admin/dashboard" className="flex items-center">
          <span className="text-xl font-bold tracking-tight text-gray-900">
            Admin<span className="text-indigo-600">Panel</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-4 sm:gap-6 text-gray-600">
          <div className="hidden sm:flex items-center gap-2">
            <p className="text-sm font-medium">Hi! Admin</p>
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              A
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className='hidden sm:block border border-gray-300 rounded-full text-sm px-5 py-1.5 hover:bg-gray-50 transition-colors font-medium'
          >
            Logout
          </button>

          {/* Mobile Menu Toggle (vaul) */}
          <Drawer.Root open={open} onOpenChange={setOpen} direction="right">
            <Drawer.Trigger asChild>
              <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
            </Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[1000]" />
              <Drawer.Content className="bg-white flex flex-col rounded-l-3xl h-full w-[280px] fixed bottom-0 right-0 z-[1001] outline-none shadow-2xl">
                <div className="p-6 flex-1 bg-white rounded-l-3xl flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-xl font-bold text-gray-900">Admin Menu</span>
                    <Drawer.Close asChild>
                      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </Drawer.Close>
                  </div>
                  <NavLinks mobile />
                  <div className="mt-auto pt-6 border-t border-gray-100">
                    <button 
                      onClick={handleLogout}
                      className="w-full py-3 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
          <NavLinks />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {/* Page Title */}
            <div className="mb-8 hidden md:block">
              <h1 className="text-2xl font-bold text-gray-900">
                {getPageTitle()}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {pathname.includes('/add') ? "Fill in the details to create a new entry." : 
                 pathname.includes('/edit') ? "Update the information for this record." : 
                 "Manage your store resources and view analytics."}
              </p>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}


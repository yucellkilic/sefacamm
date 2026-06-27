'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Edit, 
  LogOut,
  Menu,
  X,
  MessageSquare 
} from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  action?: 'logout';
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Yazılar', href: '/admin/posts', icon: <FileText className="h-5 w-5" /> },
  { label: 'Aboneler', href: '/admin/subscribers', icon: <Users className="h-5 w-5" /> },
  { label: 'Yorumlar', href: '/admin/comments', icon: <MessageSquare className="h-5 w-5" /> },
  { label: 'Hero Editör', href: '/admin/hero-editor', icon: <Edit className="h-5 w-5" /> },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        router.push('/admin/login');
        router.refresh();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed left-4 top-4 z-50 flex items-center justify-center rounded-lg bg-surface p-2 text-text-primary shadow-lg lg:hidden"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-[#141414] transition-transform duration-300 lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo & Brand */}
        <div className="flex h-20 items-center gap-3 border-b border-border px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Image
              src="/logo.png"
              alt="Logo"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary">Admin Panel</h1>
            <p className="text-xs text-text-tertiary">Sefa Çam Blog</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                isActive(item.href)
                  ? 'border-l-4 border-primary bg-[#2a2a2a] text-primary'
                  : 'border-l-4 border-transparent text-text-secondary hover:bg-[#1f1f1f] hover:text-text-primary'
              }`}
            >
              <span className={isActive(item.href) ? 'text-primary' : 'text-text-tertiary group-hover:text-text-primary'}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-border p-4">
          <button
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-lg border-l-4 border-transparent px-4 py-3 text-sm font-medium text-text-secondary transition-all hover:bg-[#1f1f1f] hover:text-error"
          >
            <LogOut className="h-5 w-5 text-text-tertiary group-hover:text-error" />
            Çıkış Yap
          </button>
        </div>
      </aside>
    </>
  );
}

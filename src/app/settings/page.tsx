'use client';

import { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import MobileNav from '../components/layout/MobileNav';
import { useSidebarStore, useUserStore, useSettingsStore } from '@/lib/store';
import { ArrowLeft, User, Palette, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { isOpen } = useSidebarStore();
  const { isAdmin, login, logout } = useUserStore();
  const { primaryColor, setPrimaryColor, siteName, setSiteName } = useSettingsStore();
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showLogin, setShowLogin] = useState(false);

  const handleLogin = () => {
    if (login(username, password)) {
      toast({
        title: 'Login Successful',
        description: 'Welcome Admin! You now have full access.',
      });
      setUsername('');
      setPassword('');
      setShowLogin(false);
    } else {
      toast({
        title: 'Login Failed',
        description: 'Invalid username or password.',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged Out',
      description: 'You have been logged out successfully.',
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <Header showSearch={false} />

      <main className="pt-4 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-xl hover:bg-white/5 transition-colors duration-300"
            style={{ color: primaryColor }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold tracking-tight">Settings</h1>
        </div>

        <div className="px-4 space-y-3">
          {/* Admin Status */}
          <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <User className="w-4 h-4 text-white/50" />
              </div>
              <h3 className="font-medium text-sm">Account</h3>
            </div>
            
            {isAdmin ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-400 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs font-medium">Admin Mode Active</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-red-500/20 text-red-400 hover:bg-red-500/8 hover:border-red-500/30 rounded-xl transition-all duration-300"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {!showLogin ? (
                  <Button
                    className="w-full rounded-xl transition-all duration-300 hover:brightness-110 hover:shadow-lg"
                    style={{ backgroundColor: primaryColor }}
                    onClick={() => setShowLogin(true)}
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Login as Admin
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-white/40 text-xs font-medium">Username</Label>
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-white/5 border-white/8 rounded-lg mt-1.5 text-sm focus-visible:bg-white/8 focus-visible:border-white/15 transition-all duration-300"
                        placeholder="Enter username"
                      />
                    </div>
                    <div>
                      <Label className="text-white/40 text-xs font-medium">Password</Label>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-white/5 border-white/8 rounded-lg mt-1.5 text-sm focus-visible:bg-white/8 focus-visible:border-white/15 transition-all duration-300"
                        placeholder="Enter password"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="outline"
                        className="flex-1 rounded-xl border-white/8 hover:bg-white/5 transition-all duration-300"
                        onClick={() => setShowLogin(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="flex-1 rounded-xl transition-all duration-300 hover:brightness-110"
                        style={{ backgroundColor: primaryColor }}
                        onClick={handleLogin}
                      >
                        Login
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Site Settings (Admin Only) */}
          {isAdmin && (
            <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <Palette className="w-4 h-4 text-white/50" />
                </div>
                <h3 className="font-medium text-sm">Site Settings</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-white/40 text-xs font-medium">Site Name</Label>
                  <Input
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="bg-white/5 border-white/8 rounded-lg mt-1.5 text-sm focus-visible:bg-white/8 focus-visible:border-white/15 transition-all duration-300"
                  />
                </div>
                
                <div>
                  <Label className="text-white/40 text-xs font-medium">Primary Color</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="relative">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-10 h-10 rounded-xl cursor-pointer border-2 border-white/10 p-0.5 bg-transparent transition-all duration-300 hover:border-white/20"
                      />
                    </div>
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="bg-white/5 border-white/8 rounded-lg flex-1 text-sm font-mono focus-visible:bg-white/8 focus-visible:border-white/15 transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white/40 text-xs font-medium mb-2 block">Presets</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'Red', color: '#E53935' },
                      { name: 'Purple', color: '#8B5CF6' },
                      { name: 'Teal', color: '#008B8B' },
                      { name: 'Orange', color: '#F59E0B' },
                    ].map((preset) => (
                      <Button
                        key={preset.name}
                        size="sm"
                        variant="outline"
                        className="rounded-xl border-white/8 hover:bg-white/5 hover:border-white/15 transition-all duration-300 text-xs"
                        onClick={() => setPrimaryColor(preset.color)}
                      >
                        <div 
                          className="w-3 h-3 rounded-full mr-1.5 ring-2 ring-white/10" 
                          style={{ backgroundColor: preset.color }} 
                        />
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* About */}
          <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/5">
            <h3 className="font-medium text-sm mb-2">About</h3>
            <p className="text-xs text-white/40 leading-relaxed">
              Kumastream - Myanmar Movie & Series Platform
            </p>
            <p className="text-[10px] text-white/20 mt-3 font-mono">Version 1.0.0</p>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}

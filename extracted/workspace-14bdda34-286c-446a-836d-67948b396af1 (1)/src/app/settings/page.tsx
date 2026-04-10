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
    <div className="min-h-screen bg-[#121212]">
      <Sidebar />
      <Header showSearch={false} />

      <main className="pt-4 pb-20">
        {/* Header */}
        <div className="flex items-center gap-4 px-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            style={{ color: primaryColor }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>

        <div className="px-4 space-y-4">
          {/* Admin Status */}
          <div className="bg-[#1E1E1E] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold">Account</h3>
            </div>
            
            {isAdmin ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-400 mb-4">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-sm">Admin Mode Active</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
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
                    className="w-full"
                    style={{ backgroundColor: primaryColor }}
                    onClick={() => setShowLogin(true)}
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Login as Admin
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-gray-400 text-xs">Username</Label>
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-[#2D2D2D] border-none mt-1"
                        placeholder="Enter username"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-400 text-xs">Password</Label>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-[#2D2D2D] border-none mt-1"
                        placeholder="Enter password"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowLogin(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="flex-1"
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
            <div className="bg-[#1E1E1E] rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <Palette className="w-5 h-5 text-gray-400" />
                <h3 className="font-semibold">Site Settings</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-400 text-xs">Site Name</Label>
                  <Input
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="bg-[#2D2D2D] border-none mt-1"
                  />
                </div>
                
                <div>
                  <Label className="text-gray-400 text-xs">Primary Color</Label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="bg-[#2D2D2D] border-none flex-1"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPrimaryColor('#E53935')}
                  >
                    <div className="w-4 h-4 rounded-full bg-[#E53935] mr-2" />
                    Red
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPrimaryColor('#8B5CF6')}
                  >
                    <div className="w-4 h-4 rounded-full bg-[#8B5CF6] mr-2" />
                    Purple
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPrimaryColor('#008B8B')}
                  >
                    <div className="w-4 h-4 rounded-full bg-[#008B8B] mr-2" />
                    Teal
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPrimaryColor('#F59E0B')}
                  >
                    <div className="w-4 h-4 rounded-full bg-[#F59E0B] mr-2" />
                    Orange
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* About */}
          <div className="bg-[#1E1E1E] rounded-lg p-4">
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-sm text-gray-400">
              Kumastream - Myanmar Movie & Series Platform
            </p>
            <p className="text-xs text-gray-500 mt-2">Version 1.0.0</p>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}

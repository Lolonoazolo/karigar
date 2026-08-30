'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MobilePage } from '@/components/layout/MobilePage';
import { ArtisanHeader } from '@/components/layout/ArtisanHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { Toast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { useArtisan } from '@/context/ArtisanContext';
import { useLanguage } from '@/context/LanguageContext';
import { getArtisanSalesMetrics, getArtisanRecentSales } from '@/services/salesService';
import { SalesMetric, RecentSaleItem } from '@/types';
import {
  User as UserIcon,
  MapPin,
  Store,
  Edit2,
  Wallet,
  Truck,
  Shirt,
  ShoppingBag,
  LogOut,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, logout, updateProfile, toast } = useArtisan();
  const { t, formatCurr, formatNum } = useLanguage();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [metrics, setMetrics] = useState<SalesMetric>({
    totalSales: 0,
    ordersCount: 0,
    productsSoldCount: 0,
    growthPercentage: 0,
  });
  const [recentSales, setRecentSales] = useState<RecentSaleItem[]>([]);
  const [isSalesLoading, setIsSalesLoading] = useState<boolean>(true);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  // Protected Route Check
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  // Load real sales data
  useEffect(() => {
    let isMounted = true;
    const fetchSales = async () => {
      if (!user?.id) {
        setIsSalesLoading(false);
        return;
      }

      setIsSalesLoading(true);
      try {
        const [m, sales] = await Promise.all([
          getArtisanSalesMetrics(user.id),
          getArtisanRecentSales(user.id),
        ]);

        if (isMounted) {
          setMetrics(m);
          setRecentSales(sales);
        }
      } catch (err) {
        console.error('Error loading profile sales:', err);
      } finally {
        if (isMounted) setIsSalesLoading(false);
      }
    };

    fetchSales();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace('/login');
    } catch (e) {
      console.error('Logout error:', e);
      router.replace('/login');
    }
  };

  if (isLoading || (!user && isLoading)) {
    return (
      <MobilePage hasBottomNav={true}>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#4a7c59] border-t-transparent rounded-full spinner" />
          <p className="font-label text-xs text-[#6b6358]">Verifying authenticated session...</p>
        </div>
      </MobilePage>
    );
  }

  if (!user) return null;

  return (
    <MobilePage hasBottomNav={true}>
      <Toast message={toast.message} visible={toast.visible} />
      <ArtisanHeader title="Artisan Profile" />

      <main className="flex-1 flex flex-col px-5 py-6 space-y-6 pb-24">
        {/* Profile Info Card */}
        <div className="bg-white rounded-2xl p-5 soft-shadow border border-[#c4c8bc]/30 relative space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-[#c8e8d0] border-2 border-[#4a7c59]/20 flex items-center justify-center shrink-0 shadow-sm">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-10 h-10 text-[#4a7c59]" />
              )}
            </div>

            <div className="flex-1 min-w-0 pt-0.5 space-y-1">
              <h2 className="font-headline font-extrabold text-xl text-[#2e3230] truncate">
                {user.name}
              </h2>

              <p className="font-label text-xs font-semibold text-[#4a7c59] flex items-center gap-1.5 truncate">
                <Store className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{user.craft || user.shop || 'Artisan Specialization'}</span>
              </p>

              {user.location && (
                <p className="font-label text-xs text-[#6b6358] flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-[#705c30]" />
                  <span className="truncate">{user.location}</span>
                </p>
              )}
            </div>

            <button
              onClick={() => setIsEditOpen(true)}
              className="p-2 rounded-full bg-[#f5f1ea] hover:bg-[#eae6de] text-[#4a7c59] border border-[#c4c8bc]/40 transition-all active:scale-95 shrink-0"
              aria-label="Edit Profile"
              title="Edit Profile"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>

          {/* Bio Section */}
          {user.bio ? (
            <div className="pt-3 border-t border-[#f0ece4] text-xs font-body text-[#4a4e4a] leading-relaxed">
              <p>{user.bio}</p>
            </div>
          ) : (
            <div className="pt-3 border-t border-[#f0ece4] text-xs font-label text-[#6b6358] italic">
              Apne craft aur kala ke baare mein bio add karne ke liye "Edit Profile" dabayein.
            </div>
          )}
        </div>

        {/* Sales Overview Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-headline text-base font-bold text-[#2e3230] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4a7c59]" /> Sales Overview
            </h3>
            <span className="font-label text-[11px] text-[#6b6358] bg-[#f0ece4] px-2 py-0.5 rounded-full">
              Live Database
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-white p-3.5 rounded-2xl border border-[#c4c8bc]/30 soft-shadow flex flex-col justify-between space-y-2">
              <div className="w-8 h-8 rounded-full bg-[#d8f0de] text-[#4a7c59] flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <span className="font-headline font-extrabold text-base text-[#4a7c59] block">
                  {formatCurr(metrics.totalSales)}
                </span>
                <p className="font-label text-[10px] font-semibold text-[#6b6358] uppercase tracking-wider mt-0.5">
                  Revenue
                </p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-[#c4c8bc]/30 soft-shadow flex flex-col justify-between space-y-2">
              <div className="w-8 h-8 rounded-full bg-[#f8e0a8]/60 text-[#705c30] flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-headline font-extrabold text-base text-[#2e3230] block">
                  {formatNum(metrics.ordersCount)}
                </span>
                <p className="font-label text-[10px] font-semibold text-[#6b6358] uppercase tracking-wider mt-0.5">
                  Orders
                </p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-[#c4c8bc]/30 soft-shadow flex flex-col justify-between space-y-2">
              <div className="w-8 h-8 rounded-full bg-[#c8e8d0] text-[#4a7c59] flex items-center justify-center">
                <Shirt className="w-4 h-4" />
              </div>
              <div>
                <span className="font-headline font-extrabold text-base text-[#2e3230] block">
                  {formatNum(metrics.productsSoldCount)}
                </span>
                <p className="font-label text-[10px] font-semibold text-[#6b6358] uppercase tracking-wider mt-0.5">
                  Sold
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Sales Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-headline text-base font-bold text-[#2e3230]">
              Recent Transactions
            </h3>
            <button
              onClick={() => router.push('/artisan/sales')}
              className="font-label text-xs font-bold text-[#4a7c59] hover:underline flex items-center gap-0.5"
            >
              <span>Dashboard</span>
              <ArrowUpRight className="w-3.5 h-3.5 rtl-flip" />
            </button>
          </div>

          <div className="bg-white rounded-2xl soft-shadow border border-[#c4c8bc]/30 overflow-hidden divide-y divide-[#f0ece4]">
            {isSalesLoading ? (
              <div className="p-6 text-center text-[#6b6358] font-body text-xs">
                Loading sales history...
              </div>
            ) : recentSales.length === 0 ? (
              <div className="p-6 text-center space-y-1">
                <p className="font-headline font-bold text-sm text-[#2e3230]">No sales yet.</p>
                <p className="font-body text-xs text-[#6b6358]">Your completed orders will appear here.</p>
              </div>
            ) : (
              recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3.5 hover:bg-[#faf6f0] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#d8f0de] text-[#4a7c59] flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-xs text-[#2e3230]">
                        {sale.productName}
                      </h4>
                      <p className="font-label text-[11px] text-[#6b6358]">
                        Qty: {sale.quantity} • {sale.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-headline font-bold text-sm text-[#4a7c59]">
                      +{formatCurr(sale.amount)}
                    </span>
                    <span className="block font-label text-[9px] font-bold text-[#705c30]">
                      Completed
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Separator before Log Out */}
        <div className="pt-6 border-t border-[#c4c8bc]/40" />

        {/* Destructive Log Out Action at Far End / Bottom */}
        <div className="space-y-2">
          <Button
            type="button"
            variant="tertiary"
            fullWidth
            size="lg"
            disabled={isLoggingOut}
            onClick={handleLogout}
            icon={<LogOut className="w-5 h-5 text-[#b83230]" />}
            className="!border-[#b83230]/40 !text-[#b83230] hover:!bg-[#ffdad8]/30 active:!bg-[#ffdad8]"
          >
            {isLoggingOut ? 'Logging out...' : 'Log Out'}
          </Button>
          <p className="text-[11px] font-label text-[#6b6358] text-center">
            Sign out of your active Supabase artisan session securely.
          </p>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {user && (
        <EditProfileModal
          user={user}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSave={updateProfile}
        />
      )}

      <BottomNavigation />
    </MobilePage>
  );
}

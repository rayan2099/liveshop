'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Navigation, Package, DollarSign, Clock, Power } from 'lucide-react';
import { deliveryApi } from '@/lib/api';

export default function DriverDashboardPage() {
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(false);

  const { data: availableDeliveries } = useQuery({
    queryKey: ['available-deliveries'],
    queryFn: () => deliveryApi.getAvailable(),
    enabled: isOnline,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: myDeliveries } = useQuery({
    queryKey: ['my-deliveries'],
    queryFn: () => deliveryApi.getMyDeliveries(),
  });

  const toggleMutation = useMutation({
    mutationFn: () => deliveryApi.toggleAvailability(),
    onSuccess: () => {
      setIsOnline(!isOnline);
      queryClient.invalidateQueries({ queryKey: ['available-deliveries'] });
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => deliveryApi.acceptDelivery(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['my-deliveries'] });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => deliveryApi.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-deliveries'] });
    }
  });

  const stats = [
    { label: "Today's Earnings", value: '$145.50', icon: DollarSign },
    { label: 'Deliveries', value: '8', icon: Package },
    { label: 'Online Hours', value: '4.5h', icon: Clock },
    { label: 'Rating', value: '4.9', icon: MapPin },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-neon-cyan">Driver Studio</h1>
          <p className="text-white/60">Manage your active trips and earnings</p>
        </div>
        <button
          onClick={() => toggleMutation.mutate()}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all shadow-lg ${isOnline
            ? 'bg-neon-cyan text-black shadow-neon-cyan/20'
            : 'bg-white/10 text-white hover:bg-white/20'
            }`}
        >
          <Power className="w-5 h-5" />
          {isOnline ? 'Online' : 'Go Online'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass rounded-2xl p-6 hover:border-neon-cyan/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-neon-cyan/20 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-neon-cyan" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-white/50">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Available Deliveries */}
        <div className="glass rounded-2xl p-6 border-neon-cyan/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-xl flex items-center gap-2">
              <Package className="w-5 h-5 text-neon-cyan" />
              Available Offers
            </h2>
            {isOnline && <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />}
          </div>

          <div className="space-y-4">
            {!isOnline ? (
              <div className="text-center py-12 bg-white/5 rounded-2xl">
                <Power className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <p className="text-white/40">Go online to see available deliveries</p>
              </div>
            ) : availableDeliveries?.data?.deliveries?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/50">Searching for nearby offers...</p>
              </div>
            ) : (
              availableDeliveries?.data?.deliveries?.map((delivery: any) => (
                <div key={delivery.id} className="p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-neon-cyan/20 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-bold text-lg">{delivery.order?.store?.name}</p>
                      <p className="text-sm text-white/50">{delivery.order?.items?.length} items • 2.4 km away</p>
                    </div>
                    <div className="bg-neon-cyan/10 px-3 py-1 rounded-lg">
                      <p className="font-bold text-neon-cyan">${Number(delivery.deliveryFee).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 bg-black/20 p-4 rounded-xl">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_8px_rgba(0,255,255,1)]" />
                      <span className="text-white/80">Pickup: {delivery.order?.store?.address?.street}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-neon-pink shadow-[0_0_8px_rgba(255,0,255,1)]" />
                      <span className="text-white/80">Dropoff: {delivery.order?.shippingAddress?.street || delivery.dropoffAddress?.street}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => acceptMutation.mutate(delivery.id)}
                    disabled={acceptMutation.isPending}
                    className="w-full btn-primary py-3 rounded-xl font-bold text-sm bg-neon-cyan text-black hover:bg-neon-cyan/80"
                  >
                    {acceptMutation.isPending ? 'Connecting...' : 'Accept Job'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active/Past Deliveries */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-display font-bold text-xl mb-6">Current Trip</h2>

          <div className="space-y-4">
            {myDeliveries?.data?.deliveries?.filter((d: any) => d.status !== 'delivered').length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-2xl">
                <Navigation className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <p className="text-white/40">No active deliveries</p>
              </div>
            ) : (
              myDeliveries?.data?.deliveries?.filter((d: any) => d.status !== 'delivered').map((delivery: any) => (
                <div key={delivery.id} className="p-6 bg-gradient-to-br from-neon-cyan/10 to-transparent rounded-2xl border border-neon-cyan/20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-neon-cyan font-bold uppercase tracking-wider mb-1">Active Job</p>
                      <p className="font-bold text-xl">{delivery.order?.orderNumber}</p>
                    </div>
                    <span className="text-xs px-3 py-1 bg-neon-cyan/20 text-neon-cyan rounded-full font-bold animate-pulse">
                      {delivery.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 p-3 rounded-xl">
                      <p className="text-xs text-white/40 mb-1">Customer</p>
                      <p className="font-medium text-sm">{delivery.order?.customer?.profile?.firstName} {delivery.order?.customer?.profile?.lastName}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl">
                      <p className="text-xs text-white/40 mb-1">Total Fee</p>
                      <p className="font-medium text-sm text-neon-cyan">${(Number(delivery.deliveryFee) + (Number(delivery.tipAmount) || 0)).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {delivery.status === 'driver_accepted' && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: delivery.id, status: 'at_pickup' })}
                        className="flex-1 py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-white/90"
                      >
                        Arrived at Pickup
                      </button>
                    )}
                    {delivery.status === 'at_pickup' && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: delivery.id, status: 'picked_up' })}
                        className="flex-1 py-3 bg-neon-cyan text-black rounded-xl font-bold text-sm"
                      >
                        Order Picked Up
                      </button>
                    )}
                    {delivery.status === 'picked_up' && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: delivery.id, status: 'in_transit' })}
                        className="flex-1 py-3 bg-neon-cyan text-black rounded-xl font-bold text-sm"
                      >
                        Start Transit
                      </button>
                    )}
                    {delivery.status === 'in_transit' && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: delivery.id, status: 'at_dropoff' })}
                        className="flex-1 py-3 bg-neon-pink text-white rounded-xl font-bold text-sm"
                      >
                        Arrived at Dropoff
                      </button>
                    )}
                    {delivery.status === 'at_dropoff' && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: delivery.id, status: 'delivered' })}
                        className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold text-sm"
                      >
                        Mark Delivered
                      </button>
                    )}
                    <button className="px-4 py-3 bg-white/10 rounded-xl hover:bg-white/20">
                      <Navigation className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

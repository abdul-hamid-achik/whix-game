'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Heart, AlertTriangle, Clock, DollarSign, 
  Star, Package, MessageSquare, Utensils, Home 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { CustomerProfile, CustomerMood } from '@/lib/schemas/customer-schemas';
import { useCustomerStore } from '@/lib/stores/customerStore';

interface CustomerProfilePanelProps {
  customerId: string;
  className?: string;
  onClose?: () => void;
}

export function CustomerProfilePanel({ customerId, className, onClose }: CustomerProfilePanelProps) {
  const { getCustomer, getCustomerHistory } = useCustomerStore();
  const [activeTab, setActiveTab] = useState('overview');
  
  const customer = getCustomer(customerId);
  const history = getCustomerHistory(customerId);
  
  if (!customer) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-muted-foreground">
          Customer not found
        </CardContent>
      </Card>
    );
  }
  
  // Calculate stats
  const successRate = customer.totalOrders > 0 
    ? Math.round((customer.successfulDeliveries / customer.totalOrders) * 100)
    : 0;
  
  const getMoodColor = (mood: CustomerMood) => {
    switch (mood) {
      case 'happy': return 'text-green-500';
      case 'neutral': return 'text-yellow-500';
      case 'impatient': return 'text-orange-500';
      case 'angry': return 'text-red-500';
      case 'excited': return 'text-purple-500';
      case 'disappointed': return 'text-gray-500';
      default: return 'text-gray-400';
    }
  };
  
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'vip': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'frequent': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("w-full max-w-2xl", className)}
    >
      <Card className="overflow-hidden">
        {/* Header */}
        <CardHeader className="relative pb-2">
          <div className={cn("absolute inset-0 opacity-10", getTierColor(customer.tier))} />
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-background">
                <AvatarImage src={customer.avatar} />
                <AvatarFallback>
                  {customer.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{customer.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="capitalize">
                    {customer.tier} Customer
                  </Badge>
                  <span className={cn("text-sm font-medium", getMoodColor(customer.currentMood))}>
                    Currently {customer.currentMood}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="personality">Personality</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold">{customer.totalOrders}</p>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                </div>
                <div className="text-center">
                  <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <p className="text-2xl font-bold">{successRate}%</p>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                </div>
                <div className="text-center">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold">${customer.averageTip}</p>
                  <p className="text-xs text-muted-foreground">Avg Tip</p>
                </div>
                <div className="text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold">
                    {customer.lastDelivery 
                      ? Math.floor((Date.now() - customer.lastDelivery) / (1000 * 60 * 60 * 24))
                      : 'N/A'
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">Days Since Order</p>
                </div>
              </div>
              
              {/* Address Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{customer.address.street}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {customer.address.district} District • {customer.address.buildingType}
                  </p>
                  {customer.address.specialInstructions && (
                    <p className="text-sm mt-2 p-2 bg-muted rounded">
                      <span className="font-medium">Note:</span> {customer.address.specialInstructions}
                    </p>
                  )}
                </CardContent>
              </Card>
              
              {/* Quirks */}
              {customer.quirks.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Known Quirks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {customer.quirks.map((quirk, index) => (
                        <Badge key={index} variant="secondary">
                          {quirk}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-4 mt-4">
              {/* Dietary Restrictions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Utensils className="w-4 h-4" />
                    Dietary Restrictions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {customer.dietaryRestrictions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {customer.dietaryRestrictions.map((restriction, index) => (
                        <Badge key={index} variant="destructive">
                          {restriction.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No restrictions</p>
                  )}
                </CardContent>
              </Card>
              
              {/* Special Requests */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Default Delivery Requests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {customer.defaultRequests.map((request, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">
                        {request.type.replace(/_/g, ' ')}
                        {request.details && `: ${request.details}`}
                      </span>
                      <Badge variant={
                        request.priority === 'high' ? 'destructive' : 
                        request.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {request.priority}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              {/* Partner Preferences */}
              {(customer.preferredPartners.length > 0 || customer.blacklistedPartners.length > 0) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Partner Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {customer.preferredPartners.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2 text-green-500">Preferred Partners</p>
                        <div className="flex flex-wrap gap-2">
                          {customer.preferredPartners.map((partnerId, index) => (
                            <Badge key={index} variant="outline" className="text-green-600">
                              {partnerId}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {customer.blacklistedPartners.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2 text-red-500">Blacklisted Partners</p>
                        <div className="flex flex-wrap gap-2">
                          {customer.blacklistedPartners.map((partnerId, index) => (
                            <Badge key={index} variant="outline" className="text-red-600">
                              {partnerId}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* Personality Tab */}
            <TabsContent value="personality" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Personality Traits</CardTitle>
                  <CardDescription>
                    Understanding customer personality helps predict behavior
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(customer.personality).map(([trait, value]) => (
                    <div key={trait}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium capitalize">
                          {trait}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {value}%
                        </span>
                      </div>
                      <Progress value={value} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              {customer.backstory && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Background</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{customer.backstory}</p>
                    {customer.occupation && (
                      <p className="text-sm mt-2">
                        <span className="font-medium">Occupation:</span> {customer.occupation}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* History Tab */}
            <TabsContent value="history" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Recent Deliveries</CardTitle>
                </CardHeader>
                <CardContent>
                  {history.length > 0 ? (
                    <div className="space-y-3">
                      {history.slice(-5).reverse().map((interaction, index) => (
                        <div key={index} className="border-b last:border-0 pb-3 last:pb-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium">
                                Order #{interaction.deliveryId.slice(-8)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Partner: {interaction.partnerId}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={cn(
                                "text-sm font-medium",
                                getMoodColor(interaction.customerResponse)
                              )}>
                                {interaction.customerResponse}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Tip: ${interaction.tipAmount} ({interaction.tipPercentage}%)
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No delivery history yet
                    </p>
                  )}
                </CardContent>
              </Card>
              
              {/* Mood History */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Mood Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {customer.moodHistory.slice(-5).reverse().map((entry, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className={getMoodColor(entry.mood)}>
                          {entry.mood}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
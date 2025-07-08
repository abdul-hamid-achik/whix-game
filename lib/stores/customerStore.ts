import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools, persist } from 'zustand/middleware';
import { 
  CustomerProfile, 
  CustomerInteraction,
  CustomerMood,
  CUSTOMER_ARCHETYPES,
  calculateCustomerSatisfaction,
  calculateTip
} from '@/lib/schemas/customer-schemas';

interface CustomerState {
  // Customer data
  customers: Record<string, CustomerProfile>;
  activeCustomerId: string | null;
  
  // Interaction history
  interactions: CustomerInteraction[];
  
  // Stats
  totalCustomersServed: number;
  averageCustomerSatisfaction: number;
  
  // Actions
  addCustomer: (customer: CustomerProfile) => void;
  generateRandomCustomer: (district: string) => CustomerProfile;
  getCustomer: (customerId: string) => CustomerProfile | undefined;
  setActiveCustomer: (customerId: string | null) => void;
  
  // Interaction management
  recordInteraction: (interaction: Omit<CustomerInteraction, 'tipAmount' | 'tipPercentage' | 'moodChange' | 'relationshipChange' | 'willOrderAgain'>) => CustomerInteraction;
  updateCustomerMood: (customerId: string, mood: CustomerMood, reason: string) => void;
  updateCustomerTier: (customerId: string) => void;
  
  // Preferences
  addFavoriteItem: (customerId: string, itemId: string) => void;
  addPreferredPartner: (customerId: string, partnerId: string) => void;
  blacklistPartner: (customerId: string, partnerId: string) => void;
  
  // Analytics
  getCustomerHistory: (customerId: string) => CustomerInteraction[];
  getPartnerRatingsForCustomer: (customerId: string) => Record<string, number>;
  getTopCustomers: (limit?: number) => CustomerProfile[];
}

// Name generation pools
const FIRST_NAMES = [
  'Miguel', 'Sofia', 'Diego', 'Valentina', 'Alejandro', 'Camila', 'Daniel', 'Isabella',
  'Carlos', 'Maria', 'Luis', 'Ana', 'Jorge', 'Lucia', 'Roberto', 'Elena',
  'Francisco', 'Carmen', 'Juan', 'Patricia', 'Ricardo', 'Monica', 'Eduardo', 'Claudia'
];

const LAST_NAMES = [
  'Garcia', 'Rodriguez', 'Martinez', 'Lopez', 'Gonzalez', 'Hernandez', 'Perez', 'Sanchez',
  'Ramirez', 'Torres', 'Flores', 'Rivera', 'Gomez', 'Diaz', 'Morales', 'Jimenez',
  'Silva', 'Castro', 'Vargas', 'Medina', 'Rojas', 'Ortiz', 'Nunez', 'Reyes'
];

const STREET_NAMES = [
  'Insurgentes', 'Reforma', 'Juarez', 'Madero', 'Hidalgo', 'Morelos', 'Zaragoza',
  'Revolucion', 'Independencia', 'Constitucion', 'Libertad', 'Victoria'
];

export const useCustomerStore = create<CustomerState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        customers: {},
        activeCustomerId: null,
        interactions: [],
        totalCustomersServed: 0,
        averageCustomerSatisfaction: 75,
        
        // Customer management
        addCustomer: (customer) => set((state) => {
          state.customers[customer.id] = customer;
        }),
        
        generateRandomCustomer: (district) => {
          const archetypeKeys = Object.keys(CUSTOMER_ARCHETYPES);
          const randomArchetype = CUSTOMER_ARCHETYPES[
            archetypeKeys[Math.floor(Math.random() * archetypeKeys.length)] as keyof typeof CUSTOMER_ARCHETYPES
          ];
          
          const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
          const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
          const streetName = STREET_NAMES[Math.floor(Math.random() * STREET_NAMES.length)];
          
          const customer: CustomerProfile = {
            id: `customer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: `${firstName} ${lastName}`,
            address: {
              street: `${Math.floor(Math.random() * 9999) + 1} ${streetName}`,
              district,
              buildingType: Math.random() > 0.5 ? 'apartment' : 'house',
              specialInstructions: Math.random() > 0.7 ? 'Gate code: #' + Math.floor(Math.random() * 9999) : undefined
            },
            dietaryRestrictions: [],
            favoriteItems: [],
            tier: 'regular',
            totalOrders: 0,
            successfulDeliveries: 0,
            averageTip: 0,
            currentMood: 'neutral',
            moodHistory: [],
            defaultRequests: randomArchetype.defaultRequests || [],
            currentRequests: randomArchetype.defaultRequests || [],
            preferredPartners: [],
            blacklistedPartners: [],
            personality: {
              ...randomArchetype.personality,
              // Add some randomness
              patience: Math.max(0, Math.min(100, randomArchetype.personality.patience + (Math.random() * 20 - 10))),
              generosity: Math.max(0, Math.min(100, randomArchetype.personality.generosity + (Math.random() * 20 - 10))),
              pickiness: Math.max(0, Math.min(100, randomArchetype.personality.pickiness + (Math.random() * 20 - 10))),
              chattiness: Math.max(0, Math.min(100, randomArchetype.personality.chattiness + (Math.random() * 20 - 10))),
              understanding: Math.max(0, Math.min(100, randomArchetype.personality.understanding + (Math.random() * 20 - 10))),
            },
            quirks: randomArchetype.quirks || [],
            occupation: Math.random() > 0.5 ? 'Office Worker' : 'Freelancer',
          };
          
          get().addCustomer(customer);
          return customer;
        },
        
        getCustomer: (customerId) => {
          return get().customers[customerId];
        },
        
        setActiveCustomer: (customerId) => set((state) => {
          state.activeCustomerId = customerId;
        }),
        
        // Interaction recording
        recordInteraction: (interactionData) => {
          const customer = get().customers[interactionData.customerId];
          if (!customer) throw new Error('Customer not found');
          
          // Calculate satisfaction
          const satisfaction = calculateCustomerSatisfaction(customer, interactionData);
          
          // Calculate tip
          const { tipAmount, tipPercentage } = calculateTip(customer, satisfaction, 25); // Base $25 order
          
          // Determine mood change
          let newMood: CustomerMood = 'neutral';
          let moodChange = 0;
          
          if (satisfaction >= 80) {
            newMood = 'happy';
            moodChange = 20;
          } else if (satisfaction >= 60) {
            newMood = 'neutral';
            moodChange = 0;
          } else if (satisfaction >= 40) {
            newMood = 'impatient';
            moodChange = -10;
          } else {
            newMood = 'angry';
            moodChange = -20;
          }
          
          // Calculate relationship change
          const relationshipChange = Math.floor((satisfaction - 50) / 10);
          
          // Will order again based on satisfaction and personality
          const willOrderAgain = satisfaction > 30 || 
            (satisfaction > 20 && customer.personality.understanding > 70);
          
          const fullInteraction: CustomerInteraction = {
            ...interactionData,
            tipAmount,
            tipPercentage,
            moodChange,
            relationshipChange,
            willOrderAgain,
            customerResponse: newMood
          };
          
          set((state) => {
            // Record interaction
            state.interactions.push(fullInteraction);
            
            // Update customer
            const customer = state.customers[interactionData.customerId];
            if (customer) {
              customer.totalOrders += 1;
              if (satisfaction >= 50) {
                customer.successfulDeliveries += 1;
              }
              customer.currentMood = newMood;
              customer.moodHistory.push({
                mood: newMood,
                reason: `Delivery satisfaction: ${satisfaction}%`,
                timestamp: Date.now()
              });
              customer.lastDelivery = Date.now();
              
              // Update average tip
              const allInteractions = state.interactions.filter(i => i.customerId === customer.id);
              const totalTips = allInteractions.reduce((sum, i) => sum + i.tipAmount, 0);
              customer.averageTip = Math.round(totalTips / allInteractions.length);
            }
            
            // Update global stats
            state.totalCustomersServed = Object.values(state.customers)
              .filter(c => c.totalOrders > 0).length;
            
            const allSatisfactions = state.interactions.map(i => {
              const c = state.customers[i.customerId];
              return c ? calculateCustomerSatisfaction(c, i) : 50;
            });
            state.averageCustomerSatisfaction = Math.round(
              allSatisfactions.reduce((a, b) => a + b, 0) / allSatisfactions.length
            );
          });
          
          return fullInteraction;
        },
        
        updateCustomerMood: (customerId, mood, reason) => set((state) => {
          const customer = state.customers[customerId];
          if (customer) {
            customer.currentMood = mood;
            customer.moodHistory.push({
              mood,
              reason,
              timestamp: Date.now()
            });
          }
        }),
        
        updateCustomerTier: (customerId) => set((state) => {
          const customer = state.customers[customerId];
          if (customer) {
            if (customer.totalOrders >= 50 && customer.averageTip >= 5) {
              customer.tier = 'platinum';
            } else if (customer.totalOrders >= 20 && customer.averageTip >= 3) {
              customer.tier = 'vip';
            } else if (customer.totalOrders >= 10) {
              customer.tier = 'frequent';
            }
          }
        }),
        
        // Preferences
        addFavoriteItem: (customerId, itemId) => set((state) => {
          const customer = state.customers[customerId];
          if (customer && !customer.favoriteItems.includes(itemId)) {
            customer.favoriteItems.push(itemId);
          }
        }),
        
        addPreferredPartner: (customerId, partnerId) => set((state) => {
          const customer = state.customers[customerId];
          if (customer && !customer.preferredPartners.includes(partnerId)) {
            customer.preferredPartners.push(partnerId);
            // Remove from blacklist if present
            customer.blacklistedPartners = customer.blacklistedPartners.filter(id => id !== partnerId);
          }
        }),
        
        blacklistPartner: (customerId, partnerId) => set((state) => {
          const customer = state.customers[customerId];
          if (customer && !customer.blacklistedPartners.includes(partnerId)) {
            customer.blacklistedPartners.push(partnerId);
            // Remove from preferred if present
            customer.preferredPartners = customer.preferredPartners.filter(id => id !== partnerId);
          }
        }),
        
        // Analytics
        getCustomerHistory: (customerId) => {
          return get().interactions.filter(i => i.customerId === customerId);
        },
        
        getPartnerRatingsForCustomer: (customerId) => {
          const interactions = get().getCustomerHistory(customerId);
          const ratings: Record<string, number> = {};
          
          interactions.forEach(i => {
            if (!ratings[i.partnerId]) {
              ratings[i.partnerId] = 0;
            }
            ratings[i.partnerId] += i.ratingGiven || 3;
          });
          
          // Average the ratings
          Object.keys(ratings).forEach(partnerId => {
            const count = interactions.filter(i => i.partnerId === partnerId).length;
            ratings[partnerId] = ratings[partnerId] / count;
          });
          
          return ratings;
        },
        
        getTopCustomers: (limit = 10) => {
          return Object.values(get().customers)
            .filter(c => c.totalOrders > 0)
            .sort((a, b) => {
              // Sort by tier, then by total orders
              const tierOrder = { regular: 0, frequent: 1, vip: 2, platinum: 3 };
              const tierDiff = tierOrder[b.tier] - tierOrder[a.tier];
              if (tierDiff !== 0) return tierDiff;
              return b.totalOrders - a.totalOrders;
            })
            .slice(0, limit);
        },
      })),
      {
        name: 'whix-customer-state',
        partialize: (state) => ({
          customers: state.customers,
          interactions: state.interactions.slice(-100), // Keep only last 100 interactions
          totalCustomersServed: state.totalCustomersServed,
          averageCustomerSatisfaction: state.averageCustomerSatisfaction,
        }),
      }
    )
  )
);
// Define credit consumption constants
export const CREDIT_COSTS = {
  'kling-1.6': 20,   // Kling 1.6 costs 20 credits
  'veo-2': 180,      // Veo 2 costs 180 credits
  'veo-3': 330,      // Veo 3 costs 330 credits
};

// User credit related interfaces
export interface UserCredit {
  credits: number;
}

// Get user's current credits from localStorage
export const getUserCredits = (): number => {
  const userData = localStorage.getItem('user');
  if (!userData) return 0;
  
  try {
    const user = JSON.parse(userData);
    // If there's no credits field in user data, default to 0
    return user.credits || 0;
  } catch (error) {
    console.error('Error parsing user credit data:', error);
    return 0;
  }
};

// Update user credits
export const updateUserCredits = (newCredits: number): boolean => {
  const userData = localStorage.getItem('user');
  if (!userData) return false;
  
  try {
    const user = JSON.parse(userData);
    user.credits = newCredits;
    localStorage.setItem('user', JSON.stringify(user));
    return true;
  } catch (error) {
    console.error('Error updating user credit data:', error);
    return false;
  }
};

// Consume credits - returns whether successful
export const consumeCredits = (modelId: string): boolean => {
  const currentCredits = getUserCredits();
  const cost = CREDIT_COSTS[modelId as keyof typeof CREDIT_COSTS] || 0;
  
  if (currentCredits < cost) {
    return false; // Not enough credits
  }
  
  return updateUserCredits(currentCredits - cost);
};

// Add credits
export const addCredits = (amount: number): boolean => {
  const currentCredits = getUserCredits();
  return updateUserCredits(currentCredits + amount);
};

// Check if user has enough credits to use a model
export const hasEnoughCredits = (modelId: string): boolean => {
  const currentCredits = getUserCredits();
  const cost = CREDIT_COSTS[modelId as keyof typeof CREDIT_COSTS] || 0;
  return currentCredits >= cost;
};

// Get the credit cost for a model
export const getModelCreditCost = (modelId: string): number => {
  return CREDIT_COSTS[modelId as keyof typeof CREDIT_COSTS] || 0;
}; 
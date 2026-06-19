import type { ComplexityLevel, AuthorizationScope } from '@/types';

export const calculateBasePrice = (complexity: ComplexityLevel): number => {
  const basePrices = {
    simple: 500,
    medium: 1200,
    complex: 2500
  };
  return basePrices[complexity];
};

export const calculateComplexityMultiplier = (complexity: ComplexityLevel): number => {
  const multipliers = {
    simple: 1,
    medium: 1.5,
    complex: 2.2
  };
  return multipliers[complexity];
};

export const calculateUrgentSurcharge = (isUrgent: boolean, basePrice: number): number => {
  return isUrgent ? basePrice * 0.3 : 0;
};

export const calculateAuthorizationSurcharge = (
  scope: AuthorizationScope,
  basePrice: number
): number => {
  const surchargeRates = {
    personal: 0,
    commercial: 0.5,
    exclusive: 1.5
  };
  return basePrice * surchargeRates[scope];
};

export const calculateTotalPrice = (
  complexity: ComplexityLevel,
  isUrgent: boolean,
  authorizationScope: AuthorizationScope
): {
  basePrice: number;
  complexityMultiplier: number;
  urgentSurcharge: number;
  commercialSurcharge: number;
  totalPrice: number;
} => {
  const basePrice = calculateBasePrice(complexity);
  const complexityMultiplier = calculateComplexityMultiplier(complexity);
  const priceAfterComplexity = basePrice * complexityMultiplier;
  const urgentSurcharge = calculateUrgentSurcharge(isUrgent, priceAfterComplexity);
  const commercialSurcharge = calculateAuthorizationSurcharge(authorizationScope, priceAfterComplexity);
  const totalPrice = priceAfterComplexity + urgentSurcharge + commercialSurcharge;

  return {
    basePrice,
    complexityMultiplier,
    urgentSurcharge,
    commercialSurcharge,
    totalPrice: Math.round(totalPrice)
  };
};

export const formatPrice = (price: number): string => {
  return `¥${price.toLocaleString()}`;
};

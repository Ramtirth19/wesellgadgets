export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatCondition = (condition: string): string => {
  const conditionMap: Record<string, string> = {
    excellent: 'Like New',
    good: 'Good',
    fair: 'Fair',
    refurbished: 'Certified Refurbished',
  };
  return conditionMap[condition] || condition;
};

export const getConditionColor = (condition: string): string => {
  const colorMap: Record<string, string> = {
    excellent: 'text-success-600 bg-success-50',
    good: 'text-primary-600 bg-primary-50',
    fair: 'text-warning-600 bg-warning-50',
    refurbished: 'text-accent-600 bg-accent-50',
  };
  return colorMap[condition] || 'text-gray-600 bg-gray-50';
};
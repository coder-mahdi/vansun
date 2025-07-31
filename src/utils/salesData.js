// Services and their prices
export const SERVICES = {
  'Antieyebrow': 55,
  'Antitragus': 35,
  'Ashley': 35,
  'Bridge': 55,
  'Conch': 35,
  'Daith': 35,
  'Eyebrow': 35,
  'ForwardHelix': 35,
  'Helix': 35,
  'HiddenHelix': 35,
  'Highnostril': 35,
  'Horizontaleyebrow': 55,
  'Industrial': 55,
  'Labret': 35,
  'Lobe': 15,
  'Lobe10G+': 25,
  'Mntis': 110,
  'Medusa': 35,
  'Microdermal': 55,
  'Monroe': 35,
  'Navel': 35,
  'Nipple': 35,
  'Nostril': 35,
  'OrbitalLobe': 55,
  'Rook': 35,
  'Septum': 35,
  'Sidelipe': 35,
  'Smilie': 35,
  'Snug': 35,
  'Surface': 55,
  'Tongue': 35,
  'Transverselope': 35,
  'Verticallip': 35,
  'Flat': 35,
  'FauxRook': 35,
  'SnakeBites': 70,
  'TransverseLobe': 35,
  'Snonch': 35,
  'VerticalIndustrial': 70,
  'Jestrum': 35,
  'Tragus': 35,
  'Jewelry Change': 10
};

// Jewelry types and their prices
export const JEWELRY = {
  'Basic': 20,
  'Standard': 40,
  'Premium': 60,
  'Pro-Premium': 70,
  'Basic*2': 35,
  'Standard*2': 70,
  'Premium*2': 100,
  'Pro-Premium*2': 120
};

// Jewelry cost reductions
export const JEWELRY_COST_REDUCTIONS = {
  'Basic': 0.5,
  'Standard': 2,
  'Premium': 8,
  'Pro-Premium': 10,
  'Basic*2': 0.5,
  'Standard*2': 2,
  'Premium*2': 8,
  'Pro-Premium*2': 10
};

// Tax rate (Canadian tax)
export const TAX_RATE = 1.12;

// Payment methods
export const PAYMENT_METHODS = ['Cash', 'Card'];

// Calculate service price based on quantity
export const calculateServicePrice = (services) => {
  if (!services || services.length === 0) return 0;
  
  let totalPrice = 0;
  
  services.forEach(service => {
    if (service.name && service.quantity) {
      const basePrice = SERVICES[service.name] || 0;
      totalPrice += basePrice * service.quantity;
    }
  });
  
  return totalPrice;
};

// Calculate jewelry price based on selections
export const calculateJewelryPrice = (jewelrySelections) => {
  if (!jewelrySelections || jewelrySelections.length === 0) return 0;
  
  let totalPrice = 0;
  
  jewelrySelections.forEach(jewelry => {
    if (jewelry.name && jewelry.quantity) {
      const basePrice = JEWELRY[jewelry.name] || 0;
      totalPrice += basePrice * jewelry.quantity;
    }
  });
  
  // Apply discount for 3 or more items
  if (jewelrySelections.length >= 3) {
    totalPrice = totalPrice * 0.9; // 10% discount
  }
  
  return totalPrice;
};

// Calculate total price with tax
export const calculateTotalPrice = (servicePrice, jewelryPrice, customPrice = 0, tip = 0) => {
  const subtotal = servicePrice + jewelryPrice + customPrice + tip;
  const afterTax = subtotal * TAX_RATE;
  
  return {
    beforeTax: subtotal,
    afterTax: afterTax,
    taxAmount: afterTax - subtotal
  };
};

// Calculate employee income (Staff/Manager/Supervisor - all get same calculation)
export const calculateEmployeeIncome = (report) => {
  const serviceAmount = report.servicePrice || 0;
  const jewelryAmount = report.jewelryPrice || 0;
  const tip = report.tip || 0;
  
  // Service amount halved
  const serviceIncome = serviceAmount / 2;
  
  // 5% of jewelry amount
  const jewelryIncome = jewelryAmount * 0.05;
  
  // Tips (if any)
  const tipIncome = tip;
  
  // Total employee income
  const totalIncome = serviceIncome + jewelryIncome + tipIncome;
  
  return {
    serviceIncome,
    jewelryIncome,
    tipIncome,
    totalIncome
  };
};

// Calculate Oscar's income (same as employee - half service + 5% jewelry + tips)
export const calculateOscarIncome = (report) => {
  const serviceAmount = report.servicePrice || 0;
  const jewelryAmount = report.jewelryPrice || 0;
  const tip = report.tip || 0;
  
  // Half the service price
  const serviceIncome = serviceAmount / 2;
  
  // 5% of jewelry amount
  const jewelryIncome = jewelryAmount * 0.05;
  
  // Tips (if any)
  const tipIncome = tip;
  
  // Total Oscar income
  const totalIncome = serviceIncome + jewelryIncome + tipIncome;
  
  return {
    serviceIncome,
    jewelryIncome,
    tipIncome,
    totalIncome
  };
};

// Calculate Vansun income (remaining jewelry amount after staff/oscar cuts)
export const calculateVansunIncome = (report) => {
  const jewelryAmount = report.jewelryPrice || 0;
  
  // Calculate total cuts (staff + oscar = 10% total)
  const totalCuts = jewelryAmount * 0.10; // 5% + 5% = 10%
  
  // Vansun gets the remaining 90%
  const vansunIncome = jewelryAmount - totalCuts;
  
  return {
    jewelryAmount,
    totalCuts,
    vansunIncome
  };
};

// Calculate Manager's income (same as regular staff)
export const calculateManagerIncome = (report) => {
  return calculateEmployeeIncome(report);
};

// Get service names for dropdown
export const getServiceNames = () => {
  return Object.keys(SERVICES);
};

// Get jewelry names for dropdown
export const getJewelryNames = () => {
  return Object.keys(JEWELRY);
}; 
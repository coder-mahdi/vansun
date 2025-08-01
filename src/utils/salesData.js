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
  
  return totalPrice;
};

// Calculate jewelry cost reductions
export const calculateJewelryReductions = (jewelrySelections) => {
  if (!jewelrySelections || jewelrySelections.length === 0) return 0;
  
  let totalReductions = 0;
  
  jewelrySelections.forEach(jewelry => {
    if (jewelry.name && jewelry.quantity) {
      const reduction = JEWELRY_COST_REDUCTIONS[jewelry.name] || 0;
      totalReductions += reduction * jewelry.quantity;
    }
  });
  
  return totalReductions;
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

// Calculate employee income based on role
export const calculateEmployeeIncome = (report, userRole = 'staff') => {
  const serviceAmount = report.servicePrice || 0;
  const jewelryAmount = report.jewelryPrice || 0;
  const tip = report.tip || 0;
  
  if (userRole === 'manager') {
    // Manager gets Vansun income (same as Vansun)
    return calculateVansunIncome(report);
  } else {
    // Staff gets: half service + 3% jewelry + tips
    const serviceIncome = serviceAmount / 2;
    const jewelryIncome = jewelryAmount * 0.03; // 3% of jewelry
    const tipIncome = tip;
    
    const totalIncome = serviceIncome + jewelryIncome + tipIncome;
    
    return {
      serviceIncome,
      jewelryIncome,
      tipIncome,
      totalIncome
    };
  }
};

// Calculate Oscar's income
export const calculateOscarIncome = (report) => {
  const serviceAmount = report.servicePrice || 0;
  const jewelryAmount = report.jewelryPrice || 0;
  
  // Oscar gets:
  // - Half service cost
  // - 3% of jewelry cost (after reductions)
  
  const serviceIncome = serviceAmount / 2;
  
  // Calculate jewelry income after reductions
  const jewelryReductions = calculateJewelryReductions(report.jewelry || []);
  const jewelryAfterReductions = jewelryAmount - jewelryReductions;
  const jewelryIncome = jewelryAfterReductions * 0.03;
  
  const totalIncome = serviceIncome + jewelryIncome;
  
  return {
    serviceIncome,
    jewelryIncome,
    jewelryReductions,
    jewelryAfterReductions,
    totalIncome
  };
};

// Calculate Vansun income (Manager gets this)
export const calculateVansunIncome = (report) => {
  const serviceAmount = report.servicePrice || 0;
  const jewelryAmount = report.jewelryPrice || 0;
  const tip = report.tip || 0;
  
  // Vansun income includes:
  // - Tips
  // - Half service cost
  // - Jewelry cost minus reductions and cuts
  
  const tipIncome = tip;
  const serviceIncome = serviceAmount / 2;
  
  // Calculate jewelry income after reductions
  const jewelryReductions = calculateJewelryReductions(report.jewelry || []);
  const jewelryAfterReductions = jewelryAmount - jewelryReductions;
  
  // Calculate cuts: 3% staff + 3% Oscar = 6% total
  const staffCut = jewelryAfterReductions * 0.03;
  const oscarCut = jewelryAfterReductions * 0.03;
  const totalCuts = staffCut + oscarCut;
  
  const jewelryIncome = jewelryAfterReductions - totalCuts;
  
  const totalIncome = tipIncome + serviceIncome + jewelryIncome;
  
  return {
    tipIncome,
    serviceIncome,
    jewelryIncome,
    jewelryReductions,
    staffCut,
    oscarCut,
    totalCuts,
    totalIncome
  };
};



// Get service names for dropdown
export const getServiceNames = () => {
  return Object.keys(SERVICES);
};

// Get jewelry names for dropdown (excluding *2 items which are for pricing calculations)
export const getJewelryNames = () => {
  return Object.keys(JEWELRY).filter(name => !name.includes('*2'));
};

// Calculate Vansun's income from staff transactions
export const calculateVansunIncomeFromStaff = (report) => {
  const jewelryAmount = report.jewelryPrice || 0;
  
  // Calculate jewelry income after reductions
  const jewelryReductions = calculateJewelryReductions(report.jewelry || []);
  const jewelryAfterReductions = jewelryAmount - jewelryReductions;
  
  // Calculate cuts: 3% staff + 3% Oscar = 6% total
  const staffCut = jewelryAfterReductions * 0.03;
  const oscarCut = jewelryAfterReductions * 0.03;
  const totalCuts = staffCut + oscarCut;
  
  // Vansun gets the remaining amount
  const vansunIncome = jewelryAfterReductions - totalCuts;
  
  return {
    jewelryAmount,
    jewelryReductions,
    jewelryAfterReductions,
    staffCut,
    oscarCut,
    totalCuts,
    vansunIncome
  };
}; 
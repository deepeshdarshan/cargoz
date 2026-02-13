// Shared constants for CargoZ Warehouse Search

// Unit conversion factors — backend stores all capacity in SQFT.
// These convert user input from other units → SQFT.
//
//   CBM:    1 m² floor area = 10.764 SQFT
//   Pallet: EUR pallet (1.2m × 1.0m) = 1.2 m² = 12.917 SQFT
export const CONVERSION_TO_SQFT = {
  SQFT: 1,
  CBM: 10.764,
  Pallet: 12.917
};

// Display labels for each unit type
export const UNIT_LABELS = {
  SQFT: 'SQFT',
  CBM: 'CBM',
  Pallet: 'Pallets'
};

// Validation prompt labels for the search form
export const VALIDATION_LABELS = {
  SQFT: 'area in SQFT',
  CBM: 'volume in CBM',
  Pallet: 'number of pallets'
};

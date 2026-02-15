// Shared constants for CargoZ Warehouse Search

// ── Unit Conversion ──

// Unit conversion factors — backend stores all capacity in SQFT.
// These convert user input from other units → SQFT.
//
//   SQM:    1 m² = 10.764 SQFT
//   Pallet: EUR pallet (1.2m × 1.0m) = 1.2 m² = 12.917 SQFT
export const CONVERSION_TO_SQFT = {
  SQFT: 1,
  SQM: 10.764,
  Pallet: 12.917
};

// Display labels for each unit type
export const UNIT_LABELS = {
  SQFT: 'SQFT',
  SQM: 'SQM',
  Pallet: 'Pallets'
};

// Validation prompt labels for the search form
export const VALIDATION_LABELS = {
  SQFT: 'area in SQFT',
  SQM: 'area in SQM',
  Pallet: 'number of pallets'
};

// ── Filter Options ──
// Each array defines { id, value, label } for its filter section.
// "value" is what gets stored/compared; "label" is what's displayed.

// Main locations for the search dropdown
export const MAIN_LOCATIONS = [
  { value: 'Dubai',         label: 'Dubai' },
  { value: 'Sharjah',       label: 'Sharjah' },
  { value: 'Ajman',         label: 'Ajman' },
  { value: 'Umm Al Quwain', label: 'Umm Al Quwain' },
  { value: 'Abu Dhabi',     label: 'Abu Dhabi' },
  { value: 'RAK',           label: 'RAK' },
];

// Sub-locations mapped to each main location (shown in the filter sidebar)
export const SUB_LOCATIONS = {
  'Dubai': [
    { id: 'loc-alquoz',    value: 'Al Quoz',                   label: 'Al Quoz' },
    { id: 'loc-alqusais',  value: 'Al Qusais',                 label: 'Al Qusais' },
    { id: 'loc-ruwayyah',  value: 'Al Ruwayyah',               label: 'Al Ruwayyah' },
    { id: 'loc-khabaisi',  value: 'Al Khabaisi',               label: 'Al Khabaisi' },
    { id: 'loc-dmc',       value: 'DMC',                        label: 'DMC' },
    { id: 'loc-dic',       value: 'Dubai International City',   label: 'Dubai International City' },
    { id: 'loc-dip',       value: 'DIP',                       label: 'DIP' },
    { id: 'loc-jafza',     value: 'Jafza',                     label: 'Jafza' },
    { id: 'loc-jaia',      value: 'Jebel Ali Industrial Area',  label: 'Jebel Ali Industrial Area' },
    { id: 'loc-rak',       value: 'Ras Al Khor',                label: 'Ras Al Khor' },
    { id: 'loc-ummramool', value: 'Umm Ramool',                label: 'Umm Ramool' },
  ],
  'Sharjah': [
    { id: 'loc-sia', value: 'Sharjah Industrial Area', label: 'Sharjah Industrial Area' },
  ],
  'Ajman': [
    { id: 'loc-aia', value: 'Ajman Industrial Area', label: 'Ajman Industrial Area' },
  ],
  'Umm Al Quwain': [
    { id: 'loc-uaqia', value: 'Umm Al Quwain Industrial Area', label: 'Umm Al Quwain Industrial Area' },
  ],
  'Abu Dhabi': [
    { id: 'loc-kizad',   value: 'KIZAD',        label: 'KIZAD' },
    { id: 'loc-mussafah', value: 'Mussafah',    label: 'Mussafah' },
    { id: 'loc-icad',    value: 'ICAD',          label: 'ICAD' },
    { id: 'loc-masdar',  value: 'MASDAR CITY',   label: 'MASDAR CITY' },
  ],
  'RAK': [
    { id: 'loc-jazeera', value: 'AL JAZEERA',          label: 'AL JAZEERA' },
    { id: 'loc-rakia',   value: 'RAK Industrial Area',  label: 'RAK Industrial Area' },
  ],
};

export const CARGO_TYPE_OPTIONS = [
  { id: 'cargo-general',   value: 'General Cargo',      label: 'General Cargo' },
  { id: 'cargo-food',      value: 'Food and Beverages', label: 'Food and Beverages' },
  { id: 'cargo-dangerous', value: 'Dangerous Goods',    label: 'Dangerous Goods' },
  { id: 'cargo-chemicals', value: 'Chemicals',          label: 'Chemicals' },
  { id: 'cargo-medical',   value: 'Medical',            label: 'Medical' },
  { id: 'cargo-pharma',    value: 'Pharma',             label: 'Pharma' },
];

export const STORAGE_TYPE_OPTIONS = [
  { id: 'st-bulk',       value: 'Bulk Space',      label: 'Bulk Space' },
  { id: 'st-rack',       value: 'Rack Space',      label: 'Rack Space' },
  { id: 'st-individual', value: 'Individual Unit',  label: 'Individual Unit' },
  { id: 'st-lockable',   value: 'Lockable Unit',    label: 'Lockable Unit' },
  { id: 'st-cage',       value: 'Cage',             label: 'Cage' },
  { id: 'st-openyard',   value: 'Open Yard',        label: 'Open Yard' },
  { id: 'st-closedyard', value: 'Closed Yard',      label: 'Closed Yard' },
];

export const TEMPERATURE_OPTIONS = [
  { id: 'temp-ac',      value: 'Air Conditioned',     label: 'Air Conditioned' },
  { id: 'temp-nonac',   value: 'Non-Air Conditioned', label: 'Non-Air Conditioned' },
  { id: 'temp-ambient', value: 'Ambient',              label: 'Ambient (21°C to 25°C)' },
  { id: 'temp-chilled', value: 'Chilled Storage',      label: 'Chilled Storage (1°C to 5°C)' },
  { id: 'temp-cold',    value: 'Cold Storage',          label: 'Cold Storage (-18°C to 0°C)' },
  { id: 'temp-frozen',  value: 'Frozen',                label: 'Frozen (-30°C to -17°C)' },
  { id: 'temp-cool',    value: 'Cool Storage',          label: 'Cool Storage (6°C to 20°C)' },
  { id: 'temp-open',    value: 'Open Area',             label: 'Open Area' },
];

// Star ratings from 5 down to 1
export const STAR_RATING_OPTIONS = [5, 4, 3, 2, 1];

// Pagination
export const PAGE_SIZE = 20;

// Reusable SVG path for a star icon
export const STAR_SVG_PATH = 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z';

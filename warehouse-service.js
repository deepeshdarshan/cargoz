// Warehouse Search Service — Firestore queries
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import firebaseConfig from "./firebase-config.js";
import { CONVERSION_TO_SQFT } from "./constants.js";

// Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Convert a value from the given unit to SQFT.
 * @param {number} value
 * @param {string} fromUnit - "SQFT" | "SQM" | "Pallet"
 * @returns {number} - value in SQFT
 */
export function convertToSqft(value, fromUnit) {
  const factor = CONVERSION_TO_SQFT[fromUnit] || 1;
  return value * factor;
}

/**
 * Convert a SQFT value to the given display unit.
 * @param {number} sqftValue
 * @param {string} toUnit - "SQFT" | "SQM" | "Pallet"
 * @returns {number}
 */
export function convertFromSqft(sqftValue, toUnit) {
  const factor = CONVERSION_TO_SQFT[toUnit] || 1;
  return sqftValue / factor;
}

/**
 * Search warehouses by location (country).
 * Additional filtering (capacity, storage type) is done client-side.
 *
 * @param {string} location - Country name in lowercase (e.g. "uae", "saudi arabia")
 * @returns {Promise<Array>} - Array of warehouse objects
 */
export async function searchByLocation(location) {
  const warehousesRef = collection(db, "warehouses");
  const q = query(
    warehousesRef,
    where("location", "==", location)
  );

  const snapshot = await getDocs(q);
  const results = [];

  snapshot.forEach((doc) => {
    results.push({ id: doc.id, ...doc.data() });
  });

  return results;
}

/**
 * Normalise a unit string from the database to its CONVERSION_TO_SQFT key.
 * e.g. "Sqft" → "SQFT", "sqm" → "SQM", "pallet" → "Pallet", "pallets" → "Pallet"
 *
 * @param {string} unit - raw unit value from the warehouse document
 * @returns {string} - normalised key that exists in CONVERSION_TO_SQFT
 */
function normaliseUnit(unit) {
  if (!unit) return 'SQFT';
  const u = unit.trim().toLowerCase();
  if (u === 'sqft' || u === 'sq ft' || u === 'sq.ft')  return 'SQFT';
  if (u === 'sqm'  || u === 'sq m'  || u === 'sq.m')   return 'SQM';
  if (u === 'pallet' || u === 'pallets')                return 'Pallet';
  return 'SQFT'; // fallback
}

/**
 * Client-side filter: keep only warehouses whose capacity is exactly equal
 * to the user's requirement after converting both values to a common unit (SQFT).
 *
 * Each warehouse stores its own `capacity` + `unit` (e.g. 400 Sqft, 50 SQM,
 * 30 Pallets).  The user's search value may be in any supported unit.
 * Both are converted to SQFT and compared.
 *
 * @param {Array}  warehouses   - Array of warehouse objects from Firestore
 * @param {string} storageType  - "SQFT" | "SQM" | "Pallet" (user's chosen unit)
 * @param {number|null} value   - Required area in the user's chosen unit
 * @returns {Array} - Filtered array
 */
export function filterByCapacity(warehouses, storageType, value) {
  if (!value || value <= 0) {
    return warehouses;
  }

  // Convert user input to SQFT
  const requiredSqft = convertToSqft(value, storageType);

  return warehouses.filter((wh) => {
    const whCapacity = parseFloat(wh.capacity) || 0;
    const whUnit = normaliseUnit(wh.unit);

    // Convert warehouse capacity to SQFT using its own unit
    const whCapacitySqft = convertToSqft(whCapacity, whUnit);

    // Compare in SQFT (round to 2 decimals to avoid floating-point drift)
    return Math.round(whCapacitySqft * 100) === Math.round(requiredSqft * 100);
  });
}

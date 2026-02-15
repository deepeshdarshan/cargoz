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
 * @param {string} fromUnit - "SQFT" | "CBM" | "Pallet"
 * @returns {number} - value in SQFT
 */
export function convertToSqft(value, fromUnit) {
  const factor = CONVERSION_TO_SQFT[fromUnit] || 1;
  return value * factor;
}

/**
 * Convert a SQFT value to the given display unit.
 * @param {number} sqftValue
 * @param {string} toUnit - "SQFT" | "CBM" | "Pallet"
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
 * Client-side filter: keep only warehouses whose capacity (stored in SQFT)
 * meets the user's requirement (which may be in CBM or Pallets).
 *
 * The user's value is first converted to SQFT before comparison.
 *
 * @param {Array}  warehouses   - Array of warehouse objects from Firestore
 * @param {string} storageType  - "SQFT" | "CBM" | "Pallet"
 * @param {number|null} value   - Required area/volume in the user's chosen unit
 * @returns {Array} - Filtered array
 */
export function filterByCapacity(warehouses, storageType, value) {
  if (!value || value <= 0) {
    return warehouses;
  }

  // Convert user input to SQFT for comparison against backend data
  const requiredSqft = convertToSqft(value, storageType);

  return warehouses.filter((wh) => {
    const capacitySqft = parseFloat(wh.capacity) || 0;
    return capacitySqft === requiredSqft;
  });
}

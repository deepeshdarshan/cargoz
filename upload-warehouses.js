/**
 * Utility: Upload warehouse JSON data to Firestore "warehouses" collection.
 *
 * Usage:
 *   1. Open upload-warehouses.html in a browser (served via a local HTTP server).
 *   2. Paste your warehouse JSON array into the textarea.
 *   3. Click "Validate JSON" to check the format, then "Start Upload".
 *   4. Each object is cleaned (trimmed whitespace, normalised keys) and uploaded
 *      as a new document in the "warehouses" collection.
 *   5. Progress and results are logged to the browser console and on-screen.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import firebaseConfig from "./firebase-config.js";

// ── Initialise Firebase ──
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// ══════════════════════════════════════════════════════════════
// ── Data Normalisation ──
// ══════════════════════════════════════════════════════════════

/** Uppercase acronyms that should not be title-cased */
const PRESERVE_UPPERCASE = ['UAE', 'RAK', 'ICAD', 'KIZAD', 'DMC', 'DMCC'];

/**
 * Title-case a string: "DUBAI" → "Dubai", "AL QUOZ" → "Al Quoz".
 * Preserves known uppercase acronyms like "UAE", "RAK", etc.
 * @param {string} str — raw string
 * @returns {string} title-cased string
 */
function toTitleCase(str) {
  if (typeof str !== 'string') return str;
  return str.split(' ').map(word => {
    if (PRESERVE_UPPERCASE.includes(word.toUpperCase())) return word.toUpperCase();
    if (word.toUpperCase() === 'MASDAR') return 'Masdar';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}

/**
 * Trim string values and normalise common key inconsistencies
 * so the data is clean before it hits Firestore.
 * @param {Object} raw — a single raw warehouse JSON object
 * @returns {Object} cleaned warehouse document
 */
function normaliseWarehouse(raw) {
  const doc = {};

  for (const [key, value] of Object.entries(raw)) {
    // Trim the key itself (some keys have trailing spaces like "cargoType ")
    const cleanKey = key.trim();

    // Replace NaN with empty string, trim string values
    const cleanValue = (typeof value === 'number' && isNaN(value))
      ? ''
      : (typeof value === 'string' ? value.trim() : value);

    // Map known alternate key names → canonical names used in the app
    switch (cleanKey) {
      case 'Type of Warehouse':
        doc['typeOfWarehouse'] = cleanValue;
        break;
      case 'starGrading':
        doc['starRating'] = cleanValue;
        break;
      case 'location':
        doc['location'] = toTitleCase(cleanValue);
        break;
      case 'area':
        doc['area'] = toTitleCase(cleanValue);
        break;
      case 'cargoType':
        doc['cargoType'] = cleanValue;
        break;
      case 'temperature':
        // Normalise "Non Air Conditioned" → "Non-Air Conditioned"
        doc['temperature'] = typeof cleanValue === 'string'
          ? cleanValue.replace(/Non Air Conditioned/i, 'Non-Air Conditioned')
          : cleanValue;
        break;
      default:
        doc[cleanKey] = cleanValue;
    }
  }

  return doc;
}


// ══════════════════════════════════════════════════════════════
// ── Upload Logic ──
// ══════════════════════════════════════════════════════════════

/**
 * Upload an array of warehouse objects to Firestore.
 * Each object is normalised before upload.
 * @param {Array}    warehouses — array of raw warehouse JSON objects
 * @param {Function} onProgress — optional callback(done, total) for progress updates
 * @returns {Promise<{success: number, failed: number, errors: Array}>}
 */
export async function uploadWarehouses(warehouses, onProgress) {
  const warehousesRef = collection(db, 'warehouses');
  let success = 0;
  let failed = 0;
  const errors = [];

  console.log(`Starting upload of ${warehouses.length} warehouse(s)...`);

  for (let i = 0; i < warehouses.length; i++) {
    const raw = warehouses[i];
    const normalised = normaliseWarehouse(raw);

    try {
      const docRef = await addDoc(warehousesRef, normalised);
      success++;
      if (onProgress) onProgress(i + 1, warehouses.length);
      console.log(`✓ [${i + 1}/${warehouses.length}] Uploaded "${normalised.name || 'unnamed'}" → ${docRef.id}`);
    } catch (err) {
      failed++;
      errors.push({ index: i, name: raw.name, error: err.message });
      console.error(`✗ [${i + 1}/${warehouses.length}] Failed "${raw.name || 'unnamed'}":`, err.message);
    }
  }

  console.log(`\nUpload complete: ${success} succeeded, ${failed} failed.`);
  return { success, failed, errors };
}


// ══════════════════════════════════════════════════════════════
// ── Textarea JSON Parsing ──
// ══════════════════════════════════════════════════════════════

/**
 * Parse the JSON from the textarea input.
 * Shows an error message in the status element if parsing fails.
 * @returns {Array|null} parsed array of warehouse objects, or null on error
 */
function parseJsonInput() {
  const status = document.getElementById('uploadStatus');
  const jsonText = document.getElementById('jsonInput').value.trim();

  if (!jsonText) {
    status.textContent = 'Please paste your JSON array into the textarea.';
    status.style.color = '#f87171';
    return null;
  }

  let data;
  try {
    data = JSON.parse(jsonText);
  } catch (err) {
    status.textContent = 'Invalid JSON: ' + err.message;
    status.style.color = '#f87171';
    return null;
  }

  if (!Array.isArray(data)) {
    status.textContent = 'JSON must be an array of objects, e.g. [{ ... }, { ... }]';
    status.style.color = '#f87171';
    return null;
  }

  if (data.length === 0) {
    status.textContent = 'The JSON array is empty. Nothing to upload.';
    status.style.color = '#f87171';
    return null;
  }

  return data;
}


// ══════════════════════════════════════════════════════════════
// ── Expose Functions for HTML Page ──
// ══════════════════════════════════════════════════════════════

/**
 * Validate the JSON in the textarea without uploading.
 * Shows a success or error message.
 */
window.validateJson = function () {
  const status = document.getElementById('uploadStatus');
  const data = parseJsonInput();
  if (!data) return;

  status.style.color = '#3ecfb1';
  status.textContent = `✓ Valid JSON — ${data.length} warehouse(s) found. Ready to upload.`;
};

/**
 * Parse the textarea JSON, then upload all warehouses to Firestore.
 * Disables the button during upload and shows real-time progress.
 */
window.startUpload = async function () {
  const btn = document.getElementById('startBtn');
  const status = document.getElementById('uploadStatus');

  const data = parseJsonInput();
  if (!data) return;

  btn.disabled = true;
  btn.textContent = 'Uploading...';
  status.textContent = `Uploading 0 / ${data.length}...`;
  status.style.color = '#fbbf24';

  const result = await uploadWarehouses(data, (done, total) => {
    status.textContent = `Uploading ${done} / ${total}...`;
  });

  btn.disabled = false;
  btn.textContent = 'Start Upload';
  status.style.color = result.failed > 0 ? '#f87171' : '#3ecfb1';
  status.textContent = `Upload complete: ${result.success} succeeded, ${result.failed} failed.`;
};

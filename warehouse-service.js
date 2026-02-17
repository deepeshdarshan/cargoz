// ═══════════════════════════════════════════════════════════
// CargoZ — Warehouse Search Service + UI Logic
// ═══════════════════════════════════════════════════════════
//
// This module handles:
//   1. Firebase/Firestore integration (fetching warehouse data)
//   2. Unit conversion and capacity filtering
//   3. UI rendering (cards, filters, pagination)
//   4. Search form handling and URL parameter auto-search
//
// Entry point: init() — called once from index.html
// ═══════════════════════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import firebaseConfig from "./firebase-config.js";
import {
  CONVERSION_TO_SQFT, UNIT_LABELS, VALIDATION_LABELS,
  MAIN_LOCATIONS, SUB_LOCATIONS,
  CARGO_TYPE_OPTIONS, STORAGE_TYPE_OPTIONS,
  TEMPERATURE_OPTIONS, STAR_RATING_OPTIONS, STAR_SVG_PATH,
  PAGE_SIZE
} from "./constants.js";


// ══════════════════════════════════════════
// ── Section 1: Firebase Initialisation ──
// ══════════════════════════════════════════

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// ══════════════════════════════════════════
// ── Section 2: Unit Conversion Helpers ──
// ══════════════════════════════════════════

/**
 * Convert a value from the given unit to SQFT.
 * Uses the CONVERSION_TO_SQFT lookup from constants.
 * @param {number} value   — the numeric value to convert
 * @param {string} fromUnit — "SQFT" | "SQM" | "Pallet"
 * @returns {number} equivalent value in SQFT
 */
export function convertToSqft(value, fromUnit) {
  const factor = CONVERSION_TO_SQFT[fromUnit] || 1;
  return value * factor;
}

/**
 * Convert a SQFT value back to the given display unit.
 * @param {number} sqftValue — value in SQFT
 * @param {string} toUnit    — "SQFT" | "SQM" | "Pallet"
 * @returns {number} equivalent value in the target unit
 */
export function convertFromSqft(sqftValue, toUnit) {
  const factor = CONVERSION_TO_SQFT[toUnit] || 1;
  return sqftValue / factor;
}

/**
 * Normalise a unit string from the database to its canonical key.
 * Handles variations like "Sqft", "sq ft", "sq.m", "pallets" etc.
 * Falls back to "SQFT" if the unit is unrecognised or empty.
 * @param {string} unit — raw unit string from Firestore
 * @returns {string} "SQFT" | "SQM" | "Pallet"
 */
function normaliseUnit(unit) {
  if (!unit) return 'SQFT';
  const u = unit.trim().toLowerCase();
  if (u === 'sqft' || u === 'sq ft' || u === 'sq.ft')  return 'SQFT';
  if (u === 'sqm'  || u === 'sq m'  || u === 'sq.m')   return 'SQM';
  if (u === 'pallet' || u === 'pallets')                return 'Pallet';
  return 'SQFT';
}


// ══════════════════════════════════════════
// ── Section 3: Firestore Data Layer ──
// ══════════════════════════════════════════

/**
 * Fetch all warehouses in a given main location from Firestore.
 * @param {string} location — main location value (e.g. "Dubai")
 * @returns {Promise<Array<Object>>} array of warehouse objects
 */
export async function searchByLocation(location) {
  const warehousesRef = collection(db, "warehouses");
  const q = query(warehousesRef, where("location", "==", location));
  const snapshot = await getDocs(q);

  const results = [];
  snapshot.forEach((doc) => {
    results.push({ id: doc.id, ...doc.data() });
  });
  return results;
}


// ══════════════════════════════════════════
// ── Section 4: Capacity Filtering ──
// ══════════════════════════════════════════

/**
 * Client-side filter: retain only warehouses whose capacity
 * exactly matches the user's requirement.
 *
 * Both the user's input and each warehouse's capacity are
 * normalised to SQFT before comparison, enabling cross-unit
 * matching (e.g. searching in SQM finds SQFT warehouses).
 *
 * Comparison uses rounding to 2 decimal places to avoid
 * floating-point precision issues.
 *
 * @param {Array}       warehouses  — full warehouse list
 * @param {string}      storageType — user's selected unit ("SQFT" | "SQM" | "Pallet")
 * @param {number|null} value       — user's capacity value (null = no filter)
 * @returns {Array} filtered warehouses
 */
export function filterByCapacity(warehouses, storageType, value) {
  if (!value || value <= 0) {
    return warehouses;
  }

  // Convert the user's search value to a common unit (SQFT)
  const requiredSqft = convertToSqft(value, storageType);

  return warehouses.filter((wh) => {
    const whCapacity = parseFloat(wh.capacity) || 0;
    const whUnit = normaliseUnit(wh.unit);
    const whCapacitySqft = convertToSqft(whCapacity, whUnit);

    // Round both to 2 decimal places to avoid floating-point mismatch
    return Math.round(whCapacitySqft * 100) === Math.round(requiredSqft * 100);
  });
}


// ══════════════════════════════════════════
// ── Section 5: Application State ──
// ══════════════════════════════════════════

/** Raw search results from Firestore (after capacity filtering) */
let currentResults = [];

/** User's selected storage type for the current search */
let currentStorageType = 'SQFT';

/** Results after applying sidebar filters and sorting */
let filteredSorted = [];

/** Current pagination page (1-indexed) */
let currentPage = 1;

/** Warehouses displayed on the current page (used by goToDetail) */
let currentPageWarehouses = [];


// ══════════════════════════════════════════
// ── Section 6: Filter Rendering ──
// ══════════════════════════════════════════

/**
 * Render a set of checkbox filter options into a container.
 * Each checkbox triggers applyFilters() on change.
 * @param {string} containerId — DOM id of the filter body container
 * @param {string} groupName   — data-group attribute for grouping checkboxes
 * @param {Array}  options     — array of { id, value, label }
 */
function renderCheckboxFilter(containerId, groupName, options) {
  const container = document.getElementById(containerId);
  container.innerHTML = options.map(opt => `
    <div class="cgz-filter-option">
      <input type="checkbox" id="${opt.id}" data-group="${groupName}" value="${opt.value}" onchange="applyFilters()">
      <label for="${opt.id}">${opt.label}</label>
    </div>
  `).join('');
}

/**
 * Render the star-rating filter section with visual star icons.
 * @param {string} containerId — DOM id of the star rating filter body
 */
function renderStarRatingFilter(containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = STAR_RATING_OPTIONS.map(rating => {
    const starsHtml = Array.from({ length: 5 }, (_, i) => {
      const cls = i < rating ? 'cgz-star-icon' : 'cgz-star-icon cgz-empty';
      return `<svg class="${cls}" viewBox="0 0 20 20" fill="currentColor"><path d="${STAR_SVG_PATH}"/></svg>`;
    }).join('');

    return `
      <div class="cgz-filter-option">
        <input type="checkbox" id="star-${rating}" data-group="filterStarRating" value="${rating}" onchange="applyFilters()">
        <label for="star-${rating}" class="cgz-star-row"><span class="cgz-stars">${starsHtml}</span></label>
      </div>`;
  }).join('');
}

/**
 * Populate the sub-location filter for a given main location.
 * Called after a search to show relevant sub-locations only.
 * @param {string} mainLocation — the selected main location key
 */
function updateLocationFilter(mainLocation) {
  const subLocations = SUB_LOCATIONS[mainLocation] || [];
  renderCheckboxFilter('cgz-filterLocationBody', 'filterLocation', subLocations);
}


// ══════════════════════════════════════════
// ── Section 7: Search Form UI Helpers ──
// ══════════════════════════════════════════

/**
 * Update the area input group based on the selected storage type.
 * Shows/hides the area input and updates unit badge + label text.
 */
function updateUnit() {
  const storageType = document.getElementById('cgz-storageType').value;
  const unitBadge   = document.getElementById('cgz-unitBadge');
  const areaLabel   = document.getElementById('cgz-areaLabel');
  const areaGroup   = document.getElementById('cgz-areaGroup');
  const areaInput   = document.getElementById('cgz-areaValue');

  if (!storageType) {
    areaGroup.style.display = 'none';
    areaInput.value = '';
    return;
  }

  areaGroup.style.display = '';

  if (storageType === 'SQFT') {
    unitBadge.textContent = 'SQFT';
    areaLabel.textContent = 'Required Area';
  } else if (storageType === 'SQM') {
    unitBadge.textContent = 'SQM';
    areaLabel.textContent = 'Required Area';
  } else if (storageType === 'Pallet') {
    unitBadge.textContent = 'Pallets';
    areaLabel.textContent = 'No. of Pallets';
  }
}

/**
 * Show the loading spinner in the warehouse list area.
 */
function showLoading() {
  document.getElementById('cgz-contentArea').style.display = 'flex';
  document.getElementById('cgz-warehouseList').innerHTML = `
    <div class="cgz-loading-state">
      <div class="cgz-spinner"></div>
      <p>Searching warehouses...</p>
    </div>`;
}

/**
 * Show a search error message in the warehouse list area.
 * @param {string} errorMessage — the error message to display
 */
function showError(errorMessage) {
  document.getElementById('cgz-warehouseList').innerHTML = `
    <div class="cgz-empty-state">
      <p>Something went wrong. Please try again.</p>
      <p style="font-size:0.75rem;color:#9ca3af;margin-top:0.5rem;">${errorMessage}</p>
    </div>`;
  document.getElementById('cgz-paginationControls').innerHTML = '';
}

/**
 * Show an empty-state message when no results match the search.
 * @param {string} location — the searched location name
 */
function showEmpty(location) {
  document.getElementById('cgz-warehouseList').innerHTML = `
    <div class="cgz-empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
      <p>No warehouses found in <strong>${location}</strong> matching your criteria.</p>
    </div>`;
}


// ══════════════════════════════════════════
// ── Section 8: Sidebar Filter Logic ──
// ══════════════════════════════════════════

/**
 * Uncheck all sidebar filter checkboxes.
 */
function resetFilters() {
  document.querySelectorAll('.cgz-filter-sidebar input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });
}

/**
 * Toggle a collapsible filter section open/closed.
 * @param {HTMLElement} headerEl — the clicked filter header element
 */
function toggleFilter(headerEl) {
  headerEl.closest('.cgz-filter-section').classList.toggle('cgz-collapsed');
}

/**
 * Get the lowercase values of all checked checkboxes in a filter group.
 * @param {string} group — the data-group attribute value
 * @returns {string[]} array of checked values (lowercased)
 */
function getCheckedValues(group) {
  const checkboxes = document.querySelectorAll(`input[data-group="${group}"]:checked`);
  return Array.from(checkboxes).map(cb => cb.value.toLowerCase());
}

/**
 * Check if a warehouse field value matches any of the selected filter values.
 * Uses "includes" matching so partial/compound DB values can match
 * (e.g. "General/Food" matches filter "General").
 * @param {string}   fieldValue     — the warehouse's field value
 * @param {string[]} selectedValues — lowercased checked filter values
 * @returns {boolean} true if the field matches at least one selected value
 */
function matchesFilter(fieldValue, selectedValues) {
  if (selectedValues.length === 0) return true;
  const lower = (fieldValue || '').toLowerCase();
  return selectedValues.some(val => lower.includes(val));
}

/**
 * Filter currentResults using all active sidebar filter selections.
 * Checks: sub-location, cargoType, storageType, temperature, starRating.
 * @returns {Array} filtered warehouse list
 */
function getFilteredWarehouses() {
  const selectedLocations    = getCheckedValues('filterLocation');
  const selectedCargoTypes   = getCheckedValues('filterCargoType');
  const selectedStorageTypes = getCheckedValues('filterStorageType');
  const selectedTemperatures = getCheckedValues('filterTemperature');
  const selectedStarRatings  = getCheckedValues('filterStarRating').map(Number);

  return currentResults.filter(wh => {
    // Sub-location filter (area)
    const whArea = (wh['sub-location'] || wh.area || '').toLowerCase();
    if (selectedLocations.length > 0 && !selectedLocations.some(loc => whArea.includes(loc))) {
      return false;
    }

    // Cargo type filter (uses includes matching for compound values like "General/Food")
    if (!matchesFilter(wh['cargo-type'] || wh.cargoType, selectedCargoTypes)) return false;

    // Storage type filter
    if (!matchesFilter(wh['storage-type'] || wh.storageType, selectedStorageTypes)) return false;

    // Temperature filter (uses includes matching)
    if (!matchesFilter(wh.temperature, selectedTemperatures)) return false;

    // Star rating filter (exact match)
    if (selectedStarRatings.length > 0) {
      const whRating = parseInt(wh['star-rating'] || wh.starRating || 0);
      if (!selectedStarRatings.includes(whRating)) return false;
    }

    return true;
  });
}

/**
 * Sort an array of warehouses based on the selected sort option.
 * @param {Array} warehouses — warehouses to sort (will be sorted in-place)
 * @returns {Array} the same array, now sorted
 */
function sortWarehouses(warehouses) {
  const sortBy = document.getElementById('cgz-sortBy').value;

  if (sortBy === 'capacity-desc') {
    warehouses.sort((a, b) => (parseFloat(b.capacity) || 0) - (parseFloat(a.capacity) || 0));
  } else if (sortBy === 'capacity-asc') {
    warehouses.sort((a, b) => (parseFloat(a.capacity) || 0) - (parseFloat(b.capacity) || 0));
  } else if (sortBy === 'name-asc') {
    warehouses.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  } else if (sortBy === 'name-desc') {
    warehouses.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
  }

  return warehouses;
}

/**
 * Main filter+sort pipeline: filter → sort → reset to page 1 → render.
 * Called whenever a sidebar filter checkbox or sort dropdown changes.
 */
function applyFilters() {
  const filtered = getFilteredWarehouses();
  filteredSorted = sortWarehouses([...filtered]);
  currentPage = 1;
  renderPage();
}

/**
 * Convenience wrapper — re-applies filters and sort, then re-renders.
 * Attached to the sort dropdown's onchange handler.
 */
function applySortAndRender() {
  applyFilters();
}


// ══════════════════════════════════════════
// ── Section 9: Pagination ──
// ══════════════════════════════════════════

/**
 * Render the current page of warehouse cards and pagination controls.
 */
function renderPage() {
  const totalPages = Math.ceil(filteredSorted.length / PAGE_SIZE);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filteredSorted.slice(start, start + PAGE_SIZE);

  renderWarehouses(pageItems);
  renderPagination(totalPages);
}

/**
 * Build the "Previous" pagination button HTML.
 * @returns {string} HTML string
 */
function buildPrevButton() {
  return `<button class="cgz-page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width:14px;height:14px;">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
    Prev
  </button>`;
}

/**
 * Build the "Next" pagination button HTML.
 * @param {number} totalPages — total number of pages
 * @returns {string} HTML string
 */
function buildNextButton(totalPages) {
  return `<button class="cgz-page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">
    Next
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width:14px;height:14px;">
      <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  </button>`;
}

/**
 * Build the numbered page buttons with ellipsis for large page counts.
 * Shows at most `maxVisible` page buttons around the current page.
 * @param {number} totalPages — total number of pages
 * @returns {string} HTML string
 */
function buildPageNumbers(totalPages) {
  let html = '';
  const maxVisible = 5;

  // Calculate the visible page range, centred around the current page
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage   = Math.min(totalPages, startPage + maxVisible - 1);
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  // Leading "1" and ellipsis if the window doesn't start at page 1
  if (startPage > 1) {
    html += `<button class="cgz-page-btn" onclick="goToPage(1)">1</button>`;
    if (startPage > 2) html += `<span class="cgz-page-ellipsis">...</span>`;
  }

  // Numbered page buttons
  for (let p = startPage; p <= endPage; p++) {
    html += `<button class="cgz-page-btn ${p === currentPage ? 'cgz-active' : ''}" onclick="goToPage(${p})">${p}</button>`;
  }

  // Trailing ellipsis and last page number
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) html += `<span class="cgz-page-ellipsis">...</span>`;
    html += `<button class="cgz-page-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
  }

  return html;
}

/**
 * Build the "Showing X–Y of Z" info text.
 * @returns {string} HTML string
 */
function buildPageInfo() {
  const rangeStart = (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd   = Math.min(currentPage * PAGE_SIZE, filteredSorted.length);
  return `<div class="cgz-page-info">Showing ${rangeStart}\u2013${rangeEnd} of ${filteredSorted.length}</div>`;
}

/**
 * Render the full pagination control bar (prev, pages, next, info).
 * Hides itself when there's only one page or less.
 * @param {number} totalPages — total number of pages
 */
function renderPagination(totalPages) {
  const container = document.getElementById('cgz-paginationControls');
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML =
    buildPrevButton() +
    buildPageNumbers(totalPages) +
    buildNextButton(totalPages) +
    buildPageInfo();
}

/**
 * Navigate to a specific page and scroll to the results section.
 * @param {number} page — target page number (1-indexed)
 */
function goToPage(page) {
  const totalPages = Math.ceil(filteredSorted.length / PAGE_SIZE);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderPage();
  document.getElementById('cgz-resultsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}


// ══════════════════════════════════════════
// ── Section 10: View Details Navigation ──
// ══════════════════════════════════════════

/**
 * Navigate to the detail page for a specific warehouse.
 * Serialises all warehouse properties as URL query parameters.
 * @param {number} index — index in the currentPageWarehouses array
 */
function goToDetail(index) {
  const wh = currentPageWarehouses[index];
  if (!wh) return;

  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(wh)) {
    if (val !== null && val !== undefined && val !== '') {
      params.set(key, String(val));
    }
  }

  const url = 'indetail.php?' + params.toString();
  window.location.assign(url);
}


// ══════════════════════════════════════════
// ── Section 11: Warehouse Card Rendering ──
// ══════════════════════════════════════════

/**
 * Extract and normalise display properties from a raw warehouse object.
 * Provides sensible defaults for missing fields.
 * @param {Object} wh — raw warehouse object from Firestore
 * @returns {Object} normalised display properties
 */
function extractCardProps(wh) {
  const capacity = parseFloat(wh.capacity) || 0;
  const rawRate  = parseFloat(wh.rate);

  return {
    capacity,
    whUnit:             wh.unit || 'Sqft',
    displayCap:         capacity.toLocaleString(),
    imageUrl:           wh.imageUrl || wh['image-url'] || '',
    name:               wh.name || wh.id,
    location:           wh.location || '',
    area:               wh.area || '',
    cargoType:          wh.cargoType || '',
    whStorageType:      wh.storageType || '',
    temperature:        wh.temperature || '',
    starRating:         parseInt(wh.starRating || 0),
    typeOfWarehouse:    wh.typeOfWarehouse || '',
    safetyAndSecurity:  wh.safetyAndSecurity || '',
    otherFacilities:    wh.otherFacilities || '',
    rate:               (!isNaN(rawRate) && rawRate > 0) ? rawRate.toFixed(2) : '0.00'
  };
}

/**
 * Build the image section HTML for a warehouse card.
 * Shows a placeholder icon if no image URL is available.
 * @param {string} imageUrl — warehouse image URL
 * @param {string} name     — warehouse name (used as alt text)
 * @returns {string} HTML string
 */
function buildImageHtml(imageUrl, name) {
  // Use the warehouse image if available, otherwise fall back to the default placeholder.
  // The onerror handler catches broken/invalid URLs and swaps in the default image.
  const src = imageUrl || 'assets/wh.png';
  return `<img src="${src}" alt="${name}" onerror="this.onerror=null;this.src='assets/wh.png';" />`;
}

/**
 * Build the star rating icons HTML (filled + empty stars).
 * Always renders exactly 5 stars.
 * @param {number} starRating — integer rating (0–5)
 * @returns {string} HTML string of SVG star icons
 */
function buildStarsHtml(starRating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    const cls = i <= starRating ? 'cgz-star-icon' : 'cgz-star-icon cgz-empty';
    html += `<svg class="${cls}" viewBox="0 0 20 20" fill="currentColor"><path d="${STAR_SVG_PATH}"/></svg>`;
  }
  return html;
}

/**
 * Format the location display string for a warehouse card.
 * Shows "Area, Location" if area exists, otherwise just location.
 * @param {string} area     — sub-location / area name
 * @param {string} location — main location name
 * @returns {string} formatted location text
 */
function buildLocationDisplay(area, location) {
  if (area) {
    return `${area}, ${location.charAt(0).toUpperCase() + location.slice(1)}`;
  }
  return location.toUpperCase();
}

/**
 * Build a single tag element with an SVG icon.
 * @param {string} svgPath — the SVG <path> d attribute
 * @param {string} label   — the tag text
 * @returns {string} HTML string for one tag
 */
function buildTag(svgPath, label) {
  return `<span class="cgz-tag">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="${svgPath}" />
    </svg>
    ${label}
  </span>`;
}

/**
 * Build all property tag elements for a warehouse card.
 * Conditionally renders each tag only if its value is non-empty.
 * @param {Object} props — normalised card properties from extractCardProps
 * @returns {string} HTML string of all tags
 */
function buildTagsHtml(props) {
  const tags = [];

  // Cargo type
  if (props.cargoType) {
    tags.push(buildTag(
      'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z',
      props.cargoType
    ));
  }

  // Type of warehouse
  if (props.typeOfWarehouse) {
    tags.push(buildTag(
      'M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z',
      props.typeOfWarehouse
    ));
  }

  // Storage type
  if (props.whStorageType) {
    tags.push(buildTag(
      'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21',
      props.whStorageType
    ));
  }

  // Temperature
  if (props.temperature) {
    tags.push(buildTag(
      'M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z',
      props.temperature
    ));
  }

  // Capacity (always shown)
  tags.push(buildTag(
    'M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75l-5.571-3m11.142 0 4.179 2.25L12 17.25l-9.75-5.25 4.179-2.25',
    `${props.displayCap} ${props.whUnit}`
  ));

  // Safety & Security
  if (props.safetyAndSecurity) {
    tags.push(buildTag(
      'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z',
      props.safetyAndSecurity
    ));
  }

  // Other facilities
  if (props.otherFacilities) {
    tags.push(buildTag(
      'M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.049.58.025 1.194-.14 1.743',
      props.otherFacilities
    ));
  }

  return tags.join('\n');
}

/**
 * Build the complete HTML for a single warehouse card.
 * @param {Object} wh  — raw warehouse object from Firestore
 * @param {number} idx — index in the current page array (for goToDetail)
 * @returns {string} HTML string for one card
 */
function buildCardHtml(wh, idx) {
  const props           = extractCardProps(wh);
  const imageHtml       = buildImageHtml(props.imageUrl, props.name);
  const starsHtml       = buildStarsHtml(props.starRating);
  const locationDisplay = buildLocationDisplay(props.area, props.location);
  const tagsHtml        = buildTagsHtml(props);

  return `
    <div class="cgz-warehouse-card">
      <div class="cgz-card-image">${imageHtml}</div>
      <div class="cgz-card-body">
        <div class="cgz-card-info">
          <h3 style="display:inline-flex;align-items:center;gap:0.4rem;">${props.name} <span class="cgz-stars">${starsHtml}</span></h3>
          <div class="cgz-card-location">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            ${locationDisplay}
          </div>
          <div class="cgz-card-tags">
            ${tagsHtml}
          </div>
        </div>
        <div class="cgz-card-meta">
          <div>
            <div class="cgz-card-rate"><span>AED</span> <strong>${props.rate}</strong></div>
            <div class="cgz-rate-label">per month + VAT</div>
          </div>
          <button class="cgz-view-details-btn" onclick="event.preventDefault();event.stopPropagation();goToDetail(${idx});">
            View details
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>`;
}

/**
 * Render a list of warehouse cards into the DOM.
 * Shows an empty state if the list is empty.
 * Stores the list in currentPageWarehouses for goToDetail lookups.
 * @param {Array} warehouses — warehouses to render on this page
 */
function renderWarehouses(warehouses) {
  const list = document.getElementById('cgz-warehouseList');

  if (warehouses.length === 0) {
    const location = document.getElementById('cgz-location').value;
    showEmpty(location);
    document.getElementById('cgz-paginationControls').innerHTML = '';
    return;
  }

  // Store for goToDetail index lookups
  currentPageWarehouses = warehouses;

  list.innerHTML = warehouses.map((wh, idx) => buildCardHtml(wh, idx)).join('');
}


// ══════════════════════════════════════════
// ── Section 12: Initialisation ──
// ══════════════════════════════════════════

/**
 * Populate the main location search dropdown from MAIN_LOCATIONS.
 * @returns {HTMLSelectElement} the location select element
 */
function populateLocationDropdown() {
  const locationSelect = document.getElementById('cgz-location');
  locationSelect.innerHTML = MAIN_LOCATIONS.map(loc =>
    `<option value="${loc.value}">${loc.label}</option>`
  ).join('');
  return locationSelect;
}

/**
 * Populate all static sidebar filter sections
 * (cargo type, storage type, temperature, star rating).
 */
function populateStaticFilters() {
  renderCheckboxFilter('cgz-filterCargoTypeBody',   'filterCargoType',   CARGO_TYPE_OPTIONS);
  renderCheckboxFilter('cgz-filterStorageTypeBody', 'filterStorageType', STORAGE_TYPE_OPTIONS);
  renderCheckboxFilter('cgz-filterTemperatureBody', 'filterTemperature', TEMPERATURE_OPTIONS);
  renderStarRatingFilter('cgz-filterStarRatingBody');
}

/**
 * Expose functions to the global window scope so that
 * inline HTML handlers (onclick, onchange) can call them.
 */
function exposeGlobalHandlers() {
  window.updateUnit         = updateUnit;
  window.toggleFilter       = toggleFilter;
  window.applyFilters       = applyFilters;
  window.resetFilters       = resetFilters;
  window.applySortAndRender = applySortAndRender;
  window.goToPage           = goToPage;
  window.goToDetail         = goToDetail;
}

/**
 * Attach the submit handler to the search form.
 * Handles validation, loading state, Firestore query, and rendering.
 */
function setupSearchForm() {
  document.getElementById('cgz-warehouseSearchForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const location    = document.getElementById('cgz-location').value;
    const storageType = document.getElementById('cgz-storageType').value;
    const areaValue   = document.getElementById('cgz-areaValue').value;

    // Validate: if a storage type is chosen, area value is required
    if (storageType && !areaValue) {
      alert('Please enter the required ' + (VALIDATION_LABELS[storageType] || 'value') + '.');
      document.getElementById('cgz-areaValue').focus();
      return;
    }

    const value = areaValue ? parseFloat(areaValue) : null;
    currentStorageType = storageType || 'SQFT';

    // Update results heading
    const locationLabel = document.getElementById('cgz-location').selectedOptions[0].text;
    document.getElementById('cgz-resultsTitle').textContent = `${locationLabel}: Top picks for you`;

    const searchBtn = document.getElementById('cgz-searchBtn');
    searchBtn.classList.add('cgz-loading');
    resetFilters();
    updateLocationFilter(location);
    showLoading();

    try {
      const warehouses = await searchByLocation(location);
      currentResults = filterByCapacity(warehouses, currentStorageType, value);
      applySortAndRender();
    } catch (error) {
      console.error('Search failed:', error);
      showError(error.message);
    } finally {
      searchBtn.classList.remove('cgz-loading');
    }
  });
}

/**
 * Read URL query parameters and auto-fill the search form if valid.
 *
 * Supported params:
 *   - location (required) — main location to search
 *   - type     (optional) — "sqft" | "sqm" | "pallet" | "all"
 *   - area     (optional) — numeric capacity value (only if type is set)
 *
 * If a valid location is found, the search is triggered automatically.
 *
 * @param {HTMLSelectElement} locationSelect — the location dropdown element
 */
function handleUrlParams(locationSelect) {
  const urlParams     = new URLSearchParams(window.location.search);
  const locationParam = urlParams.get('location');

  if (!locationParam) return;

  // Case-insensitive match against known main locations
  const match = MAIN_LOCATIONS.find(
    loc => loc.value.toLowerCase() === locationParam.trim().toLowerCase()
  );
  if (!match) return;

  locationSelect.value = match.value;

  // Pre-fill type of storage if provided
  const typeParam = urlParams.get('type');
  if (typeParam) {
    const typeKey = typeParam.trim().toLowerCase();

    if (typeKey === 'all') {
      // "all" = no storage type filter — leave dropdown at "All Types"
      document.getElementById('cgz-storageType').value = '';
    } else {
      const typeMap  = { sqft: 'SQFT', sqm: 'SQM', pallet: 'Pallet' };
      const resolved = typeMap[typeKey];

      if (resolved) {
        document.getElementById('cgz-storageType').value = resolved;
        updateUnit();

        // Pre-fill area/capacity value if provided
        const areaParam = urlParams.get('area');
        if (areaParam && !isNaN(parseFloat(areaParam))) {
          document.getElementById('cgz-areaValue').value = parseFloat(areaParam);
        }
      }
    }
  }

  // Trigger the search programmatically
  document.getElementById('cgz-warehouseSearchForm').dispatchEvent(new Event('submit'));
}

/**
 * Bootstrap the CargoZ warehouse search UI.
 * Call this once from a <script type="module"> in index.html.
 *
 * Orchestrates:
 *   1. Dropdown population
 *   2. Sidebar filter rendering
 *   3. Global handler exposure
 *   4. Search form event binding
 *   5. URL parameter auto-search
 */
export function init() {
  const locationSelect = populateLocationDropdown();
  populateStaticFilters();
  exposeGlobalHandlers();
  setupSearchForm();
  handleUrlParams(locationSelect);
}

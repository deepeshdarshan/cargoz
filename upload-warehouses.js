/**
 * Utility: Upload warehouse JSON data to Firestore "warehouses" collection.
 *
 * Usage:
 *   1. Open upload-warehouses.html in a browser (served via a local HTTP server).
 *   2. The script reads warehouse data from the `WAREHOUSE_DATA` array below.
 *   3. Each object is cleaned (trimmed whitespace, normalised keys) and uploaded
 *      as a new document in the "warehouses" collection.
 *   4. Progress and results are logged to the browser console.
 *
 * You can also import this module from the browser DevTools console or another
 * ES-module script if you prefer.
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
// ▶  PASTE YOUR WAREHOUSE JSON ARRAY HERE
// ══════════════════════════════════════════════════════════════
const WAREHOUSE_DATA = [
  {
    "name": "SWH-10101",
    "area": "Al Quoz ",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 10000,
    "unit": "Sqft",
    "starGrading": 4.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors / Pest Control / ",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "Loading Bay, 2 Forklifts",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10101\\listing1.webp"
},
{
    "name": "SWH-10102",
    "area": "Jafza",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 550,
    "unit": "Sqm",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors / Pest Control / ",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "Loading Bay, 1 Forklifts",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10102\\listing1.webp"
},
{
    "name": "SWH-10103",
    "area": "Ras Al Khor",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 250,
    "unit": "Sqm",
    "starGrading": 2.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": NaN,
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10103\\listing1.webp"
},
{
    "name": "SWH-10104",
    "area": "Umm Ramool",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 500,
    "unit": "Sqm",
    "starGrading": 1.0,
    "safetyAndSecurity": "CCTV / Fire Alarm",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "1 Forklift",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10104\\listing1.webp"
},
{
    "name": "SWH-10105",
    "area": "Al Qusais",
    "location": "Dubai",
    "cargoType ": "General/Food",
    "Type of Warehouse": "General Cargo",
    "storageType": "Rack space / Bulk Space",
    "capacity": 10000,
    "unit": "Sqft",
    "starGrading": 4.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors / Pest Control / ",
    "temperature": " Air Conditioned",
    "otherFacilities": "Loading Bay",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10105\\listing1.webp"
},
{
    "name": "SWH-10106",
    "area": "Al Qusais",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 500,
    "unit": "Sqm",
    "starGrading": 2.0,
    "safetyAndSecurity": "CCTV / Fire Alarm",
    "temperature": " Air Conditioned",
    "otherFacilities": "Loading Bay",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10106\\listing1.webp"
},
{
    "name": "SWH-10107",
    "area": "Jafza",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 12000,
    "unit": "Sqm",
    "starGrading": 2.0,
    "safetyAndSecurity": "CCTV / Fire Alarm",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "6 Loading Bay, Forklifts",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10107\\listing1.webp"
},
{
    "name": "SWH-10108",
    "area": "Al Qusais",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 500,
    "unit": "Sqm",
    "starGrading": 2.0,
    "safetyAndSecurity": "CCTV / Fire Alarm",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": NaN,
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10108\\listing1.webp"
},
{
    "name": "SWH-10109",
    "area": "Al Qusais",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 10000,
    "unit": "Sqft",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors / Pest Control / ",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "3 Forklifts(Small and heavy)",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10109\\listing1.webp"
},
{
    "name": "SWH-10110",
    "area": "Al Qusais",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 7000,
    "unit": "Sqft",
    "starGrading": 2.0,
    "safetyAndSecurity": "CCTV / Fire Alarm",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "Loading Bay",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10110\\listing1.webp"
},
{
    "name": "SWH-10111",
    "area": "Al Qusais",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 5000,
    "unit": "Sqft",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors / Pest Control / ",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "Loading Bay",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10111\\listing1.webp"
},
{
    "name": "SWH-10112",
    "area": "Al Quoz ",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 40000,
    "unit": "Sqft",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors / Pest Control / ",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "Rented Forklifts",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10112\\listing1.webp"
},
{
    "name": "SWH-10113",
    "area": "Ras Al Khor",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 500,
    "unit": "Sqm",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors / Pest Control / ",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "Rented Forklifts",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10113\\listing1.webp"
},
{
    "name": "SWH-10114",
    "area": "Ras Al Khor",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 400,
    "unit": "Sqm",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors / Pest Control / ",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "Rented Forklifts",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10114\\listing1.webp"
},
{
    "name": "SWH-10115",
    "area": "Ras Al Khor",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 600,
    "unit": "Sqm",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors / Pest Control / ",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "Rented Forklifts",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10115\\listing1.webp"
},
{
    "name": "SWH-10116",
    "area": "Al Qusais",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 550,
    "unit": "Sqm",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors / Pest Control / ",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "Rented Forklifts",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10116\\listing1.webp"
},
{
    "name": "SWH-10117",
    "area": "Umm Ramool",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 750,
    "unit": "Sqm",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors / Pest Control / ",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "Rented Forklifts",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10117\\listing1.webp"
},
{
    "name": "SWH-10118",
    "area": "Umm Ramool",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 500,
    "unit": "Sqm",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors / Pest Control / ",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "Rented Forklifts",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10118\\listing1.webp"
},
{
    "name": "SWH-10119",
    "area": "Al Qusais",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 500,
    "unit": "Sqm",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors / Pest Control / ",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "Loading Bay",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10119\\listing1.webp"
},
{
    "name": "SWH-10120",
    "area": "JAFZA",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 17600,
    "unit": "Sqm",
    "starGrading": NaN,
    "safetyAndSecurity": NaN,
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": NaN,
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10120\\listing1.webp"
},
{
    "name": "SWH-10121",
    "area": "DWC",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Rack space / Bulk Space",
    "capacity": 8000,
    "unit": "Sqm",
    "starGrading": NaN,
    "safetyAndSecurity": NaN,
    "temperature": " Air Conditioned",
    "otherFacilities": NaN,
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10121\\listing1.webp"
},
{
    "name": "SWH-10122",
    "area": "JAFZA",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 9000,
    "unit": "Sqm",
    "starGrading": NaN,
    "safetyAndSecurity": NaN,
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": NaN,
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10122\\listing1.webp"
},
{
    "name": "SWH-10123",
    "area": "JAFZA",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 8000,
    "unit": "Sqm",
    "starGrading": NaN,
    "safetyAndSecurity": NaN,
    "temperature": " Air Conditioned",
    "otherFacilities": NaN,
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10123\\listing1.webp"
},
{
    "name": "SWH-10124",
    "area": "DIP",
    "location": "Dubai",
    "cargoType ": "General/Chemical",
    "Type of Warehouse": "Hazardous Cargo",
    "storageType": "Bulk Space",
    "capacity": 9000,
    "unit": "Sqm",
    "starGrading": NaN,
    "safetyAndSecurity": NaN,
    "temperature": " Air Conditioned",
    "otherFacilities": NaN,
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10124\\listing1.webp"
},
{
    "name": "SWH-10125",
    "area": "Jebel Ali",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 7000,
    "unit": "Sqm",
    "starGrading": NaN,
    "safetyAndSecurity": NaN,
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": NaN,
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10125\\listing1.webp"
},
{
    "name": "SWH-10126",
    "area": "NIP",
    "location": "Dubai",
    "cargoType ": "General/Food",
    "Type of Warehouse": "General Cargo",
    "storageType": "Rack space / Bulk Space",
    "capacity": 100000,
    "unit": "Pallet",
    "starGrading": 4.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors / Pest Control / Software",
    "temperature": " Air Conditioned",
    "otherFacilities": "Loading Bay",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10126\\listing1.webp"
},
{
    "name": "SWH-10127",
    "area": "DWC",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Openyard",
    "capacity": 7000,
    "unit": "Sqft",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors / Pest Control / ",
    "temperature": " Air Conditioned",
    "otherFacilities": NaN,
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10127\\listing1.webp"
},
{
    "name": "SWH-10128",
    "area": "AL Nahda",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 12000,
    "unit": "Sqft",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors / Pest Control / ",
    "temperature": " Air Conditioned",
    "otherFacilities": "Loading Bay, Forklift",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10128\\listing1.webp"
},
{
    "name": "SWH-10129",
    "area": "DIP",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Rack space / Bulk Space",
    "capacity": 500,
    "unit": "Pallet",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors / Pest Control / ",
    "temperature": " Air Conditioned",
    "otherFacilities": NaN,
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10129\\listing1.webp"
},
{
    "name": "SWH-10130",
    "area": "DIP",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Rack Space",
    "capacity": 60000,
    "unit": "Sqft",
    "starGrading": 4.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors / Pest Control / ",
    "temperature": " Air Conditioned",
    "otherFacilities": "Loading Bay, 6 Forklifts",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10130\\listing1.webp"
},
{
    "name": "SWH-10131",
    "area": "DIP",
    "location": "Dubai",
    "cargoType ": "General/Chemical",
    "Type of Warehouse": "Hazardous Cargo",
    "storageType": "Bulk Space",
    "capacity": 50,
    "unit": "Pallet",
    "starGrading": NaN,
    "safetyAndSecurity": NaN,
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": NaN,
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10131\\listing1.webp"
},
{
    "name": "SWH-10132",
    "area": "Jafza",
    "location": "Dubai",
    "cargoType ": "General/Chemical",
    "Type of Warehouse": "General Cargo / Hazardous Cargo",
    "storageType": "Bulk Space/Racking",
    "capacity": 6800,
    "unit": "Pallet",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors / Pest Control / ",
    "temperature": " Air Conditioned",
    "otherFacilities": "2 Loading Bay, 2 Forklifts",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10132\\listing1.webp"
},
{
    "name": "SWH-10133",
    "area": "Umm Ramool",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 14000,
    "unit": "Sqft",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors / Pest Control / ",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "Forklift and transportation ",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10133\\listing1.webp"
},
{
    "name": "SWH-10134",
    "area": "International City",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": NaN,
    "storageType": "Bulk Space",
    "capacity": 4000,
    "unit": "Sqft",
    "starGrading": NaN,
    "safetyAndSecurity": "CCTV",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "Loading Gate",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10134\\listing1.webp"
},
{
    "name": "SWH-10135",
    "area": "Al Quoz ",
    "location": "Dubai",
    "cargoType ": "Food/General",
    "Type of Warehouse": "Food&Beverages",
    "storageType": "Rack space / Bulk Space",
    "capacity": 8000,
    "unit": "Sqm",
    "starGrading": 4.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors / Pest Control / ",
    "temperature": " Air Conditioned/Ambient/Chiller/Cold/Frozen",
    "otherFacilities": "Loading Bay, 4 Forklifts",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10135\\listing1.webp"
},
{
    "name": "SWH-10136",
    "area": "Al Quoz ",
    "location": "Dubai",
    "cargoType ": "Food/General",
    "Type of Warehouse": "General/Dry Food",
    "storageType": "Rack space / Bulk Space",
    "capacity": 18000,
    "unit": "Sqft",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors / Pest Control / ",
    "temperature": " Air Conditioned",
    "otherFacilities": "Loading Gate, 1 Forklift",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10136\\listing1.webp"
},
{
    "name": "SWH-10137",
    "area": "Al Quoz ",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 10000,
    "unit": "Sqft",
    "starGrading": 4.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors / Pest Control / ",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "3 Loading Bay,4 Forklifts",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10137\\listing1.webp"
},
{
    "name": "SWH-10138",
    "area": "Al Quoz ",
    "location": "Dubai",
    "cargoType ": "Food/General",
    "Type of Warehouse": "Food&Beverages",
    "storageType": "Rack Space",
    "capacity": 10000,
    "unit": "Sqft",
    "starGrading": 4.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors / Pest Control / ",
    "temperature": " Air Conditioned/Ambient/Chiller/Cold/Frozen",
    "otherFacilities": "2 Loading Bay,3 Forklifts",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10138\\listing1.webp"
},
{
    "name": "SWH-10139",
    "area": "Al Quoz ",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Rack space / Bulk Space",
    "capacity": 5000,
    "unit": "Sqft",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV/Sprinkler/Smoke Detectors",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "1 Loading Bay",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10139\\listing1.webp"
},
{
    "name": "SWH-10140",
    "area": "DIP",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 5000,
    "unit": "Sqft",
    "starGrading": 4.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors / Pest Control / ",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "1 Loading Bay",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10140\\listing1.webp"
},
{
    "name": "SWH-10141",
    "area": "DIC",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 3500,
    "unit": "Sqft",
    "starGrading": 4.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors / Pest Control / ",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "1 Loading Bay",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10141\\listing1.webp"
},
{
    "name": "SWH-10142",
    "area": "DIP",
    "location": "Dubai",
    "cargoType ": "Chemical/General",
    "Type of Warehouse": "Hazardous Cargo",
    "storageType": "Bulk Space",
    "capacity": 5000,
    "unit": "Sqft",
    "starGrading": 4.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors / Pest Control / ",
    "temperature": " Air Conditioned",
    "otherFacilities": "3 Loading Bay",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10142\\listing1.webp"
},
{
    "name": "SWH-10143",
    "area": "DIP",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 500,
    "unit": "Sqft",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV/Sprinkler/Smoke Detectors",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "2 Loading Bay",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10143\\listing1.webp"
},
{
    "name": "SWH-10144",
    "area": "DIP",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 6000,
    "unit": "Sqft",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV/Sprinkler/Smoke Detectors",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "1 Loading Bay",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10144\\listing1.webp"
},
{
    "name": "SWH-10145",
    "area": "DIP",
    "location": "Dubai",
    "cargoType ": "General/Non perishable",
    "Type of Warehouse": "General Cargo",
    "storageType": "Rack space / Bulk Space",
    "capacity": 12000,
    "unit": "Sqft",
    "starGrading": 4.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors / Pest Control / ",
    "temperature": " Air Conditioned",
    "otherFacilities": "3 Loading Bay",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10145\\listing1.webp"
},
{
    "name": "SWH-10146",
    "area": "DIP",
    "location": "Dubai",
    "cargoType ": "Non Hazard",
    "Type of Warehouse": "General Cargo",
    "storageType": "Box Storage",
    "capacity": 800,
    "unit": "Sqft",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV/Sprinkler/Smoke Detectors",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "1 Loading Bay, 1 Forklift",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10146\\listing1.webp"
},
{
    "name": "SWH-10147",
    "area": "DIP",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 25000,
    "unit": "Sqft",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV/Sprinkler/Smoke Detectors",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "1 Loading Bay, 1 Forklift",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10147\\listing1.webp"
},
{
    "name": "SWH-10148",
    "area": "Al Quoz ",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Rack Space",
    "capacity": 10000,
    "unit": "Sqft",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV/Sprinkler/Smoke Detectors",
    "temperature": "AC/ Non-Air Conditioned ",
    "otherFacilities": "Loading Gate",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10148\\listing1.webp"
},
{
    "name": "SWH-10149",
    "area": "Jebel Ali",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 12000,
    "unit": "Sqft",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV/Sprinkler/Smoke Detectors",
    "temperature": "Air Conditioned",
    "otherFacilities": "3 Loading Bay,1 Forklifts",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10149\\listing1.webp"
},
{
    "name": "SWH-10150",
    "area": "Jebel Ali",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 5000,
    "unit": "Sqft",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV/Sprinkler/Smoke Detectors",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "1 Loading Bay, 1 Forklift",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10150\\listing1.webp"
},
{
    "name": "SWH-10151",
    "area": "Jebel Ali",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 2000,
    "unit": "Sqft",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV/Sprinkler/Smoke Detectors",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "1 Loading Bay, 1 Forklift",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10151\\listing1.webp"
},
{
    "name": "SWH-10152",
    "area": "Malliha Road",
    "location": "Sharjah",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 360000,
    "unit": "Sqft",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV/Sprinkler/Smoke Detectors",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "1 Loading Bay, 1 Forklift",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10152\\listing1.webp"
},
{
    "name": "SWH-10153",
    "area": "Sharjah Industrial Area",
    "location": "Sharjah",
    "cargoType ": "Food/General",
    "Type of Warehouse": "Food&Beverages",
    "storageType": "Rack space / Bulk Space",
    "capacity": 10000,
    "unit": "Sqft",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV/Sprinkler/Smoke Detectors",
    "temperature": " Air Conditioned/Ambient/Chiller/Cold/Frozen",
    "otherFacilities": "1 Loading Bay, 1 Forklift",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10153\\listing1.webp"
},
{
    "name": "SWH-10154",
    "area": "Nad Al Hammar",
    "location": "Dubai",
    "cargoType ": "Food/General",
    "Type of Warehouse": "Food&Beverages",
    "storageType": "Rack space / Bulk Space",
    "capacity": 1000,
    "unit": "Sqft",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV/Sprinkler/Smoke Detectors",
    "temperature": " Air Conditioned/Ambient/Chiller/Cold/Frozen",
    "otherFacilities": "1 Loading Bay, 2 Forklift",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10154\\listing1.webp"
},
{
    "name": "SWH-10155",
    "area": "Nad Al Hammar",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 500,
    "unit": "Sqm",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV/Sprinkler/Smoke Detectors",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "1 Loading Bay, 1 Forklift",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10155\\listing1.webp"
},
{
    "name": "SWH-10156",
    "area": "Ras Al Khor",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 500,
    "unit": "Sqm",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV/Sprinkler/Smoke Detectors",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "1 Loading Bay, 1 Forklift",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10156\\listing1.webp"
},
{
    "name": "SWH-10157",
    "area": "Ras Al Khor ",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 500,
    "unit": "Sqm",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV/Sprinkler/Smoke Detectors",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "1 Loading Bay, 1 Forklift",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10157\\listing1.webp"
},
{
    "name": "SWH-10158",
    "area": "Ras Al Khor",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 500,
    "unit": "Sqm",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV/Sprinkler/Smoke Detectors",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "1 Loading Bay, 1 Forklift",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10158\\listing1.webp"
},
{
    "name": "SWH-10159",
    "area": "Ras Al Khor ",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 15000,
    "unit": "Sqm",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV/Sprinkler/Smoke Detectors",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "1 Loading Bay, 1 Forklift",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10159\\listing1.webp"
},
{
    "name": "SWH-10160",
    "area": "Al Qusais",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": "General Cargo",
    "storageType": "Bulk Space",
    "capacity": 3000,
    "unit": "Sqft",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV/Sprinkler/Smoke Detectors",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "1 Loading Bay, 1 Forklift",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10160\\listing1.webp"
},
{
    "name": "SWH-10161",
    "area": "Ras Al Khor ",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": NaN,
    "storageType": "Bulk Space",
    "capacity": 7000,
    "unit": "Sqft",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV/Sprinkler/Smoke Detectors",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "1 Loading Bay, 1 Forklift",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10161\\listing1.webp"
},
{
    "name": "SWH-10162",
    "area": "Ras Al Khor ",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": NaN,
    "storageType": "Bulk Space",
    "capacity": 5000,
    "unit": "Sqft",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV/Sprinkler/Smoke Detectors",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "1 Loading Bay, 1 Forklift",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10162\\listing1.webp"
},
{
    "name": "SWH-10163",
    "area": "Al Quoz ",
    "location": "Dubai",
    "cargoType ": "Food/General",
    "Type of Warehouse": NaN,
    "storageType": "Rack space / Bulk Space",
    "capacity": 10000,
    "unit": "Sqft",
    "starGrading": 4.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors / Pest Control / ",
    "temperature": " Air Conditioned/Ambient/Chiller",
    "otherFacilities": "2 Loading Bay, 2 Forklift",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10163\\listing1.webp"
},
{
    "name": "SWH-10164",
    "area": "DIP",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": NaN,
    "storageType": "Rack space / Bulk Space",
    "capacity": 11000,
    "unit": "Sqft",
    "starGrading": 4.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors / Pest Control / ",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "2 Loading Bay, 2 Forklift",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10164\\listing1.webp"
},
{
    "name": "SWH-10165",
    "area": "Al Jurf Ind Area",
    "location": "Ajman",
    "cargoType ": "General",
    "Type of Warehouse": NaN,
    "storageType": "Bulk Space",
    "capacity": 5000,
    "unit": "Sqft",
    "starGrading": 4.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors / Pest Control / ",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "6 Loading Bay, 2 Forklift",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10165\\listing1.webp"
},
{
    "name": "SWH-10166",
    "area": "DIC",
    "location": "Dubai",
    "cargoType ": "Food/General",
    "Type of Warehouse": NaN,
    "storageType": "Rack space / Bulk Space",
    "capacity": 40000,
    "unit": "Sqft",
    "starGrading": 4.0,
    "safetyAndSecurity": "CCTV / Fire Alarm / Smole Detectors / Pest Control / ",
    "temperature": " Air Conditioned/Ambient/Chiller",
    "otherFacilities": "20 Loading Bay, 6 Forklift",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10166\\listing1.webp"
},
{
    "name": "SWH-10167",
    "area": "Umm Ramool",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": NaN,
    "storageType": "Bulk Space",
    "capacity": 2500,
    "unit": "Sqft",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV/Sprinkler/Smoke Detectors",
    "temperature": " Air Conditioned",
    "otherFacilities": "1 Loading Bay, 1 Forklift",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10167\\listing1.webp"
},
{
    "name": "SWH-10168",
    "area": "DIC",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": NaN,
    "storageType": "Rack space / Bulk Space",
    "capacity": 10000,
    "unit": "Sqft",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV/Sprinkler/Smoke Detectors",
    "temperature": " Air Conditioned",
    "otherFacilities": "1 Loading Bay, 1 Forklift",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10168\\listing1.webp"
},
{
    "name": "SWH-10169",
    "area": "DIP",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": NaN,
    "storageType": "Rack space / Bulk Space",
    "capacity": 8000,
    "unit": "Sqft",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV/Sprinkler/Smoke Detectors",
    "temperature": " Air Conditioned",
    "otherFacilities": "1 Loading Bay, 1 Forklift",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10169\\listing1.webp"
},
{
    "name": "SWH-10170",
    "area": "Umm Ramool",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": NaN,
    "storageType": "Bulk Space",
    "capacity": 2500,
    "unit": "Sqft",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV/Sprinkler/Smoke Detectors",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "1 Loading Bay, 1 Forklift",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10170\\listing1.webp"
},
{
    "name": "SWH-10171",
    "area": "Umm Ramool",
    "location": "Dubai",
    "cargoType ": "General",
    "Type of Warehouse": NaN,
    "storageType": "Bulk Space",
    "capacity": 3000,
    "unit": "Sqft",
    "starGrading": 3.0,
    "safetyAndSecurity": "CCTV/Sprinkler/Smoke Detectors",
    "temperature": " Non-Air Conditioned ",
    "otherFacilities": "1 Loading Bay, 1 Forklift",
    "imageUrl": "\\storez\\assets\\images\\warehouse-images\\SWH-10171\\listing1.webp"
}
];
// ══════════════════════════════════════════════════════════════

/**
 * Trim string values and normalise common key inconsistencies
 * so the data is clean before it hits Firestore.
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

    // Title-case helper: "DUBAI" → "Dubai", "AL QUOZ" → "Al Quoz"
    // Preserves fully uppercase acronyms like "UAE", "RAK", "ICAD", "KIZAD", "DMC", "DMCC", "MASDAR CITY"
    const PRESERVE_UPPERCASE = ['UAE', 'RAK', 'ICAD', 'KIZAD', 'DMC', 'DMCC'];
    function toTitleCase(str) {
      if (typeof str !== 'string') return str;
      return str.split(' ').map(word => {
        if (PRESERVE_UPPERCASE.includes(word.toUpperCase())) return word.toUpperCase();
        if (word.toUpperCase() === 'MASDAR') return 'Masdar';
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }).join(' ');
    }

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

/**
 * Upload an array of warehouse objects to Firestore.
 * @param {Array} warehouses - Array of raw warehouse JSON objects
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

// ── Expose for the HTML page to trigger ──
window.startUpload = async function () {
  const btn = document.getElementById('startBtn');
  const status = document.getElementById('uploadStatus');

  if (WAREHOUSE_DATA.length === 0) {
    status.textContent = 'No data found. Paste your JSON array into WAREHOUSE_DATA in upload-warehouses.js.';
    status.style.color = '#f87171';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Uploading...';
  status.textContent = `Uploading 0 / ${WAREHOUSE_DATA.length}...`;
  status.style.color = '#fbbf24';

  const result = await uploadWarehouses(WAREHOUSE_DATA, (done, total) => {
    status.textContent = `Uploading ${done} / ${total}...`;
  });

  btn.textContent = 'Done';
  status.style.color = result.failed > 0 ? '#f87171' : '#3ecfb1';
  status.textContent = `Upload complete: ${result.success} succeeded, ${result.failed} failed.`;
};

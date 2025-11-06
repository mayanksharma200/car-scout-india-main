# Price Column Mapping Fix

## Problem
The `exact_price` column in the database was showing NULL for all cars after CSV upload.

## Root Cause
The CSV uploader was reading from the wrong column index. It was looking at column 6, but the actual "Price" column in your Teoalida Excel database is at **column I (index 8)**.

## Excel Structure (Teoalida Database)
```
Column A (0): Version ID
Column B (1): Source URL
Column C (2): Make
Column D (3): Model
Column E (4): Version
Column F (5): Body style
Column G (6): Status
Column H (7): Image URL
Column I (8): (empty or other data)
Column J (9): Price          ← THIS IS EXACT_PRICE (e.g., "₹ 50.88 Lakh")
Column K (10): On-road Delhi ← THIS IS DELHI_PRICE (e.g., "₹54,68,966.00")
Column L (11): Key Price     ← Alternative price for price_min/price_max
Column M (12): Mileage (ARAI)
Column N (13): Engine
Column O (14): Transmission
Column P (15): Fuel Type
Column Q (16): Seating Capacity
```

## Fix Applied
Updated [CSVFileUploader.tsx](src/components/CSVFileUploader.tsx):

### CSV Parsing (Line 114):
```typescript
const exactPrice = row[9 + columnOffset]?.trim(); // Column J (index 9)
```

### Excel Parsing (Line 773):
```typescript
const exactPrice = getValue(allColumnData['Price']) || getValue(allColumnData['Column_9']) || getValue(row[9]);
```

## How to Test
1. **Delete existing cars** (optional - to clear NULL values):
   ```sql
   DELETE FROM cars WHERE exact_price IS NULL;
   ```

2. **Re-upload your Excel file**:
   - Go to Admin Panel → Manage Cars
   - Upload the Teoalida Excel file
   - Column I ("Price") will now correctly map to `exact_price`

3. **Verify in Database**:
   ```sql
   SELECT brand, model, exact_price, delhi_price
   FROM cars
   WHERE exact_price IS NOT NULL
   LIMIT 10;
   ```

4. **Check Frontend**:
   - Visit homepage - Featured cars should show prices
   - Visit /cars - All listings should show prices
   - Format: "Price: ₹ 50.88 Lakh"

## Expected Results After Re-upload

### Database:
- `exact_price`: "₹ 50.88 Lakh", "₹ 48.29 Lakh", etc.
- `delhi_price`: "₹54,68,966.00", etc.

### Frontend Display:
```
Price: ₹ 50.88 Lakh
On-road Delhi: ₹54,68,966.00
```

Or if Delhi price is missing:
```
Price: ₹ 50.88 Lakh
On-road Delhi: N/A
```

## Files Modified
1. ✅ [src/components/CSVFileUploader.tsx](src/components/CSVFileUploader.tsx) - Fixed column indices
2. ✅ Database migration already applied (exact_price column exists)
3. ✅ Frontend components already updated (FeaturedCars, CarCard, CarListing)

## Next Step
**Re-upload your Excel file** and the prices will be correctly populated! 🎉

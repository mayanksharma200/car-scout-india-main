# Testing IMAGIN.studio API with Different Indian Car Models

## Working Models (Confirmed):

### Maruti Swift (Working)
```bash
curl -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=maruti&modelFamily=swift&modelVariant=hatchback&angle=01&fileType=png&width=800&paintId=1&paintDescription=white" \
  -H "Authorization: Bearer i%uPLIZFivd4" \
  -o swift_white.png

curl -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=maruti&modelFamily=swift&modelVariant=hatchback&angle=01&fileType=png&width=800&paintId=2&paintDescription=black" \
  -H "Authorization: Bearer i%uPLIZFivd4" \
  -o swift_black.png
```

### Toyota Fortuner (Working)
```bash
curl -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=toyota&modelFamily=fortuner&modelVariant=suv&angle=01&fileType=png&width=800&paintId=1&paintDescription=white" \
  -H "Authorization: Bearer i%uPLIZFivd4" \
  -o fortuner_white.png

curl -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=toyota&modelFamily=fortuner&modelVariant=suv&angle=01&fileType=png&width=800&paintId=2&paintDescription=black" \
  -H "Authorization: Bearer i%uPLIZFivd4" \
  -o fortuner_black.png
```

## Problematic Models (Need Testing):

### Mahindra Thar (Possibly Not Working)
```bash
# Test different variants for Thar
curl -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=mahindra&modelFamily=thar&modelVariant=suv&angle=01&fileType=png&width=800&paintId=1&paintDescription=white" \
  -H "Authorization: Bearer i%uPLIZFivd4" \
  -o thar_suv_white.png

curl -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=mahindra&modelFamily=thar&modelVariant=offroad&angle=01&fileType=png&width=800&paintId=1&paintDescription=white" \
  -H "Authorization: Bearer i%uPLIZFivd4" \
  -o thar_offroad_white.png

curl -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=mahindra&modelFamily=thar&modelVariant=convertible&angle=01&fileType=png&width=800&paintId=1&paintDescription=white" \
  -H "Authorization: Bearer i%uPLIZFivd4" \
  -o thar_convertible_white.png
```

### Mahindra Scorpio N (Possibly Not Working)
```bash
# Test different name variations for Scorpio N
curl -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=mahindra&modelFamily=scorpio-n&modelVariant=suv&angle=01&fileType=png&width=800&paintId=1&paintDescription=white" \
  -H "Authorization: Bearer i%uPLIZFivd4" \
  -o scorpio_n_white.png

curl -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=mahindra&modelFamily=scorpion&modelVariant=suv&angle=01&fileType=png&width=800&paintId=1&paintDescription=white" \
  -H "Authorization: Bearer i%uPLIZFivd4" \
  -o scorpion_white.png

curl -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=mahindra&modelFamily=scorpio&modelVariant=suv&angle=01&fileType=png&width=800&paintId=1&paintDescription=white" \
  -H "Authorization: Bearer i%uPLIZFivd4" \
  -o scorpio_white.png
```

## Other Indian Models to Test:

### Hyundai Creta
```bash
curl -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=hyundai&modelFamily=creta&modelVariant=suv&angle=01&fileType=png&width=800&paintId=1&paintDescription=white" \
  -H "Authorization: Bearer i%uPLIZFivd4" \
  -o creta_white.png
```

### Tata Nexon
```bash
curl -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=tata&modelFamily=nexon&modelVariant=suv&angle=01&fileType=png&width=800&paintId=1&paintDescription=white" \
  -H "Authorization: Bearer i%uPLIZFivd4" \
  -o nexon_white.png
```

### Kia Seltos
```bash
curl -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=kia&modelFamily=seltos&modelVariant=suv&angle=01&fileType=png&width=800&paintId=1&paintDescription=white" \
  -H "Authorization: Bearer i%uPLIZFivd4" \
  -o seltos_white.png
```

## Diagnostic Commands:

### Test Status Codes (Headers Only)
```bash
# Check if Thar exists
curl -I -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=mahindra&modelFamily=thar&modelVariant=suv&angle=01&fileType=png&width=800&paintId=1&paintDescription=white" \
  -H "Authorization: Bearer i%uPLIZFivd4"

# Check if Scorpio N exists  
curl -I -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=mahindra&modelFamily=scorpio-n&modelVariant=suv&angle=01&fileType=png&width=800&paintId=1&paintDescription=white" \
  -H "Authorization: Bearer i%uPLIZFivd4"
```

## Specific Fixed Tests for Problematic Models:

### Fixed Mahindra Thar Tests (Using 'offroad' variant)
```bash
curl -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=mahindra&modelFamily=thar&modelVariant=offroad&angle=01&fileType=png&width=800&paintId=1&paintDescription=white" \
  -H "Authorization: Bearer i%uPLIZFivd4" \
  -o thar_white_fixed.png

curl -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=mahindra&modelFamily=thar&modelVariant=offroad&angle=01&fileType=png&width=800&paintId=2&paintDescription=black" \
  -H "Authorization: Bearer i%uPLIZFivd4" \
  -o thar_black_fixed.png
```

### Fixed Mahindra Scorpio N Tests (Using 'scorpio' as model name)
```bash
curl -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=mahindra&modelFamily=scorpio&modelVariant=suv&angle=01&fileType=png&width=800&paintId=1&paintDescription=white" \
  -H "Authorization: Bearer i%uPLIZFivd4" \
  -o scorpio_white_fixed.png

curl -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=mahindra&modelFamily=scorpio&modelVariant=suv&angle=01&fileType=png&width=800&paintId=2&paintDescription=black" \
  -H "Authorization: Bearer i%uPLIZFivd4" \
  -o scorpio_black_fixed.png
```

## Expected Issues (Original Analysis):

1. **Model Name Variations**: Scorpio N might be "scorpio-n", "scorpion", or just "scorpio" ✅ **FIXED**
2. **Variant Mismatch**: Thar might need "offroad" or "convertible" instead of "suv" ✅ **FIXED** 
3. **Make Name**: Mahindra might need different spelling or format ✅ **HANDLED**
4. **Availability**: Some models might not be available in IMAGIN database 🔄 **FALLBACK ADDED**
5. **API Limitations**: Free tier might have model restrictions 🔄 **FALLBACK ADDED**

## Test Results Analysis:

After running these commands, check for:
- **200 OK**: Model and variant supported
- **404 Not Found**: Model/variant not available in database  
- **401/403**: Authentication issues
- **400 Bad Request**: Parameter format issues
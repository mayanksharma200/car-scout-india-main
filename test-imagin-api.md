# IMAGIN.studio API Color Change Testing - WORKING VERSION

## Test Commands Using Working API Structure

### Base Parameters:
- **Customer**: sg-zorbitads  
- **Authorization**: Bearer i%uPLIZFivd4
- **Make**: audi (or maruti, hyundai, etc.)
- **Model Family**: a3 (or swift, i20, etc.)
- **Model Variant**: suv
- **Angle**: 21 (or 01, 05, 09, etc.)
- **File Type**: png
- **Width**: 800
- **Paint ID**: 1-5 (generic IDs)

## Working Test Cases:

### 1. White Car (Paint ID: 1)
```bash
curl -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=audi&modelFamily=a3&modelVariant=suv&angle=21&fileType=png&width=800&paintId=1&paintDescription=white" \
  -H "Authorization: Bearer i%uPLIZFivd4" \
  -o audi_a3_white.png
```

### 2. Black Car (Paint ID: 2)  
```bash
curl -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=audi&modelFamily=a3&modelVariant=suv&angle=21&fileType=png&width=800&paintId=2&paintDescription=black" \
  -H "Authorization: Bearer i%uPLIZFivd4" \
  -o audi_a3_black.png
```

### 3. Silver Car (Paint ID: 3)
```bash
curl -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=audi&modelFamily=a3&modelVariant=suv&angle=21&fileType=png&width=800&paintId=3&paintDescription=silver" \
  -H "Authorization: Bearer i%uPLIZFivd4" \
  -o audi_a3_silver.png
```

### 4. Red Car (Paint ID: 4)
```bash
curl -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=audi&modelFamily=a3&modelVariant=suv&angle=21&fileType=png&width=800&paintId=4&paintDescription=red" \
  -H "Authorization: Bearer i%uPLIZFivd4" \
  -o audi_a3_red.png
```

### 5. Blue Car (Paint ID: 5)
```bash
curl -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=audi&modelFamily=a3&modelVariant=suv&angle=21&fileType=png&width=800&paintId=5&paintDescription=blue" \
  -H "Authorization: Bearer i%uPLIZFivd4" \
  -o audi_a3_blue.png
```

## Test with Indian Cars:

### Maruti Swift (Different Colors)
```bash
# White Swift
curl -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=maruti&modelFamily=swift&modelVariant=hatchback&angle=01&fileType=png&width=800&paintId=1&paintDescription=white" \
  -H "Authorization: Bearer i%uPLIZFivd4" \
  -o maruti_swift_white.png

# Black Swift
curl -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=maruti&modelFamily=swift&modelVariant=hatchback&angle=01&fileType=png&width=800&paintId=2&paintDescription=black" \
  -H "Authorization: Bearer i%uPLIZFivd4" \
  -o maruti_swift_black.png
```

### Hyundai i20 (Different Colors)
```bash
# White i20
curl -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=hyundai&modelFamily=i20&modelVariant=hatchback&angle=01&fileType=png&width=800&paintId=1&paintDescription=white" \
  -H "Authorization: Bearer i%uPLIZFivd4" \
  -o hyundai_i20_white.png

# Red i20
curl -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=hyundai&modelFamily=i20&modelVariant=hatchback&angle=01&fileType=png&width=800&paintId=4&paintDescription=red" \
  -H "Authorization: Bearer i%uPLIZFivd4" \
  -o hyundai_i20_red.png
```

## Testing Different Angles (Working Format):

### Swift - Multiple Angles  
```bash
# Front view (angle 01)
curl -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=maruti&modelFamily=swift&modelVariant=hatchback&angle=01&fileType=png&width=800&paintId=1&paintDescription=white" \
  -H "Authorization: Bearer i%uPLIZFivd4" \
  -o maruti_swift_front.png

# Side view (angle 05)
curl -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=maruti&modelFamily=swift&modelVariant=hatchback&angle=05&fileType=png&width=800&paintId=1&paintDescription=white" \
  -H "Authorization: Bearer i%uPLIZFivd4" \
  -o maruti_swift_side.png

# Rear view (angle 13)  
curl -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=maruti&modelFamily=swift&modelVariant=hatchback&angle=13&fileType=png&width=800&paintId=1&paintDescription=white" \
  -H "Authorization: Bearer i%uPLIZFivd4" \
  -o maruti_swift_rear.png
```

## Quick Test URLs (Note: These may not work in browser without auth headers):

**Test Paint Color Changes:**
1. **White Audi A3**: `https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=audi&modelFamily=a3&modelVariant=suv&angle=21&fileType=png&width=800&paintId=1&paintDescription=white`

2. **Black Audi A3**: `https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=audi&modelFamily=a3&modelVariant=suv&angle=21&fileType=png&width=800&paintId=2&paintDescription=black`

3. **Red Audi A3**: `https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=audi&modelFamily=a3&modelVariant=suv&angle=21&fileType=png&width=800&paintId=4&paintDescription=red`

## Expected Results:
- **Status**: 200 OK (if successful)
- **Content-Type**: image/jpeg or image/png
- **Different images** for each color variation

## Notes:
- Use `-I` flag for headers only (faster testing)
- Remove `-I` to download actual image
- The `hrjavascript-trial` customer key has limitations
- Some paint descriptions might not be available for all models
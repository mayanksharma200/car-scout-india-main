# IMAGIN.studio API Color Change Testing

## Test Commands Using Working API Structure

### Base Parameters:
- **Customer**: sg-zorbitads  
- **Authorization**: Bearer i%uPLIZFivd4
- **Paint ID**: 1-5 (generic IDs)
- **File Type**: png
- **Width**: 800

## Basic Test Cases:

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

### 3. Red Car (Paint ID: 4)
```bash
curl -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=audi&modelFamily=a3&modelVariant=suv&angle=21&fileType=png&width=800&paintId=4&paintDescription=red" \
  -H "Authorization: Bearer i%uPLIZFivd4" \
  -o audi_a3_red.png
```

## Test with Indian Cars:

### Maruti Swift
```bash
curl -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=maruti&modelFamily=swift&modelVariant=suv&angle=01&fileType=png&width=800&paintId=1&paintDescription=white" \
  -H "Authorization: Bearer i%uPLIZFivd4" \
  -o maruti_swift_white.png
```

### Hyundai i20  
```bash
curl -X GET "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=hyundai&modelFamily=i20&modelVariant=suv&angle=01&fileType=png&width=800&paintId=2&paintDescription=black" \
  -H "Authorization: Bearer i%uPLIZFivd4" \
  -o hyundai_i20_black.png
```

## Expected Results:
- **Status**: 200 OK (if successful)  
- **Content-Type**: image/png
- **Different images** for each color variation

## Notes:
- Use generic `modelVariant=suv` for most cars
- Paint IDs: 1=white, 2=black, 4=red, 5=blue
- Authorization header required for all requests
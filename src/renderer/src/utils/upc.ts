export function extractCompanyPrefix(gtin) {
  // Remove any whitespace and ensure the GTIN is a string
  gtin = String(gtin).replace(/\s/g, '');
  
  // Check if the GTIN is valid (8, 12, 13, or 14 digits)
  if (!/^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/.test(gtin)) {
    throw new Error('Invalid GTIN format. Must be 8, 12, 13, or 14 digits. Provided: ' + gtin);
  }

  // GS1 prefix ranges and their corresponding company prefix lengths
  const prefixRanges = [
    { start: '000', end: '019', length: 6 },
    { start: '020', end: '029', length: 7 },
    { start: '030', end: '039', length: 8 },
    { start: '040', end: '049', length: 9 },
    { start: '050', end: '059', length: 10 },
    { start: '060', end: '139', length: 7 },
    { start: '300', end: '379', length: 7 },
    { start: '380', end: '459', length: 8 },
    { start: '460', end: '499', length: 9 },
    { start: '500', end: '509', length: 6 },
    { start: '510', end: '519', length: 7 },
    { start: '520', end: '839', length: 8 },
    { start: '840', end: '849', length: 9 },
    { start: '850', end: '950', length: 10 },
    { start: '951', end: '979', length: 9 },
    { start: '980', end: '999', length: 10 }
  ];

  // For GTIN-8, return the first 6 digits (excluding check digit)
  if (gtin.length === 8) {
    return gtin.slice(0, 7);
  }

  // For other GTINs, find the matching prefix range
  const prefix = gtin.slice(0, 3);
  const range = prefixRanges.find(r => prefix >= r.start && prefix <= r.end);

  if (!range) {
    throw new Error('Unable to determine company prefix length.');
  }

  // Extract the company prefix based on the determined length
  return gtin.slice(0, range.length);
}

export function extractItemReference(gtin) {
  // Remove any whitespace and ensure the GTIN is a string
  gtin = String(gtin).replace(/\s/g, '');
  
  // Check if the GTIN is valid (8, 12, 13, or 14 digits)
  if (!/^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/.test(gtin)) {
    throw new Error('Invalid GTIN format. Must be 8, 12, 13, or 14 digits.');
  }

  // GS1 prefix ranges and their corresponding company prefix lengths
  const prefixRanges = [
    { start: '000', end: '019', length: 6 },
    { start: '020', end: '029', length: 7 },
    { start: '030', end: '039', length: 8 },
    { start: '040', end: '049', length: 9 },
    { start: '050', end: '059', length: 10 },
    { start: '060', end: '139', length: 7 },
    { start: '300', end: '379', length: 7 },
    { start: '380', end: '459', length: 8 },
    { start: '460', end: '499', length: 9 },
    { start: '500', end: '509', length: 6 },
    { start: '510', end: '519', length: 7 },
    { start: '520', end: '839', length: 8 },
    { start: '840', end: '849', length: 9 },
    { start: '850', end: '950', length: 10 },
    { start: '951', end: '979', length: 9 },
    { start: '980', end: '999', length: 10 }
  ];

  // For GTIN-8, return the 7th digit
  if (gtin.length === 8) {
    return gtin.slice(6, 7);
  }

  // For other GTINs, find the matching prefix range
  const prefix = gtin.slice(0, 3);
  const range = prefixRanges.find(r => prefix >= r.start && prefix <= r.end);

  if (!range) {
    throw new Error('Unable to determine company prefix length.');
  }

  // Extract the item reference based on the determined company prefix length
  return gtin.slice(range.length, -1);
}

// Example usage:
// console.log(extractItemReference('00123456789012')); // GTIN-14
// console.log(extractItemReference('123456789012'));   // GTIN-12 (UPC-A)
// console.log(extractItemReference('1234567890128'));  // GTIN-13 (EAN-13)
// console.log(extractItemReference('12345670'));       // GTIN-8 (EAN-8)


export function getAvailableCodesCount(upc) {
  // Remove any whitespace and ensure the UPC is a string
  upc = String(upc).replace(/\s/g, '');
  
  // Check if the UPC is valid (8, 12, 13, or 14 digits)
  if (!/^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/.test(upc)) {
    throw new Error('Invalid UPC format. Must be 8, 12, 13, or 14 digits.');
  }

  // GS1 prefix ranges and their corresponding company prefix lengths
  const prefixRanges = [
    { start: '000', end: '019', length: 6 },
    { start: '020', end: '029', length: 7 },
    { start: '030', end: '039', length: 8 },
    { start: '040', end: '049', length: 9 },
    { start: '050', end: '059', length: 10 },
    { start: '060', end: '139', length: 7 },
    { start: '300', end: '379', length: 7 },
    { start: '380', end: '459', length: 8 },
    { start: '460', end: '499', length: 9 },
    { start: '500', end: '509', length: 6 },
    { start: '510', end: '519', length: 7 },
    { start: '520', end: '839', length: 8 },
    { start: '840', end: '849', length: 9 },
    { start: '850', end: '950', length: 10 },
    { start: '951', end: '979', length: 9 },
    { start: '980', end: '999', length: 10 }
  ];

  // For GTIN-8, return 100 (as it has a fixed structure)
  if (upc.length === 8) {
    return 100;
  }

  // For other GTINs, find the matching prefix range
  const prefix = upc.slice(0, 3);
  const range = prefixRanges.find(r => prefix >= r.start && prefix <= r.end);

  if (!range) {
    throw new Error('Unable to determine company prefix length.');
  }

  // Calculate the number of available codes
  const itemReferenceLength = upc.length - range.length - 1; // -1 for check digit
  return Math.pow(10, itemReferenceLength);
}
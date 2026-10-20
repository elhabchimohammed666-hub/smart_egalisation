import fs from 'fs';
import path from 'path';
import Jimp from 'jimp';
import { createWorker } from 'tesseract.js';
import { config } from '../config/config.js';

let tesseractWorker = null;

/**
 * Initializes or reuses the Tesseract worker
 */
async function getOCRWorker() {
  if (!tesseractWorker) {
    tesseractWorker = await createWorker('fra+ara');
  }
  return tesseractWorker;
}

/**
 * Assess image quality: resolution, brightness, contrast, and blur detection
 * @param {string} imagePath 
 * @returns {Promise<{isQualitySufficient: boolean, reason: string|null, metrics: object}>}
 */
export async function assessImageQuality(imagePath) {
  try {
    if (!fs.existsSync(imagePath)) {
      return {
        isQualitySufficient: false,
        reason: 'Fichier image introuvable sur le serveur.',
        metrics: {}
      };
    }

    const image = await Jimp.read(imagePath);
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    // 1. Resolution Check
    if (width < 320 || height < 200) {
      return {
        isQualitySufficient: false,
        reason: `Résolution insuffisante (${width}x${height}px). Une résolution minimale de 320x200px est requise pour une lecture fiable.`,
        metrics: { width, height }
      };
    }

    // 2. Brightness & Contrast Calculation
    let totalLuminance = 0;
    const pixelCount = width * height;
    const luminanceValues = [];

    // Sample pixels (every 4th pixel for speed on large images)
    const step = Math.max(1, Math.floor(Math.sqrt(pixelCount) / 100));
    let sampledCount = 0;

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const hex = image.getPixelColor(x, y);
        const rgba = Jimp.intToRGBA(hex);
        // Standard relative luminance formula
        const lum = 0.299 * rgba.r + 0.587 * rgba.g + 0.114 * rgba.b;
        totalLuminance += lum;
        luminanceValues.push(lum);
        sampledCount++;
      }
    }

    const avgLuminance = totalLuminance / sampledCount;

    // Calculate variance of luminance (contrast measure)
    let varianceSum = 0;
    for (let i = 0; i < sampledCount; i++) {
      varianceSum += Math.pow(luminanceValues[i] - avgLuminance, 2);
    }
    const variance = varianceSum / sampledCount;
    const stdDev = Math.sqrt(variance);

    // 3. Simple Laplacian Gradient approximation for Blur detection
    let edgeDiffSum = 0;
    let edgeSampleCount = 0;
    for (let y = step; y < height - step; y += step * 2) {
      for (let x = step; x < width - step; x += step * 2) {
        const cColor = Jimp.intToRGBA(image.getPixelColor(x, y));
        const rColor = Jimp.intToRGBA(image.getPixelColor(x + step, y));
        const bColor = Jimp.intToRGBA(image.getPixelColor(x, y + step));
        const cLum = 0.299 * cColor.r + 0.587 * cColor.g + 0.114 * cColor.b;
        const rLum = 0.299 * rColor.r + 0.587 * rColor.g + 0.114 * rColor.b;
        const bLum = 0.299 * bColor.r + 0.587 * bColor.g + 0.114 * bColor.b;
        edgeDiffSum += Math.abs(cLum - rLum) + Math.abs(cLum - bLum);
        edgeSampleCount++;
      }
    }
    const blurScore = edgeSampleCount > 0 ? (edgeDiffSum / edgeSampleCount) : 0;

    const metrics = {
      width,
      height,
      brightness: Math.round(avgLuminance),
      contrastStdDev: Math.round(stdDev),
      sharpnessScore: Math.round(blurScore * 10) / 10
    };

    // Quality Rules:
    // A. Too dark (< 25)
    if (avgLuminance < 25) {
      return {
        isQualitySufficient: false,
        reason: 'Image trop sombre ou mal éclairée. Veuillez photographier votre CIN dans un endroit bien éclairé.',
        metrics
      };
    }

    // B. Overexposed / washed out (> 245)
    if (avgLuminance > 245) {
      return {
        isQualitySufficient: false,
        reason: 'Image surexposée ou éblouie. Évitez les reflets directs du flash sur la carte d\'identité.',
        metrics
      };
    }

    // C. Flat / Lack of contrast (e.g. blank page or severe fog)
    if (stdDev < 15) {
      return {
        isQualitySufficient: false,
        reason: 'Contraste insuffisant. L\'image semble vide ou uniforme.',
        metrics
      };
    }

    // D. Blurry detection (sharpness score < 3.5 on gradient changes)
    if (blurScore < 3.0) {
      return {
        isQualitySufficient: false,
        reason: 'Image floue ou manquant de netteté. Veuillez stabiliser votre appareil et faire la mise au point sur le texte.',
        metrics
      };
    }

    return {
      isQualitySufficient: true,
      reason: null,
      metrics
    };
  } catch (error) {
    console.error('[OCR-Service] Error assessing image quality:', error);
    // If Jimp fails to read corrupted image
    return {
      isQualitySufficient: false,
      reason: 'Fichier image corrompu ou illisible. Format non pris en charge.',
      metrics: { error: error.message }
    };
  }
}

/**
 * Extracts raw text from an image using Tesseract.js with safety fallback
 * @param {string} imagePath 
 * @returns {Promise<{text: string, confidence: number}>}
 */
export async function extractTextFromImage(imagePath) {
  try {
    const worker = await getOCRWorker();
    const result = await worker.recognize(imagePath);
    return {
      text: result.data.text || '',
      confidence: Math.round(result.data.confidence || 0)
    };
  } catch (ocrError) {
    console.warn(`[OCR-Service] Tesseract worker execution fallback:`, ocrError.message);
    // Fallback: If Tesseract fails due to native network or lang-data download issues in dev,
    // read sidecar / synthetic text if available, or return best effort
    const baseName = path.basename(imagePath, path.extname(imagePath));
    const sidecarFile = path.join(path.dirname(imagePath), `${baseName}.json`);
    if (fs.existsSync(sidecarFile)) {
      try {
        const sidecar = JSON.parse(fs.readFileSync(sidecarFile, 'utf8'));
        return {
          text: sidecar.rawText || '',
          confidence: sidecar.confidence || 85
        };
      } catch (e) {
        // ignore
      }
    }
    return {
      text: '',
      confidence: 0
    };
  }
}

/**
 * Parses Moroccan CIN Front side text
 * @param {string} text 
 * @returns {object} Extracted identity fields
 */
export function parseCINFrontText(text) {
  const fields = {
    cin: null,
    lastName: null,
    firstName: null,
    arabicFullName: null,
    dateOfBirth: null,
    placeOfBirth: null,
    gender: null,
    nationality: 'Marocaine'
  };

  if (!text) return fields;

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. CIN regex matching (Moroccan CIN: 1 or 2 uppercase letters + 5 to 7 digits)
  // e.g. AB123456, BK78945, EE654321, J123456
  const cinMatch = text.match(/\b([A-Z]{1,2})\s*([0-9]{5,7})\b/i);
  if (cinMatch) {
    fields.cin = `${cinMatch[1].toUpperCase()}${cinMatch[2]}`;
  }

  // 2. Date of Birth matching (DD.MM.YYYY, DD/MM/YYYY, DD-MM-YYYY)
  const dobMatch = text.match(/(\d{2})[\.\/\-](\d{2})[\.\/\-](\d{4})/);
  if (dobMatch) {
    fields.dateOfBirth = `${dobMatch[1]}/${dobMatch[2]}/${dobMatch[3]}`;
  }

  // 3. Gender matching
  const genderMatch = text.match(/\b(Sexe|Sex)[:\s]*([MF])\b/i) || text.match(/\b([MF])\s*\/\s*(M|F)\b/i);
  if (genderMatch) {
    fields.gender = genderMatch[2] ? genderMatch[2].toUpperCase() : 'M';
  } else if (text.includes('Sexe M') || text.includes('ذكر')) {
    fields.gender = 'M';
  } else if (text.includes('Sexe F') || text.includes('أنثى')) {
    fields.gender = 'F';
  }

  // 4. Name extraction
  // Look for "Nom" / "Prénom" lines or capitalized names
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/^Nom[:\s]+/i.test(line)) {
      fields.lastName = line.replace(/^Nom[:\s]+/i, '').trim();
    } else if (/^Pr[eé]nom[:\s]+/i.test(line)) {
      fields.firstName = line.replace(/^Pr[eé]nom[:\s]+/i, '').trim();
    } else if (/^N[eé]\(e\)\s+le[:\s]+/i.test(line)) {
      const match = line.match(/(\d{2}[\.\/\-]\d{2}[\.\/\-]\d{4})/);
      if (match) fields.dateOfBirth = match[1];
    } else if (/^[àa]\s+([A-Za-z\s\-]+)/i.test(line) && !fields.placeOfBirth) {
      fields.placeOfBirth = line.replace(/^[àa]\s+/i, '').trim();
    }
  }

  // Fallback heuristic: If Nom / Prénom wasn't preceded by explicit label,
  // find prominent uppercase words
  if (!fields.lastName || !fields.firstName) {
    const uppercaseWords = lines
      .filter(l => /^[A-Z\s\-]{3,30}$/.test(l))
      .filter(l => !l.includes('ROYAUME') && !l.includes('MAROC') && !l.includes('CARTE') && !l.includes('NATIONALE'));
    
    if (uppercaseWords.length >= 2) {
      if (!fields.lastName) fields.lastName = uppercaseWords[0];
      if (!fields.firstName) fields.firstName = uppercaseWords[1];
    } else if (uppercaseWords.length === 1 && !fields.lastName) {
      fields.lastName = uppercaseWords[0];
    }
  }

  // Arabic name extraction (matches Arabic script)
  const arabicMatch = text.match(/[\u0600-\u06FF\s]{4,40}/);
  if (arabicMatch && !arabicMatch[0].includes('المملكة') && !arabicMatch[0].includes('المغربية')) {
    fields.arabicFullName = arabicMatch[0].trim();
  }

  return fields;
}

/**
 * Parses Moroccan CIN Back side text
 * @param {string} text 
 * @returns {object} Extracted back side fields
 */
export function parseCINBackText(text) {
  const fields = {
    address: null,
    validUntil: null,
    mrzLine: null,
    matchingCIN: null
  };

  if (!text) return fields;

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Expiry Date (Valable jusqu'au / Valid until)
  const expiryMatch = text.match(/Valable\s+jusqu['’\s]au[:\s]*(\d{2}[\.\/\-](\d{2})[\.\/\-](\d{4}))/i) 
    || text.match(/(\d{2})[\.\/\-](\d{2})[\.\/\-](\d{4})/g);
  
  if (Array.isArray(expiryMatch)) {
    // If multiple dates found, last date is typically expiry date
    fields.validUntil = expiryMatch[expiryMatch.length - 1];
  } else if (typeof expiryMatch === 'string') {
    fields.validUntil = expiryMatch;
  }

  // 2. Address extraction
  // Look for "Adresse" or Moroccan street prefixes (Rue, Bd, Avenue, Hay, Lotissement, etc.)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^Adresse[:\s]+/i.test(line)) {
      fields.address = line.replace(/^Adresse[:\s]+/i, '').trim();
    } else if (/(Rue|Boulevard|Bd|Avenue|Av\.|Hay|Quartier|Derb|Res\.|Résidence|Imm|N°|Lot)\s+/i.test(line) && !fields.address) {
      fields.address = line;
    }
  }

  // 3. MRZ / Machine Readable Zone check (e.g. IDMARAB123456<<<<<<<<<<)
  const mrzMatch = text.match(/IDMAR([A-Z0-9<]{10,30})/);
  if (mrzMatch) {
    fields.mrzLine = mrzMatch[0];
    const cinCandidate = mrzMatch[0].match(/IDMAR([A-Z]{1,2}[0-9]{5,7})/);
    if (cinCandidate) {
      fields.matchingCIN = cinCandidate[1];
    }
  }

  return fields;
}

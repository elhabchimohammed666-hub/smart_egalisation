import Jimp from 'jimp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createSampleImages() {
  const outputDir = path.join(__dirname, '../uploads/cin');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
  const fontBig = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

  // 1. Valid CIN Front (Yassine El Amrani)
  const front1 = new Jimp(800, 500, '#e8f4ec');
  front1.print(fontBig, 40, 30, 'ROYAUME DU MAROC');
  front1.print(font, 40, 75, 'CARTE NATIONALE D\'IDENTITE');
  front1.print(font, 40, 140, 'Nom: EL AMRANI');
  front1.print(font, 40, 180, 'Prenom: YASSINE');
  front1.print(font, 40, 220, 'Ne(e) le: 14.05.1994 a Casablanca');
  front1.print(font, 40, 260, 'Sexe: M  Nationalite: Marocaine');
  front1.print(fontBig, 40, 340, 'CIN: BK789456');
  // Decorative border
  for (let x = 0; x < 800; x++) {
    front1.setPixelColor(Jimp.cssColorToHex('#006233'), x, 0);
    front1.setPixelColor(Jimp.cssColorToHex('#006233'), x, 499);
  }
  await front1.writeAsync(path.join(outputDir, 'sample_cin_front.png'));

  // 2. Valid CIN Back
  const back1 = new Jimp(800, 500, '#e8f4ec');
  back1.print(font, 40, 40, 'Adresse: 24 RUE IBN BATOUTA CASABLANCA');
  back1.print(font, 40, 80, 'Valable jusqu au: 12.10.2032');
  back1.print(font, 40, 130, 'Fils de: OMAR et FATIMA');
  front1.print(fontBig, 40, 380, 'IDMARBK789456<<<<<<<<<<<<<<<<<');
  await back1.writeAsync(path.join(outputDir, 'sample_cin_back.png'));

  // 3. Blurry image for testing "Rejected: Poor Quality"
  const blurry = new Jimp(800, 500, '#e8f4ec');
  blurry.print(fontBig, 40, 40, 'CARTE NATIONALE FLOUE');
  blurry.blur(18); // Extreme blur
  await blurry.writeAsync(path.join(outputDir, 'sample_blurry.png'));

  console.log('[Synthetic] Sample CIN images generated in uploads/cin/');
}

createSampleImages().catch(console.error);

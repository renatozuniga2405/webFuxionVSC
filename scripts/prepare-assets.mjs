import { readFile, writeFile } from 'node:fs/promises';
// Lossless vector windows around the original photos. Embedded JPEG bytes stay unchanged.
const assets = [
  { slug:'thermo-t', width:704, height:255, box:'74 44 566 153', points:'78,51 135,56 570,51 625,46 629,68 629,160 636,191 577,186 137,193 82,187' },
  { slug:'nocarb-t', width:699, height:358, box:'71 79 561 166', points:'74,102 131,103 570,86 612,82 618,113 625,194 631,220 575,225 132,242 79,239' },
  { slug:'beauty-in', width:894, height:1601, box:'75 709 752 207', points:'81,716 141,718 218,726 525,726 773,714 817,711 825,720 819,730 824,740 819,750 824,760 819,770 824,780 819,790 824,800 819,810 824,820 819,830 824,840 819,850 824,860 819,870 824,880 819,890 824,902 818,909 759,908 573,899 241,904 133,909 80,908 76,902 82,892 77,882 82,872 77,862 82,852 77,842 82,832 77,822 82,812 77,802 82,792 77,782 82,772 77,762 82,752 77,742 82,732 77,722' },
];
for(const asset of assets){
  const dir = new URL(`../public/products/${asset.slug}/`, import.meta.url);
  const data = await readFile(new URL('original.jpeg',dir));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${asset.box}"><defs><clipPath id="pack"><polygon points="${asset.points}"/></clipPath></defs><image width="${asset.width}" height="${asset.height}" href="data:image/jpeg;base64,${data.toString('base64')}" clip-path="url(#pack)"/></svg>`;
  await writeFile(new URL('pack.svg',dir),svg);
  console.log(`${asset.slug}: original JPEG preserved, ${Math.round(Buffer.byteLength(svg)/1024)} KB SVG`);
}

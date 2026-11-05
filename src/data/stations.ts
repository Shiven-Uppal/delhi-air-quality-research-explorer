export type Station = { name: string; area: string; x: number; y: number; base: number; phase: number };

// Coordinates are display positions for the schematic Delhi map. Forecast values
// are illustrative until the reproducible data pipeline is added.
export const stations: Station[] = [
  ['Anand Vihar','East Delhi',82,48,153,0], ['Ashok Vihar','North West Delhi',40,23,128,1], ['Aya Nagar','South Delhi',43,82,86,2],
  ['Bawana','North West Delhi',25,12,115,3], ['Burari Crossing','North Delhi',52,16,126,4], ['CRRI Mathura Road','South East Delhi',58,65,112,5],
  ['Dwarka Sector 8','South West Delhi',22,70,91,6], ['Dr Karni Singh Shooting Range','South Delhi',47,88,83,7], ['DTU','North West Delhi',30,19,119,8],
  ['Dilshad Garden','East Delhi',75,45,145,9], ['IGI Airport','South West Delhi',33,67,96,10], ['IHBAS Dilshad Garden','East Delhi',79,43,142,11],
  ['Jahangirpuri','North Delhi',49,21,137,12], ['Jawaharlal Nehru Stadium','South Delhi',58,70,103,13], ['Lodhi Road','Central Delhi',57,58,108,14],
  ['Major Dhyan Chand Stadium','Central Delhi',59,55,110,15], ['Mandir Marg','Central Delhi',52,48,118,16], ['Mundka','West Delhi',15,43,124,17],
  ['Najafgarh','South West Delhi',10,70,98,18], ['Narela','North Delhi',48,5,133,19], ['Nehru Nagar','South Delhi',57,75,101,20],
  ['North Campus','North Delhi',51,35,123,21], ['NSIT Dwarka','South West Delhi',19,74,92,22], ['Okhla Phase 2','South East Delhi',67,75,118,23],
  ['Patparganj','East Delhi',76,55,149,24], ['Pusa Road','Central Delhi',45,48,120,25], ['Punjabi Bagh','West Delhi',34,43,127,26],
  ['R K Puram','South Delhi',44,67,98,27], ['Rohini','North West Delhi',34,18,121,28], ['Shadipur','West Delhi',38,49,122,29], ['Sonia Vihar','North East Delhi',86,34,140,30]
].map(([name, area, x, y, base, phase]) => ({ name, area, x, y, base, phase })) as Station[];

export const scenarios = {
  typical: { label: 'Typical day', factor: 1, colour: '#0f766e' },
  winter: { label: 'Winter episode', factor: 1.32, colour: '#a14b1d' },
  windy: { label: 'Windy day', factor: 0.72, colour: '#2563eb' },
} as const;

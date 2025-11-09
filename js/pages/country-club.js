import clubInfoAndEvents from "../utils/club-info-and-events.js";

export default async function countryClub() {
  const clubInfo = await clubInfoAndEvents('5cc6')
  return `
  
  <body>
  
  </body>
  `
}
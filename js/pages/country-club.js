import clubInfoAndEvents from "../utils/club-info-and-events.js";

export default async function countryClub() {
  //const clubInfo = await clubInfoAndEvents('5cc6')
  //console.log(JSON.stringify(clubInfo))
  return fetch ('../country-club.html')
    .then (response => response.text());
}
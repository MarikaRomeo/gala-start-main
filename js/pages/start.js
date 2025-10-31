import clubInfoAndEvents from "../utils/club-info-and-events.js";

export default async function start() {
  const eventHtml = await clubInfoAndEvents();
  return `
    <h1>Alla kommande events på Gala</h1>
    <p>Gala är en samlingsplats för olika musikklubbar.</p>
    ${eventHtml}
  `;
}
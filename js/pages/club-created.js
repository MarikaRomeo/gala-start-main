export default async function clubCreated() {
  // get all clubs
  const allClubs = await (await fetch('http://localhost:3000/clubs')).json();
  // show list of clubs
  return `
    <h1>Klubben skapades</h1>
    <p>Nu finns följande klubbar:</p>
    ${allClubs.toReversed().map(({ id, name, description }) => `
      <h3>${name} (id: ${id})</h3>
      <p>${description}</p>
    `).join('')}
  `;
}
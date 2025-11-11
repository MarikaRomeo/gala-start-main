export default async function createClub() {
  return `
    <h2>Skapa en klubb</h2>
    <form id="create-club">
      <input type="text" name="name" placeholder="Klubbnamn">
      <textarea name="description" placeholder="Beskrivning"></textarea>
      <input type="submit" value="Skapa">
    </form>
  `;
}

async function submitForm(event) {
  const target = event.target;
  // easy way to read values from forms - no querySelector needed!
  const name = target.name.value;
  const description = target.description.value;
  await fetch('http://localhost:3000/clubs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }) // stringify = serialize
  });
  // goto club-created page
  location.hash = '#club-created';
}

// add event listener
document.body.addEventListener('submit', async event => {
  if (!event.target.closest('#create-club')) { return; }
  event.preventDefault();
  await submitForm(event);
});
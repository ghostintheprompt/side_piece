const transcript = process.argv.slice(2).join(' ') || 'Hi Michael, this is Carol. The Friday deadline moved up and I need a yes today before 3. Call me back at 212-555-0198.';
const endpoint = process.env.SIDE_PIECE_URL || 'http://localhost:3000';

const response = await fetch(`${endpoint.replace(/\/$/, '')}/api/voice/local-message`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from: process.env.CALLER_NUMBER || '+12125550198',
    to: 'Cynthia',
    transcript
  })
});

if (!response.ok) {
  console.error(`Cynthia's switchboard refused the call: ${response.status}`);
  console.error(await response.text());
  process.exit(1);
}

const record = await response.json();
console.log(JSON.stringify(record, null, 2));

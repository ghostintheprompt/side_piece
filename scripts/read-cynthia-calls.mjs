const endpoint = process.env.SIDE_PIECE_URL || 'http://localhost:3000';

const response = await fetch(`${endpoint.replace(/\/$/, '')}/api/voice/local-calls`);

if (!response.ok) {
  console.error(`Cynthia's inbox stayed locked: ${response.status}`);
  console.error(await response.text());
  process.exit(1);
}

const { calls } = await response.json();

if (!calls.length) {
  console.log('No calls in the drawer yet.');
  process.exit(0);
}

for (const call of calls) {
  console.log(`\n[${call.createdAt}] ${call.from} -> ${call.to || 'Cynthia'} (${call.status})`);
  if (call.summary?.memo) console.log(call.summary.memo);
  if (call.summary?.requestedAction) console.log(`Action: ${call.summary.requestedAction}`);
}

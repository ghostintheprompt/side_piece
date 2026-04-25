/**
 * Lightweight GitHub Releases API checker for MDRN Corp apps.
 * Checks for updates on launch with a 3s delay.
 */

const REPO = 'ghostintheprompt/side-piece';
const CURRENT_VERSION = '1.0.0';

export async function checkForUpdates() {
  // 3s delay as requested
  await new Promise(resolve => setTimeout(resolve, 3000));

  try {
    const response = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`);
    if (!response.ok) return;

    const data = await response.json();
    const latestVersion = data.tag_name?.replace('v', '');

    if (latestVersion && isNewer(latestVersion, CURRENT_VERSION)) {
      console.log(`[Updater] A new version is available: ${latestVersion}`);
      return {
        version: latestVersion,
        url: data.html_url
      };
    }
  } catch (error) {
    console.error('[Updater] Failed to check for updates:', error);
  }
  return null;
}

function isNewer(latest: string, current: string) {
  const l = latest.split('.').map(Number);
  const c = current.split('.').map(Number);
  for (let i = 0; i < l.length; i++) {
    if (l[i] > (c[i] || 0)) return true;
    if (l[i] < (c[i] || 0)) return false;
  }
  return false;
}

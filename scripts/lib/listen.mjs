// Listen on an ephemeral port that fetch() is willing to connect to.
//
// fetch() (undici) refuses a fixed list of "bad ports" (the Fetch Standard's blocked
// ports: IRC, X11, SIP, ...) and fails with `TypeError: fetch failed` / `bad port`. Hosts
// whose ephemeral range overlaps that list, such as a Windows machine with the dynamic
// range moved down to 1024-15000 or some container setups, can hand one out for
// `listen(0)`, so tests and smoke scripts that call their own server would fail at random.
// Ports are normally allocated sequentially there, so a single unlucky port often takes
// several consecutive requests down with it.

export const FETCH_BLOCKED_PORTS = Object.freeze(new Set([
  1, 7, 9, 11, 13, 15, 17, 19, 20, 21, 22, 23, 25, 37, 42, 43, 53, 69, 77, 79, 87, 95, 101,
  102, 103, 104, 109, 110, 111, 113, 115, 117, 119, 123, 135, 137, 139, 143, 161, 179, 389,
  427, 465, 512, 513, 514, 515, 526, 530, 531, 532, 540, 548, 554, 556, 563, 587, 601, 636,
  989, 990, 993, 995, 1719, 1720, 1723, 2049, 3659, 4045, 4190, 5060, 5061, 6000, 6566, 6665,
  6666, 6667, 6668, 6669, 6679, 6697, 10080
]));

/**
 * Start `server` on a random port that is not in FETCH_BLOCKED_PORTS.
 * @param {import('node:net').Server} server
 * @param {string} [host] interface to bind (default: all interfaces, like `listen(0)`)
 * @returns {Promise<number>} the port
 */
export async function listenOnUsablePort(server, host, { attempts = 100 } = {}) {
  for (let attempt = 1; ; attempt += 1) {
    await new Promise((resolve, reject) => {
      const onError = (error) => {
        server.off('listening', onListening);
        reject(error);
      };
      const onListening = () => {
        server.off('error', onError);
        resolve();
      };
      server.once('error', onError);
      server.once('listening', onListening);
      server.listen(0, host);
    });
    const { port } = server.address();
    if (!FETCH_BLOCKED_PORTS.has(port)) return port;
    if (attempt >= attempts) {
      throw new Error(`could not get an ephemeral port that fetch accepts (last was ${port})`);
    }
    await new Promise((resolve) => server.close(resolve));
  }
}

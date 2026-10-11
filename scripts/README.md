# Local preview

Run `node scripts/preview.cjs`, then open <http://127.0.0.1:8766>.
Keep this process running while previewing. Reload the tab after changes.

The server listens only on loopback. It serves local files with caching disabled and
forwards the three existing `/api/*` routes to `https://moller-bil.vercel.app`, so
inventory and assistant requests use the deployed backend without copying API keys.
Assistant requests may consume the production API quota.

This endpoint was verified in the Codex in-app browser with the user's proxy enabled.
The previous port 8765 was occupied by an unresponsive old preview process; this
server uses 8766. No system proxy or firewall settings need to change.

For a background Windows preview, use `Start-Process -WindowStyle Hidden` with the
Node executable, `scripts/preview.cjs`, and the repository as its working directory.
Keep startup/error logs so an occupied port is visible instead of becoming a browser timeout.

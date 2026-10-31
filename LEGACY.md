# legacy-react/

The previous React (CRA) shop, unchanged, including its `api/` serverless functions.
It still powers login, my-order, invoices, requests, part-finder and the games.

Deploy it as its own Vercel project: Import this repo -> Root Directory = `legacy-react`.
Then set `APP_ORIGIN` and `NEXT_PUBLIC_APP_URL` on the Next.js project to that project's URL.
Its vercel.json adds `X-Robots-Tag: noindex` so the second URL never competes in Google.

Roll back everything: `git revert <migration commit>` restores the old layout at the repo root.

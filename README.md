# 筋道 · Sujimichi — N3 / N2 grammar

A one-file JLPT grammar trainer with a daily spaced-repetition queue, practice
drills, and a grammar reference. Everything runs in the browser; progress lives
in `localStorage` on the device.

## Files

```
index.html                  the whole app
manifest.json               Add to Home Screen metadata (Android + Chrome)
sw.js                       offline cache
apple-touch-icon.png        iOS home-screen icon (180x180)
favicon.ico                 browser tab icon
icons/                      PNG/SVG icons + the paper-grain tile
build/make-icons.pl         regenerates every icon from one 16x16 pixel grid
build/make-paper.pl         regenerates the paper texture
build/serve.pl              local server, for testing the way Pages serves it
```

All paths are relative, so this works both at a domain root and under
`username.github.io/repo-name/`.

## Publishing

Push the whole folder to GitHub, then Settings → Pages → deploy from branch.
**Bump `CACHE` in `sw.js`** every time you publish, otherwise phones keep
serving the copy they already cached.

To test locally first — the service worker and the manifest need a real
`http://` origin, so opening `index.html` off disk is not a sufficient check:

```bash
perl build/serve.pl 8765
```

## Add to Home Screen

- **iPhone** — open in Safari (not Chrome), Share → Add to Home Screen.
- **Android** — Chrome menu → Install app / Add to Home Screen.

Installing matters for more than the icon: iOS wipes `localStorage` for
ordinary websites after about a week of not visiting, but leaves installed web
apps alone. Study from the home-screen icon, not a Safari tab.

Progress still only exists on that one device. 記録 → バックアップ → コピー
copies your whole record as text; paste it somewhere safe now and then.

## The daily queue

`S.day` is the ledger for today and is the source of truth:

| field     | meaning                                        |
|-----------|------------------------------------------------|
| `newIds`  | patterns handed out as new today — never shrinks |
| `learned` | new patterns you pressed 覚えた on               |
| `done`    | patterns that got a rating (except もう一度)     |
| `extra`   | extra new cards granted by おかわり              |

`S.q` — the queue on screen — is only a view of that ledger and gets rebuilt
whenever the level chip, a setting, or a new day changes the picture. A rebuild
keeps the answered head of the queue and re-plans only the tail, and tops new
cards up to `newPerDay - newIds.length`. That is what stops a rebuild from
dealing a second batch or throwing away a session in progress.

## Icons

Both the app icon and the plant that grows on the 今日 screen come from the same
16x16 grid, edited as ASCII in `build/make-icons.pl` and `index.html`. Every PNG
is that grid at an **integer** scale, centred with background padding to reach
the exact size a platform wants — at a fractional scale the pixels come out
uneven and the art goes soft.

```bash
perl build/make-icons.pl
perl build/make-paper.pl
```

# Toetscijfers

A Dutch grade calculator for teachers. Set the maximum score and the percentage worth a 6.0 to generate a descending table in half-point steps, including zero.

Grades increase linearly from 1.0 at zero to 6.0 at the selected threshold, then to 10.0 at full marks. The threshold may fall between two attainable scores. Grades are rounded once to the nearest tenth. Rounded grades below 5.5 appear in red.

## Development

Use Node.js 24 or newer.

```sh
npm ci
npm run dev
```

Run `npm test` for the grading examples and `npm run knip` to check for unused code and dependencies.

## Deployment

Run `npm run deploy` with Wrangler authenticated to your Cloudflare account. Workers serves the files in `public/` directly. The browser calculates the table locally.

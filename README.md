# Toetscijfers

A Dutch grade calculator for teachers. Set the maximum score and the percentage worth a 6.0 to generate a descending table in half-point steps, including zero.

One straight line connects 6.0 at the selected threshold to 10.0 at full marks and extends down to zero points. Grades have a minimum of 1.0. With an 80% threshold, a score of 60% earns 2.0 and scores of 55% or less earn 1.0. With a 50% threshold, zero points earns 2.0. The threshold may fall between two attainable scores. Grades are rounded once to the nearest tenth. Rounded grades below 5.5 appear in red.

## Development

Use Node.js 24 or newer.

```sh
npm ci
npm run dev
```

Run `npm test` for the grading examples and `npm run knip` to check for unused code and dependencies.

Shared colors, font families, spacing and corner radii live in `public/tokens.css`. Use these CSS custom properties in `public/style.css`.

Run `npm run format` to format the project or `npm run format:check` to check it without writing changes.

## Accessibility

Install Chromium once with `npx playwright install chromium`, then run `npm run test:a11y`. Playwright starts the local Worker and runs axe checks for WCAG 2.2 A and AA at desktop and narrow widths. The suite also exercises keyboard navigation, error descriptions and table pagination. GitHub Actions runs it on pull requests and pushes to main.

When changing an interaction, also check visible focus and listen to field errors and result updates with a screen reader. These need human evaluation.

## Deployment

The root Wrangler configuration is for local development. Each deploy command selects a named environment. Authenticate Wrangler to the Cloudflare account before deploying.

| Environment | Command               | URL                                 |
| ----------- | --------------------- | ----------------------------------- |
| Test        | `npm run deploy:test` | Assigned by Wrangler at deploy time |
| Production  | `npm run deploy`      | <https://toetscijfers.nl>           |

Each command publishes the files in `public/` from the current checkout to its own Worker. The browser calculates the table locally.

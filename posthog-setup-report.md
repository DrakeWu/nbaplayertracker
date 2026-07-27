# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the NBA Player Tracker app. PostHog is initialized in `client/src/main.tsx` using environment variables from `client/.env`. Event captures and user identification have been added to `App.tsx` and `UserLogin.tsx`. Error tracking via `posthog.captureException` is wired in around all API calls. Users are identified by their stable Redis-stored ID on both login and page refresh.

| Event name | Description | File |
|---|---|---|
| `player_searched` | User submits a player search query. | `client/src/App.tsx` |
| `player_found` | Search returns a valid player result. | `client/src/App.tsx` |
| `player_not_found` | Search returns no results or an error. | `client/src/App.tsx` |
| `season_year_changed` | User selects a different season year from the dropdown. | `client/src/App.tsx` |
| `login_attempted` | User submits the login form. | `client/src/UserLogin.tsx` |
| `login_succeeded` | User successfully authenticates and a session is set. | `client/src/UserLogin.tsx` |
| `login_failed` | Login attempt fails due to incorrect credentials. | `client/src/UserLogin.tsx` |
| `profile_saved` | User saves edits to their display name or favorite team. | `client/src/UserLogin.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard:** https://us.posthog.com/project/523785/dashboard/1888494
- **Player searches over time:** https://us.posthog.com/project/523785/insights/EBdwg1AW
- **Login funnel:** https://us.posthog.com/project/523785/insights/UhnmUNhj
- **Player search success rate:** https://us.posthog.com/project/523785/insights/KNuUueLk
- **Season year popularity:** https://us.posthog.com/project/523785/insights/K2OYA8Z5
- **Profile saves over time:** https://us.posthog.com/project/523785/insights/YJ3kZDzg

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `VITE_PUBLIC_POSTHOG_KEY` and `VITE_PUBLIC_POSTHOG_HOST` to `client/.env.example` and any bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.
- [ ] Confirm the returning-visitor path also calls `identify` — a handler that only identifies on fresh login can leave returning sessions on anonymous distinct IDs.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

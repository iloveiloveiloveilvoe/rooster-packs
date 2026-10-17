<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep moderation permissions in protected user_roles and enforce kick/ban status through database functions and restrictive profile RLS; the typed panel sequence only reveals UI, never grants permissions.
- Expose the leaderboard through a signed-in RPC returning only names and coins; private collections remain owner-only.
- Keep pack draw-order rules in a browser-safe module with unit tests; never sort reveals by rarity.

# Ethan Galaxy Defender

Complete browser arcade space shooter. Open index.html through a local HTTP server or visit the deployed Vercel site. Install the PWA to play offline after the first successful cache.

## Included
30 campaign missions across six galaxies, six guardian boss battles, endless survival, three ships, weapon and hull upgrades, credit rewards, four power-ups, nova blasts, three difficulty levels, synthesized sound, pause/resume, keyboard and touch controls, fullscreen and device-local progress.

## Hosting on GitHub / Vercel
The live site serves the repository root. Import this repository into Vercel, use Other as the framework, leave the build command empty and use the root directory as the output directory. All game assets are local. No API keys are required.

## Controls
WASD or arrow keys to steer; auto-fire is enabled. Space launches a nova. P or Escape pauses. Drag on the canvas for touch steering.

## Saving
Progress saves in localStorage for the current browser/device. Clearing browser data removes the save. There are no online accounts or shared leaderboards.

## Validation
JavaScript syntax checked. Simulated completion of all 30 missions and six bosses; verified credit rewards, defeat, survival high score, nova charges, pause/resume, saving, and 60 seconds of continuous gameplay. Browser visual QA was unavailable in this environment.


## Pilot career upgrade v2

- Daily Sector Alert: one deterministic higher-risk mission per local calendar day, with a one-time 350-credit clear reward and a saved daily best.
- Mission mastery: best score, fastest clear, best kill count and a one-to-three-star medal for each campaign mission.
- Six career commendations reward credits for first clear, Guardian victories, ten missions, full campaign completion, survival score and collecting the full fighter fleet.
- Pilot Records combines all thirty mission records and commendations.
- Export / restore pilot backups in version 2 JSON format. Existing local version 1 save data is upgraded automatically without discarding credits, campaign progress, ships or upgrades.
- Installable offline PWA with the game shell and local fighter artwork cached after the first online visit.
- Automated progression tests cover legacy save migration, input validation, deterministic daily alerts and mission medal grading.

The deployed site is a static Vercel project with no server-side account or global leaderboard. Pilot records and daily results remain local to each browser/device; exporting a backup is the supported way to move progress.

# Provenance Lab

A browser-based teaching lab for people new to clinical informatics, from students to attendings. Learners trace where clinical information went, find where a workflow let it fall through, change the rules, and test what the change does.

**Status: prototype, not yet clinically reviewed. All patient data is synthetic.**

## Modules

| Module | Version | What learners do |
| --- | --- | --- |
| The unassigned result | 0.5 | Investigate a missed follow-up for a CT result finalized after discharge, redesign five workflow rules, replay the incident, and stress-test the design with the responsible clinician away |
| Ambient AI note verification (warm-up) | 0.3 | Check an AI-drafted clinic note against the visit transcript and chart before signing |
| Ambient AI note verification, hard mode | 0.1 | Built but hidden from the menu |

The workflow lab draws on published work on results pending at discharge, chiefly Dalal et al. (J Gen Intern Med, 2018). Its replay is an authored teaching model, not a prediction of real-world rates. Each rule in the model is labeled in the page as literature-informed or written for the lab.

## How it works

Everything lives in `index.html`: content, logic, and styles. There is no build step, server, or account system.

- Progress is saved in each learner's own browser and stays on that device.
- Learners can copy a session summary from the debrief and send it to an instructor.
- The page checks its own content when it loads and shows a warning if anything is inconsistent.

## Run it locally

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Run the checks

Requires Node 18 or later. Run this before every update:

```
node tests/replay-checks.cjs
```

It validates all content, runs the model and engine checks, and replays all 96 designs in both scenarios. It exits with an error if anything fails.

## Publish with GitHub Pages

1. Create a repository named `provenance-lab` and add these files.
2. In **Settings → Pages**, choose **Deploy from a branch**, then `main` and `/ (root)`.
3. Open the published URL and test the full lesson: refresh and resume, reset, keyboard navigation, phone layout, and copying the session summary.
4. When a version has been reviewed, mark it as a release so it can be reproduced later.

GitHub Pages on a free account requires a public repository. Publishing from a private repository needs a paid plan.

## Content review

`review/content-review.md` records reviews against exact versions. A change to the scenario or replay rules reopens the affected items. Keep named reviewer comments out of this repository unless reviewers agree; store a summary here and the full record elsewhere.

## Changing content

- Edit `index.html`, then bump the version of any module you changed. The version is part of the saved-progress key, so learners start that module fresh.
- Run `node tests/replay-checks.cjs`.
- Record what changed and whether it reopens review items.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE). The license covers this repository's original software and authored teaching material; cited publications retain their own terms.

# Campaign Audit

Campaign state: repository-complete; live hosting remains blocked by GitHub Pages activation permissions

## Repository and validation results

- Required source and document files: present on `main`
- Visible company identity: passed with clearly typeset employer name and independent-candidate qualifier
- Official logo/wordmark: unavailable with documented binary-acquisition failure; no traced or candidate-created substitute
- Color token provenance: passed
- Typography decision: passed
- Document brand continuity: passed
- Visual experience: passed after user-identified hero overlap correction
- Role-derived motion: passed
- Meaningful interaction: passed; four scenarios, reset behavior and `aria-pressed` state verified
- UX psychology: passed
- Smart starting state: passed
- Value before ask: passed
- Cost-of-inaction integrity: passed
- Contextual comparison integrity: passed
- Dark-pattern review: passed
- Hero overlap regression: passed in headless Chromium at 1280x800, 968x1180 and 390x844
- Hero geometry checks: zero seal/Recovery-row intersection, zero caption/document intersection, zero caption/next-section intersection and zero horizontal overflow
- Reduced motion: passed at source level
- Resume pagination: passed; exactly two US Letter pages
- Cover-letter pagination: passed; exactly one US Letter page
- Other PDFs: passed; interview brief three pages, 90-day plan and review three pages, Agent Title Review one page
- Reciprocal resume and cover-letter navigation: passed at source level
- Candidate contact information: passed in HTML and extracted PDF text
- Candidate-facing confidentiality: passed in source, filenames, PDF text and PDF metadata
- Forbidden internal-name matches: 0
- Regenerated PDF commit: present on `main`

## Remaining publication gate

The GitHub Actions token successfully generated the PDFs, ran the browser geometry tests and committed the validated documents. The subsequent API request to activate workflow-based GitHub Pages was denied by the available repository permission, so no live URL is claimed. GitHub Pages must be enabled with repository-level administrative access, after which the live site, interaction, reciprocal links and PDF downloads should receive a final published-route check.

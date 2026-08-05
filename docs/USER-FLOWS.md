# AI FACE user and community flows

<p align="center">
  <strong>English</strong> ·
  <a href="./USER-FLOWS.zh-TW.md">繁體中文</a>
</p>

This is the source of truth for how ordinary users, character creators, voters,
and maintainers move between AI FACE and AI FACE Personas.

## Status words

- **Available now**: the flow exists in the Phase 6 internal trial.
- **Planned**: the intended public experience is not available yet.
- **GitHub required**: the action changes the public community catalog.

## The two projects

| Project | Responsibility |
| --- | --- |
| [AI FACE](https://github.com/page5888/AI-FACE) | Chrome extension, built-in characters, local import, ChatGPT overlay, animation, voice response, layout, and always-on-top mode. |
| [AI FACE Personas](https://github.com/page5888/AI-FACE-Personas) | Reviewed public character packs, contribution rules, copyright review, community voting, and catalog history. |

The planned public website is the human-friendly front door. Visitors should not
need to understand repositories, manifests, pull requests, or sprite sheets.

## 1. Ordinary user flow

### Available now: downloadable Phase 6 preview

```text
Open the public AI FACE website
→ Download AI-FACE-Preview.zip
→ Extract the ZIP
→ Open chrome://extensions
→ Enable Developer mode
→ Select Load unpacked and choose the folder containing manifest.json
→ Open or refresh ChatGPT
→ Haruna appears automatically
→ Choose Haruna, Miu, or Nova from the AI FACE extension button
```

The current preview no longer requires GitHub, Node.js, Terminal, or a source
build. It still uses Chrome Developer mode because it is not yet published in
the Chrome Web Store. Voice sync, layout controls, and other preview behavior
still require the permissions and explicit user actions documented by AI FACE.

### Planned: Chrome Web Store flow

```text
Open the AI FACE website
→ Select Install AI FACE
→ Install from the Chrome Web Store
→ Open ChatGPT
→ Choose a character
→ Start using AI FACE
```

An ordinary user must not need a GitHub account, source checkout, Node.js,
sprite-sheet knowledge, or a voting account to use approved characters.

## 2. Personal character flow

This flow is for a character used only by its owner. It does not publish files.

```text
Create or obtain an image you are authorized to use
? Open Choose character in AI FACE
? Select a supported import mode
? AI FACE validates, normalizes, and saves the result locally
? Use the character in ChatGPT
```

- No GitHub account is required.
- The image stays in Chrome local extension storage.
- Local import does not submit the character to the public catalog.
- The user remains responsible for having the right to use the image.

## 3. Browse approved community characters

**Current:** the reviewed catalog lives in this repository and begins empty.

**Planned website experience:**

```text
Open Browse Characters
? Preview approved characters
? Read creator and license attribution
? Add or select a compatible character in AI FACE
```

Browsing approved characters should not require GitHub login. The public website
must show only accepted catalog data, never pending uploads.

## 4. Submit a public character

Public distribution is stricter than local personal use.

```text
Create an original character
? Confirm ownership, redistribution rights, and license
? Prepare persona.json, preview.png, and spritesheet.png
? Fork AI-FACE-Personas
? Run npm test and npm run validate
? Open a pull request and complete every rights declaration
? Automated technical validation
? Maintainer copyright and safety pre-review
? Community vote
? Maintainer final approval
? Merge into the reviewed catalog
```

**GitHub is required only for public submission, review, and voting.** It is not
required for ordinary product use or local import.

## 5. Community voting and approval

Voting measures community interest. It does not establish copyright ownership.

```text
Pull request passes automated validation
? Maintainer confirms eligibility for public review
? Maintainer opens a linked GitHub Discussions poll
? Community reviews preview, attribution, and license
? Poll closes after the stated period
? Maintainer records the result on the pull request
? Maintainer approves, requests changes, or rejects
```

Recommended states:

- `rights-review` ? ownership and redistribution review is pending.
- `vote-open` ? community voting is open.
- `community-approved` ? the vote passed; final review is still required.
- `changes-requested` ? technical or visual corrections are required.
- `rejected-copyright` ? rejected for a rights concern.
- `accepted` ? merged into the public catalog.

A popular vote can never override a credible copyright, trademark, privacy, or
safety concern. Voting must not automatically merge a pull request.

## 6. Copyright report and removal

```text
Reporter identifies the exact public file
? Reporter uses the copyright issue form without posting private data
? Maintainer pauses voting or distribution when the concern is credible
? Maintainer reviews manifest, attribution, public evidence, and history
? Submission is cleared, corrected, rejected, or removed
? Formal legal notices continue through GitHub's official process
```

Do not post private contracts, identity documents, addresses, phone numbers,
source photographs, or other sensitive evidence in a public issue.

## 7. Friction boundary

| Goal | GitHub required? | AI FACE backend required? |
| --- | --- | --- |
| Install and use AI FACE | No | No |
| Choose an approved character | No | No |
| Import a personal local character | No | No |
| Browse the planned public gallery | No | No |
| Submit to the public catalog | Yes | No |
| Vote during the GitHub Discussions phase | Yes | No |
| File an informal repository concern | Yes | No |

The project keeps ordinary use frictionless while keeping public distribution
reviewable and auditable.

## 8. Stop conditions

A character must not enter or remain in the public catalog when:

- ownership or redistribution rights are unclear;
- the design reproduces recognizable third-party intellectual property;
- required files or declarations are missing;
- automated validation fails;
- a credible unresolved rights or safety concern exists; or
- the maintainer has not given final approval.

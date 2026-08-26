# Content needed

Everything below is a slot that is already built and wired. Drop the file in
the named folder, or paste the text into the named file, and it appears. No
code changes are needed for any of it.

This list exists because the site's remaining weakness is not craft. It is that
a firm which sells judgement about people currently shows no people, no named
proof, and no client marks. That reads as a shell, and no amount of motion or
typography fixes it.

Ordered by how much each one changes the impression of the site.

---

## 1. Photography of the team

**The single biggest gap.** An executive search firm with no faces on its
website is the thing that makes a visitor doubt the firm exists. This is a
people business and the site currently has zero people in it.

    public/team/<firstname>-<lastname>.jpg

- 800 x 1000 (4:5 portrait), or 1000 x 1000 square. Consistent across the set.
- Shot against a consistent background. Mixed backgrounds are worse than no
  photos: they read as scraped from LinkedIn.
- One per person who appears on `/about/team`.

If a full shoot is not happening soon, **even four good portraits of the
partners is enough** to change the page. The team grid is built and reads them
by filename.

## 2. Client logos

Currently the eight client names render as **text**, which is what a site does
when it could not get the logos. It reads that way.

    public/logos/<slug>.svg      (preferred)
    public/logos/<slug>.png      (fallback, 2x, transparent background)

Then add the filename to the matching entry in `src/lib/proof.ts`:

    { name: "Walker & Dunlop", file: "walker-dunlop.svg" },

Needed for: Walker & Dunlop, Riveron, OTJ, Guidehouse, BRG, Washington
Commanders, ChamberOfCommerce.com, MAI Capital Management.

**They can arrive one at a time.** Each entry switches from type to logo on its
own, so there is no need to wait for all eight.

One caution: check the usage terms. Some companies restrict use of their mark
to imply endorsement, and a client list is close to that line. If any of these
have not been cleared, leave them as type rather than adding the file.

## 3. Testimonials

`src/lib/proof.ts` exports an empty `TESTIMONIALS` array and the section
renders nothing at all until it is not empty. That is deliberate: invented
quotes are fabricated evidence, and a visible "testimonials coming soon" panel
tells every visitor that no client would give one.

Each one needs, and **cannot ship without**, all four:

    quote     the words, exactly as given, not tightened or shortened
    name      the person
    title     their job title at the time of the engagement
    company   their employer

Optionally a headshot at `public/testimonials/<firstname>-<lastname>.jpg`,
400 x 400.

**Three is enough.** Two is enough. One real named quote outperforms six
anonymous ones, because "a client" is not a source.

## 4. The homepage copy

The DP Difference page uses District Partners' own words throughout, from the
brief. **The homepage does not.** Its headline, standfirst and the two-column
section beneath it were written by me to fill the layout, and they read like it.

Send whatever exists: the current site's copy, a deck, a one-pager. Anything
in the firm's actual voice beats anything invented in its style.

## 5. The blog archive

Six of the nine posts in `src/lib/site.ts` are marked `placeholder: true` and
are **not** District Partners' writing. They exist because an index built for a
featured stack plus a filterable grid cannot be judged with three items in it.

Send the real archive and they get deleted. The three unmarked posts are real
titles from the live navigation and need only their bodies.

## 6. The CRM screenshot

Named in the DP Difference brief, not attached. The framed slot is built and
waiting in section 5 of `/the-dp-difference`.

    public/dp-difference/crm.png     1600 x 1200 or wider, 2x

## 7. Hero footage, if any ever exists

The stock clip is gone: the hero now runs on the generated particle field,
which needs no assets. Real footage of the firm, the people, or the city
would earn a place back on this page; stock will not. If it is ever shot,
self-host it:

    public/hero.mp4
    public/hero-poster.jpg

## 8. Neue Haas Grotesk

Licensed commercial type. See `public/fonts/README.md` for exactly which cut to
buy and the filenames. Until it is installed the site renders in Helvetica on
Apple devices, Arial on Windows, and Archivo elsewhere.

## 9. Service page copy (Professional Search first)

`/what-we-do/professional-search` is built against the supplied design and
renders from `src/lib/services.ts`. Section structure, the four functions, the
eight industries and the five process steps are in place. Every section below
renders the moment its text is added to that file, with no further design work.

The wording could not be taken from the supplied image: it is legible for
headings and not for body copy, and guessing at a services page puts claims in
the firm's mouth. What is needed:

1. **Seat titles per function.** Which roles sit under Finance & Accounting,
   Technology/Digital/AI, Risk & Compliance, and Marketing & Revenue. Field:
   `functions[].seats`.
2. **"Who we place".** The list of titles shown as pills. Field: `placements`.
3. **How we search.** One short paragraph under each of Partner-Led,
   Network-Driven, Accountable, and the Inc. 5000 line. Field: `approach[].body`.
4. **"When Professional Search fits".** The four qualifying criteria. Field:
   `fit`.
5. **Process detail.** One line under each of the five steps. Field:
   `process[].body`.
6. **The U.S. Chamber of Commerce case study.** Not started: a named client
   engagement is the least inventable thing on the page.
7. **The testimonial.** See section 4 above. Quotes attributed to real people
   are never written here.
8. **FAQ.** The questions and their answers. Field: `faq`.

The same file drives Executive Search, Interim Solutions, Fractional and Project
Support. Adding one is an entry in `SERVICE_CONTENT`, not a new route.

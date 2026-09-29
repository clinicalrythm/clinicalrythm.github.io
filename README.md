# Clinical Rhythm, Semester 2 coursework resources

This repository is the source of https://clinicalrythm.github.io/. GitHub Pages builds it
with Jekyll, and the page lists every file it finds inside the topic folders. There is no
list to maintain: add a file to a folder, push, and it appears on the site.

## First deployment

1. Copy everything in this folder into the root of the `clinicalrythm.github.io` repository,
   including the hidden files (`.gitignore` and the `.gitkeep` inside each topic folder).
2. Move your course files into the matching folders:

   ```
   00. testbank/
   01. principles/
   02. malaria/
   03. tuberculosis/
   04. hiv/
   ```

   Keep the folder names exactly as they are, spaces and full stops included.
3. Commit and push to the `main` branch.
4. On GitHub open Settings, then Pages. Under "Build and deployment" choose
   "Deploy from a branch", branch `main`, folder `/ (root)`. This is the default for a
   new `username.github.io` repository, so it is usually already set. If the source is set to
   "GitHub Actions" with the Jekyll workflow, that works too.
5. Wait a minute or two, then open https://clinicalrythm.github.io/.

Do not add a `.nojekyll` file to the repository. It switches Jekyll off, and the page needs
Jekyll to build the file list.

## Updating the site files

When a new version of the site files arrives, copy the whole `_includes`, `_layouts`, `_data`
and `assets` folders across, not single files from inside them. On a Mac, dropping a folder
onto a folder with the same name replaces it completely (hold Option to merge instead), so a
partial folder silently deletes the files it does not contain and the build fails with
"Could not locate the included file".

## Adding files later

Put the file in the topic folder, commit, push. The site rebuilds itself within a couple of
minutes. Nothing else needs editing.

Name files as `author+year - title.ext`, all lowercase, for example
`harrisons2022 - fever.pdf` or `who2025 - malaria guidelines.pdf`. The site turns that into a
readable title, source and year, and restores common acronyms (HIV, LAM, MTB/RIF, CD4).
Files without the ` - ` separator still appear, shown by their name.

How each file is grouped on the page:

| Group           | Rule                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------- |
| Lecture slides  | `.pptx`, `.ppt`, `.key`, `.odp`                                                             |
| Textbook        | name starts with `harrisons`                                                                |
| Guidelines      | name starts with `who20`, `mohtz`, `nashcop`, `nmcp20`, `ntlp20`, or contains `guideline` or `recommendation` |
| Readings        | any other `.pdf`, `.doc`, `.docx`, `.odt`, `.txt`, `.md`                                     |
| Other files     | everything else, for example `.png` figures                                                 |

Files whose name contains `tanzania` get a Tanzania tag. To teach the site a new source
abbreviation or acronym, edit `_includes/resource.html` (sources) or `_includes/title.html`
(acronyms); each is a one-line addition.

## How the page behaves

Every topic is collapsed when someone first opens the page. Tapping a topic heading, a beat
on the strip, or "Expand all" opens it, and the browser remembers what each person left open.
A search or a type filter opens the topics that have matches and closes them again when
cleared. To make a topic start expanded for first-time visitors, add `open: true` to its
entry in `_data/topics.yml`.

## Adding a topic

Create a new folder in the root, for example `05. sepsis`, and put files in it. It appears
on the site after the listed topics, titled from the folder name. For a custom title or a
blurb, add an entry to `_data/topics.yml`; that file also controls the order of the topics.

## Things to check in the current files

- In `04. hiv` there is a file shown in Finder as just `hiv` with a PowerPoint icon. Make sure
  its name is really `hiv.pptx` (Finder may be hiding the extension: select it, press
  Command-I and untick "Hide extension"). A file with no extension is flagged on the site
  and will not open properly on Windows or Android.
- Avoid `#`, `?`, `%` and `&` in file names. They break web links.
- GitHub rejects any single file over 100 MB. A large `.pptx` usually shrinks a lot with
  File, then Compress Pictures in PowerPoint, or export it to PDF. Keep the whole repository
  under 1 GB, which is the GitHub Pages limit.
- The site is public. `search_engines: false` in `_config.yml` asks search engines not to
  index it, which keeps it out of Google but does not hide it from anyone with the link.

## Changing the wording

- Site name, tagline and description: `_config.yml`
- Topic titles, blurbs and order: `_data/topics.yml`
- Colours and typography: `assets/css/site.css` (brand blue and green, Figtree)
- Group labels ("Lecture slides", "Readings"): `_includes/topic.html`

## Previewing on your own machine (optional)

You need Ruby and Bundler. From the repository folder:

```
bundle install
bundle exec jekyll serve
```

Then open http://127.0.0.1:4000/. The `Gemfile` pins the same Jekyll version GitHub Pages
uses. Pushing to GitHub is the only step that publishes anything.

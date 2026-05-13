# Thetis Island Website — Editor Guide

A quick-start guide for editing content on thetisisland.net using the Decap CMS admin panel.

## Logging In

1. Go to **https://thetisisland.john-shillington.workers.dev/admin/**
2. Click **Login with GitHub**
3. Authorize the app when prompted (first time only)
4. You'll land on the content dashboard

You need a GitHub account with access to the JohnShillington/thetisisland repository. If you don't have access, ask John to add you as a collaborator.

## The Dashboard

The left sidebar shows three collections:

- **Organizations** — Community groups, clubs, and services listed on the Community & Groups page
- **Services** — TIRRA-managed services (solid waste, trails, cemetery, etc.)
- **Pages** — The nine main website pages (About, Visitors, Emergency, etc.)

Click any collection to see its entries. Click an entry to edit it.

## Editing an Organization

Each organization has these fields:

| Field | What it does |
|-------|-------------|
| **Name** | The organization's full name (shown as the card heading) |
| **Tagline** | One-line description shown on the card |
| **Description** | Optional longer description (reserved for future use) |
| **Website URL** | Full URL (https://example.com) or internal path (/about). Leave blank if none. |
| **Category** | Determines which section the card appears in: Organization, Club, Social Service, or Social & Exercise |
| **Tags** | Optional labels like "Official", "Emergency-Related", "Recreation" |
| **Featured** | Toggle on to pin this entry to the top of its category |

## Editing a Service

| Field | What it does |
|-------|-------------|
| **Name** | Service name (e.g., "Solid Waste Management") |
| **Short Description** | Brief summary shown in listings |
| **Featured** | Toggle on to show this service first |
| **Full Description** | Detailed content with hours, location, etc. Written in Markdown. |

## Editing a Page

| Field | What it does |
|-------|-------------|
| **Title** | Page heading and browser tab title |
| **Meta Description** | The snippet shown in Google search results |
| **Content** | The page body, written in Markdown |

**Note:** Some pages have special elements (the fire danger banner on Emergency, webcam images on Ferry, the calendar placeholder) that are built into the page template. These don't appear in the editor — only the prose content is editable here. To change those elements, ask John.

You cannot create or delete pages — only edit the existing nine.

## Editor Notes

Many entries have a field labelled **"Editor Notes (not published)"**. These contain verification flags — things that need to be checked before launch. They look like:

> VERIFY: Is "interdenominational" correct? What is the actual name of the church?

These notes are **never shown on the public website**. They're only visible here in the editor. Once you've verified or corrected the information:

1. Update the relevant content field with the correct information
2. Clear the editor note (or update it to say "Verified" / "Confirmed by Karl")
3. Save

## Writing in Markdown

The Content and Full Description fields use Markdown. The editor provides a toolbar with buttons for common formatting, but here are the basics:

```
## Section Heading

Regular paragraph text. **Bold text** and *italic text*.

- Bullet point one
- Bullet point two

[Link text](https://example.com)

**Bold label** — followed by a description.
```

The toolbar's rich text mode handles most of this for you — you can switch between rich text and raw Markdown using the toggle in the editor toolbar.

## Saving and Publishing

When you click **Publish** (or **Save**), Decap CMS creates a commit directly on the `main` branch of the GitHub repository. Cloudflare automatically rebuilds and deploys the site within a couple of minutes.

**There is no separate "staging" step.** Your changes go live after the automatic rebuild.

If you make a mistake, you can edit the entry again and correct it — the site will rebuild with your fix.

## Tips

- **Preview before publishing:** Use the preview pane on the right side of the editor to see how your content will look.
- **Don't worry about HTML:** Write in Markdown or use the rich text toolbar. The site handles all styling automatically.
- **Links:** For external sites, always include the full URL starting with `https://`. For other pages on our site, use the path (e.g., `/contact`).
- **Questions?** Contact webmaster@thetisisland.net for help with the editor, or info@thetisisland.net for general website questions.

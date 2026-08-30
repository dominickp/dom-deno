---
title: My Blog Post
layout: blog_post.njk
url: /blog/my-blog-post/
description: A stub post for testing the new blog section, with room for images and longer writeups.
date: 2026-07-18
type: blog-post
---

This is a stub post to prove out the blog structure.

## Why this page exists

It gives you a stable route at `/blog/my-blog-post/` and a template you can copy for future posts.

## Adding images later

You can keep writing posts in Markdown and drop in images with normal Markdown syntax:

![Describe the image](/static/dom.webp)

Because the image path is absolute, it will keep working from nested blog routes and on GitHub Pages.

## Markdown rendering test area

This section exercises the most common markdown elements so you can review how they render on the live page.

### Inline code

Use `deno task build` to generate the static site, and keep asset paths like `/static/styles.css` rooted at the site base.

### Fenced code block

```ts
const latestPosts = posts
	.filter((post) => post.type === 'blog-post')
	.sort((left, right) => right.date.localeCompare(left.date))
	.slice(0, 3);

export default latestPosts;
```

### Blockquote

> A blog template is only useful if it survives real content.
>
> This quote is here to verify spacing, contrast, and emphasis.

### Lists

- Unordered list item
- Another item with `inline code`
- A longer line to verify multi-line list spacing in the article column

1. Ordered list item
2. Another numbered item
3. Final item for spacing checks

### Table

| Element | What to check |
| --- | --- |
| Code block | Padding, border, overflow, contrast |
| Table | Borders, cell padding, readable alignment |
| Quote | Accent treatment and text spacing |

### Horizontal rule

---

## Next posts

Create another file under `src/blog/` with front matter matching this one, change the `title`, `url`, `description`, and `date`, and it should appear automatically on `/blog/`.
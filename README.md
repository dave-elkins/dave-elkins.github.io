# Dave Elkins Resume Site

A Jekyll-based resume website hosted on GitHub Pages at [dave-elkins.github.io](https://dave-elkins.github.io).

## Quick Start

### Making Updates

Edit the YAML files in the `_data/` directory to update resume content:

| File | Purpose |
|------|---------|
| `_data/experience.yml` | Work history |
| `_data/education.yml` | Education |
| `_data/skills.yml` | Skills |
| `_data/projects.yml` | Projects |
| `_data/links.yml` | Links |
| `_data/recognitions.yml` | Awards/recognitions |
| `_data/associations.yml` | Professional associations |
| `_data/interests.yml` | Interests |

To update name, title, contact info, or theme settings, edit `_config.yml`.

### Local Development

1. Install dependencies (if not already done):
   ```bash
   bundle install
   ```

2. Start the local server:
   ```bash
   bundle exec jekyll serve
   ```

3. View the site at `http://localhost:4000`

The site will auto-regenerate as you make changes.

### Deploying Changes

Simply push your changes to GitHub. GitHub Pages will automatically build and deploy the site.

```bash
git add .
git commit -m "Update resume content"
git push origin main
```

Allow 1-2 minutes for GitHub Pages to build and publish your changes.

## Site Structure

```
├── _config.yml          # Site settings (name, title, contact, sections)
├── _data/               # Resume content (YAML files)
├── _layouts/            # Page templates
├── _includes/           # Reusable components
├── _sass/               # SCSS stylesheets
├── css/                 # Compiled CSS
├── images/              # Images (avatar, favicon)
└── index.html           # Entry point
```

## Troubleshooting

### Build Errors
If `bundle exec jekyll serve` fails, try:
```bash
bundle exec jekyll clean
bundle exec jekyll serve
```

### Images Not Updating
Clear Jekyll's cache:
```bash
bundle exec jekyll clean
```

### GitHub Pages Not Updating
- Verify the build completes at github.com/dave-elkins/dave-elkins.github.io > Settings > Pages
- Check the Actions tab for build errors
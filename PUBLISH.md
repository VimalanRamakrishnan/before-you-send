# Publish with GitHub Pages

This package is prepared for your account, vimalanramakrishnan, and a new repository named before-you-send. It does not change your existing portfolio repository.

## Upload using GitHub Desktop (recommended for the many bundled parser files)

1. Extract the ZIP to a normal folder.
2. Open GitHub Desktop and sign into your GitHub account.
3. Choose File > New repository. Name it before-you-send and choose where to save it.
4. Copy everything INSIDE the extracted before-you-send folder into that new repository folder. README.md, docs/, extension/, tests/ and scripts/ should be directly at its root, without an extra wrapper folder.
5. Review Changes, enter “Add Before You Send website and extension”, and commit to main.
6. Click Publish repository. Confirm the name is before-you-send and uncheck “Keep this code private” to make the source public. Publish.

Do not upload the ZIP itself as the website. If using GitHub's browser uploader instead, upload extracted contents in smaller batches; Desktop is easier for the bundled font/CMap files.

## Enable the website

1. Open the new repository on GitHub.
2. Go to Settings > Pages.
3. Under Build and deployment, select Deploy from a branch.
4. Select main and /docs, then Save.
5. Wait for the Pages deployment to finish. Open the URL shown by GitHub.

Expected URL if those account/repository names are used:
https://vimalanramakrishnan.github.io/before-you-send/

Official instructions:
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Check the deployed site

- Load an example, check text, jump to a finding, choose Redact/Keep, and copy/download the output.
- Import a fictional .ino file, a text-based PDF and a DOCX.
- Open guided practice and the evaluation page.
- Check a narrow browser window and keyboard navigation.
- Confirm the Pixel Shield icon and centred power-up. Reduced-motion mode skips the animation.

The automated checks supplied with the package do not replace these checks on the final public URL.

## Add to your portfolio

Project title: Before You Send
Description: A privacy-focused browser tool that reviews text and documents for possible credentials and personal information before sharing. Built with JavaScript, local browser workers, PDF.js and Mammoth.
Live Demo: https://vimalanramakrishnan.github.io/before-you-send/
Source Code: https://github.com/vimalanramakrishnan/before-you-send

Add these links only after publishing. They are intended destinations, not confirmation of a live deployment.

## Later updates

Edit the source, run node scripts/build-site.cjs, commit the source and docs/ changes in GitHub Desktop, and push. GitHub Pages republishes the configured folder.

## If an earlier upload was blocked for a Stripe test key

The earlier example used a fictional but provider-shaped Stripe test value. It is now a plainly fictional placeholder. Replace the earlier files using this corrected package. Also remove the blocked commit from the unpublished history: in GitHub Desktop, History, right-click the latest unpushed commit and choose Undo commit, then replace files and commit again. Undo preserves working files. If the flagged commit is older than the latest commit, do not push an ordinary follow-up fix; remove the example from every affected unpublished commit before retrying. Do not bypass protection for an unverified credential.

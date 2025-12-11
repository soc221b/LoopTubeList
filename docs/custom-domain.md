# Custom domain setup for Pages

This document describes how to configure a custom domain for the GitHub Pages site.

1. Add a `CNAME` file to the root of your `dist/` build output containing your custom domain (e.g., `www.example.com`). Ensure your build process copies `public/CNAME` into `dist/`.

2. Configure DNS at your registrar:
   - For apex domain (example.com), create ALIAS/ANAME or A records pointing to GitHub Pages IPs: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153.
   - For subdomain (www.example.com), create a CNAME record pointing to `<owner>.github.io`.

3. In the repository settings → Pages, set the custom domain to the value in your `CNAME` file and enable HTTPS if available. GitHub will provision TLS when DNS is valid.

4. Troubleshooting
   - Wait for DNS propagation (can take up to 48 hours) and check `dig`/`nslookup`.
   - If HTTPS not provisioned, verify DNS and allow some time for GitHub to provision certificates.

5. Preservation in CI
   - Ensure the workflow that builds and uploads the `dist/` artifact preserves the CNAME file so it is included in the uploaded artifact and deploy step.

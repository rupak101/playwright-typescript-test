# Official Playwright image: Node, browsers and their system libraries preinstalled.
# Keep the version in step with @playwright/test in package.json. Pinned by digest for reproducible builds.
FROM mcr.microsoft.com/playwright:v1.63.0-noble@sha256:eff16c30e6f3f4af0a03fa4b706120d5e9b0891c344a27d64559aff5900a4a27

# Java is needed by the Allure command-line tool.
RUN apt-get update \
  && apt-get install -y --no-install-recommends default-jre-headless \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN chown pwuser:pwuser /app

# Run as the image's non-root user.
USER pwuser

# Install dependencies before copying the source, so code changes don't invalidate this layer.
COPY --chown=pwuser:pwuser package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY --chown=pwuser:pwuser . .

ENV CI=true
# Pass credentials at run time: docker run --env-file .env <image>
# For a shell instead of a test run: docker run -it <image> bash
CMD ["npm", "run", "test:allure"]

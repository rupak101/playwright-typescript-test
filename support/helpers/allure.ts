import * as allure from 'allure-js-commons';

type Labels = {
  feature: string;
  story: string;
  severity?: allure.Severity;
};

// Playwright `tag`s become Allure tags automatically; this adds the report hierarchy.
export async function allureLabels({ feature, story, severity = allure.Severity.NORMAL }: Labels) {
  await allure.epic('Playwright UI Automation');
  await allure.feature(feature);
  await allure.story(story);
  await allure.severity(severity);
}

export async function attachScreenshot(name: string, screenshot: Buffer) {
  await allure.attachment(name, screenshot, 'image/png');
}

export { allure };

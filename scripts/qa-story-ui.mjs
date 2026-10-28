/** Navigate visible controls; never bypass pagination via the story API. */
export async function revealStoryChoice(page, id) {
  const target = page.locator(`#choices button[data-choice="${id}"]`);
  const click = async (choice) => {
    await page.waitForTimeout(240);
    await page.locator(`#choices button[data-choice="${choice}"]`).click();
  };
  const scan = async () => {
    const seen = new Set();
    for (let pageIndex = 0; pageIndex < 20; pageIndex++) {
      if (await target.count()) return true;
      const signature = await page
        .locator('#choices [data-choice]')
        .evaluateAll((nodes) => nodes.map((node) => node.dataset.choice).join(','));
      if (seen.has(signature) || !(await page.locator('[data-choice="__more_choices"]').count()))
        return false;
      seen.add(signature);
      await click('__more_choices');
    }
    throw new Error(`Unbounded UI pagination looking for ${id}`);
  };
  if (await scan()) return target;
  if (await page.locator('[data-choice="__topics"]').count()) await click('__topics');
  const groups = await page
    .locator('#choices [data-choice^="__topics_"]')
    .evaluateAll((nodes) => nodes.map((node) => node.dataset.choice));
  for (const group of groups) {
    await click(group);
    if (await scan()) return target;
    await click('__topics');
  }
  throw new Error(`Dialogue choice ${id} is unavailable in the UI`);
}

export async function clickStoryChoice(page, id) {
  const target = await revealStoryChoice(page, id);
  await page.waitForTimeout(240);
  await target.click();
}

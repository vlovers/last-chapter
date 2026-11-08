/** Greedy word-boundary pagination. `fits` measures the actual reading region. */
export function paginateText(text, fits) {
  if (!text) return [''];
  const tokens = text.match(/\S+\s*/gu) ?? [text];
  const pages = [];
  let page = '';
  for (const token of tokens) {
    if (page && !fits(page + token)) {
      pages.push(page.trimEnd());
      page = '';
    }
    // Unbroken imported words still have to fit; retain every Unicode code point.
    if (!fits(token)) {
      for (const char of Array.from(token)) {
        if (page && !fits(page + char)) {
          pages.push(page);
          page = '';
        }
        page += char;
      }
    } else page += token;
  }
  if (page) pages.push(page.trimEnd());
  return pages.length ? pages : [''];
}

/** Partition complete answer buttons, never clipping a label to make it fit. */
export function paginateAnswers(heights, available, gap = 8) {
  const pages = [];
  let page = [],
    used = 0;
  for (let index = 0; index < heights.length; index++) {
    const extra = heights[index] + (page.length ? gap : 0);
    if (page.length && (used + extra > available || page.length === 4)) {
      pages.push(page);
      page = [];
      used = 0;
    }
    used += heights[index] + (page.length ? gap : 0);
    page.push(index);
  }
  if (page.length) pages.push(page);
  return pages;
}

/** Compose the player's spoken turn and the reply on one page when they fit. */
export function paginateDialogue(reply, playerText, fits) {
  const pages = [];
  let page = { text: '', playerText: playerText || '' };
  if (playerText && !fits(page)) {
    const playerPages = paginateText(playerText, (value) => fits({ text: '', playerText: value }));
    pages.push(...playerPages.slice(0, -1).map((value) => ({ text: '', playerText: value })));
    page.playerText = playerPages.at(-1);
  }
  const tokens = reply.match(/\S+\s*/gu) ?? [reply];
  const append = (token) => {
    if (!fits({ ...page, text: page.text + token })) {
      if (page.text || page.playerText) {
        pages.push({ ...page, text: page.text.trimEnd() });
        page = { text: '', playerText: '' };
      }
      if (!fits({ ...page, text: token }) && Array.from(token).length > 1) {
        for (const char of Array.from(token)) append(char);
        return;
      }
    }
    page.text += token;
  };
  for (const token of tokens) append(token);
  if (page.text || page.playerText || !pages.length)
    pages.push({ ...page, text: page.text.trimEnd() });
  return pages;
}

/**
 * Preload images before rendering to avoid placeholder issues
 */
import { getImageUrl } from "../api/client";

export function preloadImages(urls: (string | undefined)[]): Promise<void> {
  const validUrls = urls.filter((url): url is string => !!url && url.length > 0);
  
  if (validUrls.length === 0) {
    return Promise.resolve();
  }

  return Promise.all(
    validUrls.map(url => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Still resolve on error, don't block
        img.src = url;
      });
    })
  ).then(() => undefined);
}

/**
 * Preload images from questions array
 */
export function preloadQuestionImages(questions: any[]): Promise<void> {
  const imageUrls = questions
    .filter(q => q.imageUrl)
    .map(q => getImageUrl(q.imageUrl));
  
  return preloadImages(imageUrls);
}

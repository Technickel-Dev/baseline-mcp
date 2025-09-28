const stopWords: Set<string> = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "for",
  "if",
  "in",
  "into",
  "is",
  "it",
  "no",
  "not",
  "of",
  "on",
  "or",
  "such",
  "that",
  "the",
  "their",
  "then",
  "there",
  "these",
  "they",
  "this",
  "to",
  "was",
  "will",
  "with",
]);

export const tokenize = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%^&*;:{}=\-_`~()]/g, "") // Remove punctuation
    .split(/\s+/)
    .filter((word) => word.length > 0 && !stopWords.has(word));
};

export const getTermFrequencies = (tokens: string[]): { [key: string]: number } => {
  const termFrequency: { [key: string]: number } = {};
  for (const token of tokens) {
    termFrequency[token] = (termFrequency[token] || 0) + 1;
  }
  return termFrequency;
};

export const dotProduct = (vec1: { [key: string]: number }, vec2: { [key: string]: number }): number => {
  let product = 0;
  for (const key in vec1) {
    if (vec2[key]) {
      product += vec1[key] * vec2[key];
    }
  }
  return product;
};

export const magnitude = (vec: { [key: string]: number }): number => {
  let sum = 0;
  for (const key in vec) {
    sum += vec[key] * vec[key];
  }
  return Math.sqrt(sum);
};

export const cosineSimilarity = (vec1: { [key: string]: number }, vec2: { [key: string]: number }): number => {
  const num = dotProduct(vec1, vec2);
  const den = magnitude(vec1) * magnitude(vec2);
  if (den === 0) return 0;
  return num / den;
};
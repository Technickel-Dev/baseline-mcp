const stopWords = new Set([
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

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%^&*;:{}=\-_`~()]/g, "") // Remove punctuation
    .split(/\s+/)
    .filter((word) => word.length > 0 && !stopWords.has(word));
}

function getTermFrequencies(tokens) {
  const tf = {};
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }
  return tf;
}

function dotProduct(vec1, vec2) {
  let product = 0;
  for (const key in vec1) {
    if (vec2[key]) {
      product += vec1[key] * vec2[key];
    }
  }
  return product;
}

function magnitude(vec) {
  let sum = 0;
  for (const key in vec) {
    sum += vec[key] * vec[key];
  }
  return Math.sqrt(sum);
}

function cosineSimilarity(vec1, vec2) {
  const num = dotProduct(vec1, vec2);
  const den = magnitude(vec1) * magnitude(vec2);
  if (den === 0) return 0;
  return num / den;
}

export default {
  tokenize,
  getTermFrequencies,
  cosineSimilarity,
};

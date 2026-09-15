const { documentation } = require("../data/documentation");

function searchDocumentation(query) {
  const searchTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const results = documentation
    .map((document) => {
      const searchableText =
        `${document.topic} ${document.content}`.toLowerCase();

      const score = searchTerms.reduce((total, term) => {
        return total + (searchableText.includes(term) ? 1 : 0);
      }, 0);

      return {
        ...document,
        score
      };
    })
    .filter((document) => document.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return results.map(({ topic, content, score }) => ({
    topic,
    content,
    score
  }));
}

const availableTools = {
    searchDocumentation
  };

module.exports = {
  searchDocumentation,
  availableTools
};
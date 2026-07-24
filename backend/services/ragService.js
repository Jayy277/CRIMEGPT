const fs = require('fs');
const path = require('path');

class RAGService {
  constructor() {
    this.knowledgeBase = [];
    this.isLoaded = false;
    this.knowledgeDir = path.join(__dirname, '..', 'knowledge');
    this.loadKnowledgeBase();
  }

  loadKnowledgeBase() {
    try {
      this.knowledgeBase = [];
      if (!fs.existsSync(this.knowledgeDir)) {
        console.warn(`[RAGService] Knowledge directory not found at ${this.knowledgeDir}`);
        return;
      }

      const files = fs.readdirSync(this.knowledgeDir).filter(f => f.endsWith('.json'));
      for (const file of files) {
        const filePath = path.join(this.knowledgeDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const items = JSON.parse(content);
        if (Array.isArray(items)) {
          this.knowledgeBase.push(...items);
        }
      }

      this.isLoaded = true;
      console.log(`[RAGService] Knowledge base loaded: ${this.knowledgeBase.length} legal items indexed across ${files.length} documents.`);
    } catch (error) {
      console.error('[RAGService] Failed to load legal knowledge base:', error.message);
    }
  }

  reloadKnowledgeBase() {
    console.log('[RAGService] Reloading knowledge base...');
    this.loadKnowledgeBase();
    return { success: true, itemCount: this.knowledgeBase.length };
  }

  /**
   * Search legal knowledge base using term relevance and keyword scoring
   * @param {string} query 
   * @param {number} topK 
   * @returns {Array} List of matched legal items sorted by score
   */
  searchLegalKnowledge(query, topK = 5) {
    if (!this.isLoaded || this.knowledgeBase.length === 0) {
      this.loadKnowledgeBase();
    }

    const cleanQuery = query.toLowerCase().trim();
    const queryTokens = cleanQuery.split(/\s+/).filter(t => t.length > 2);

    const scored = this.knowledgeBase.map(item => {
      let score = 0;
      const textToSearch = `${item.act} ${item.section} ${item.title} ${item.category} ${item.description} ${(item.keywords || []).join(' ')}`.toLowerCase();

      // 1. Direct section/act match (High boost)
      if (item.section && cleanQuery.includes(item.section.toLowerCase())) {
        score += 50;
      }
      if (item.act && cleanQuery.includes(item.act.toLowerCase())) {
        score += 20;
      }

      // 2. Keyword exact match (High boost)
      if (item.keywords && Array.isArray(item.keywords)) {
        for (const kw of item.keywords) {
          const kwLower = kw.toLowerCase();
          if (cleanQuery.includes(kwLower)) {
            score += 30;
          } else {
            // Partial token match
            for (const token of queryTokens) {
              if (kwLower.includes(token)) {
                score += 10;
              }
            }
          }
        }
      }

      // 3. Description & Title token overlap
      for (const token of queryTokens) {
        if (item.title.toLowerCase().includes(token)) {
          score += 15;
        }
        if (item.description.toLowerCase().includes(token)) {
          score += 5;
        }
      }

      return { ...item, score };
    });

    // Filter items with score > 0 and sort descending
    const results = scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return results;
  }
}

// Singleton instance
const ragService = new RAGService();
module.exports = ragService;

const natural = require('natural');
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class AIAnalysisService {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.tfidf = new natural.TfIdf();
  }

  async analyzeContacts(contacts) {
    try {
      const insights = [];
      
      // Analyze contact patterns
      const patterns = await this.analyzePatterns(contacts);
      insights.push(...patterns);

      // Generate AI insights using OpenAI
      const aiInsights = await this.generateAIInsights(contacts);
      insights.push(...aiInsights);

      // Analyze sentiment in notes
      const sentimentInsights = this.analyzeSentiment(contacts);
      insights.push(...sentimentInsights);

      return insights;
    } catch (error) {
      console.error('AI Analysis error:', error);
      throw new Error('Failed to analyze contacts');
    }
  }

  async analyzePatterns(contacts) {
    const insights = [];
    
    // Analyze phone number patterns
    const phonePatterns = this.analyzePhonePatterns(contacts);
    if (phonePatterns) {
      insights.push({
        title: 'Phone Number Pattern Detected',
        description: phonePatterns,
        confidence: 85,
        date: new Date()
      });
    }

    // Analyze name patterns
    const namePatterns = this.analyzeNamePatterns(contacts);
    if (namePatterns) {
      insights.push({
        title: 'Name Pattern Analysis',
        description: namePatterns,
        confidence: 90,
        date: new Date()
      });
    }

    return insights;
  }

  analyzePhonePatterns(contacts) {
    const areaCodes = new Map();
    contacts.forEach(contact => {
      const areaCode = contact.Phone.split('-')[0];
      areaCodes.set(areaCode, (areaCodes.get(areaCode) || 0) + 1);
    });

    const mostCommonAreaCode = [...areaCodes.entries()]
      .sort((a, b) => b[1] - a[1])[0];

    if (mostCommonAreaCode && mostCommonAreaCode[1] > contacts.length * 0.3) {
      return `Most contacts (${Math.round(mostCommonAreaCode[1] / contacts.length * 100)}%) are from area code ${mostCommonAreaCode[0]}`;
    }

    return null;
  }

  analyzeNamePatterns(contacts) {
    const nameLengths = contacts.map(c => c.FirstName.length);
    const avgLength = nameLengths.reduce((a, b) => a + b, 0) / contacts.length;
    
    if (avgLength > 8) {
      return `Contacts tend to have longer names (average ${avgLength.toFixed(1)} characters)`;
    } else if (avgLength < 5) {
      return `Contacts tend to have shorter names (average ${avgLength.toFixed(1)} characters)`;
    }

    return null;
  }

  async generateAIInsights(contacts) {
    try {
      const prompt = this.generatePrompt(contacts);
      
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant analyzing contact data. Provide 2-3 key insights about the data patterns and potential business implications."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 150
      });

      const insights = response.choices[0].message.content
        .split('\n')
        .filter(line => line.trim())
        .map(insight => ({
          title: 'AI-Generated Insight',
          description: insight,
          confidence: 75,
          date: new Date()
        }));

      return insights;
    } catch (error) {
      console.error('OpenAI API error:', error);
      return [];
    }
  }

  generatePrompt(contacts) {
    const sampleSize = Math.min(10, contacts.length);
    const sample = contacts.slice(0, sampleSize);
    
    return `Analyze these ${contacts.length} contacts (showing ${sampleSize} samples):
${JSON.stringify(sample, null, 2)}

Provide 2-3 key insights about patterns in the data and potential business implications.`;
  }

  analyzeSentiment(contacts) {
    const insights = [];
    const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
    
    const contactsWithNotes = contacts.filter(c => c.Notes);
    if (contactsWithNotes.length === 0) return insights;

    const sentiments = contactsWithNotes.map(contact => {
      const tokens = this.tokenizer.tokenize(contact.Notes);
      return analyzer.getSentiment(tokens);
    });

    const avgSentiment = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;

    if (avgSentiment > 0.3) {
      insights.push({
        title: 'Positive Sentiment Detected',
        description: 'Contact notes show an overall positive sentiment',
        confidence: 80,
        date: new Date()
      });
    } else if (avgSentiment < -0.3) {
      insights.push({
        title: 'Negative Sentiment Detected',
        description: 'Contact notes show an overall negative sentiment',
        confidence: 80,
        date: new Date()
      });
    }

    return insights;
  }
}

module.exports = new AIAnalysisService(); 
const sensitiveWords = [
    '测试敏感词'
];

const checkSensitive = (text) => {
    if (!text) return { hasSensitive: false, words: [] };
    
    const foundWords = [];
    const lowerText = text.toLowerCase();
    
    for (const word of sensitiveWords) {
        if (lowerText.includes(word.toLowerCase())) {
            foundWords.push(word);
        }
    }
    
    return {
        hasSensitive: foundWords.length > 0,
        words: foundWords
    };
};

const filterSensitive = (text, replacement = '***') => {
    if (!text) return text;
    
    let filteredText = text;
    for (const word of sensitiveWords) {
        const regex = new RegExp(word, 'gi');
        filteredText = filteredText.replace(regex, replacement);
    }
    
    return filteredText;
};

module.exports = {
    sensitiveWords,
    checkSensitive,
    filterSensitive
};

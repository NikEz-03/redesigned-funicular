// This service handles interactions with AI providers.
// Currently set to MOCK mode for development/testing.

export const translateText = async (text, targetLanguage) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate translation by appending a prefix
            // In a real app, this would call OpenAI/Google Translate API
            resolve(`[Translated to ${targetLanguage}] ${text}`);
        }, 1500); // Simulate network delay
    });
};

export const analyzeCredibility = async (text, language = 'EN') => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Mock analysis logic
            const isSafe = Math.random() > 0.3; // 70% chance of being "Safe"

            const responses = {
                EN: {
                    verified: { status: 'VERIFIED', reason: 'This article cites credible sources and avoids emotional language.' },
                    caution: { status: 'CAUTION', reason: 'The source is unverified and uses sensationalist headlines. Verify with other sources.' }
                },
                MY: {
                    verified: { status: 'DISAHKAN', reason: 'Artikel ini memetik sumber yang boleh dipercayai dan mengelakkan bahasa emosi.' },
                    caution: { status: 'AMARAN', reason: 'Sumber tidak disahkan dan menggunakan tajuk berita sensasi. Sahkan dengan sumber lain.' }
                },
                CN: {
                    verified: { status: '已验证', reason: '该文章引用了可信来源，并避免了情绪化语言。' },
                    caution: { status: '警告', reason: '来源未经验证，且使用了耸人听闻的标题。请通过其他渠道核实。' }
                }
            };

            const langKey = responses[language] ? language : 'EN';
            const textData = isSafe ? responses[langKey].verified : responses[langKey].caution;

            resolve({
                score: isSafe ? 95 : 45,
                status: textData.status,
                color: isSafe ? '#22c55e' : '#eab308', // Green : Yellow
                reason: textData.reason
            });
        }, 2000);
    });
};

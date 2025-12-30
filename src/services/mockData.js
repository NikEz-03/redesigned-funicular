export const MOCK_NEWS = [
    {
        id: '1',
        headline: 'Sarawak Digital Economy Strategy 2030 Launched',
        date: '2025-11-20T10:00:00Z',
        verified: true,
        content: 'The Sarawak government has officially launched the Digital Economy Strategy 2030, aiming to transform the region into a high-income digital economy. The strategy focuses on infrastructure, talent development, and digital inclusivity for rural areas.',
        source: 'Sarawak Gov',
        imageUrl: 'https://via.placeholder.com/300x200/E04F5F/FFFFFF?text=Digital+Economy',
    },
    {
        id: '2',
        headline: 'New Solar Hybrid Station for Long Lamai',
        date: '2025-11-19T14:30:00Z',
        verified: true,
        content: 'A new solar hybrid power station has been commissioned in Long Lamai, providing 24/7 electricity to over 100 households. This project is part of the Rural Electrification Scheme.',
        source: 'Rural News',
        imageUrl: 'https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Solar+Power',
    },
    {
        id: '3',
        headline: 'WARNING: Fake Investment Scheme Targeting Rural Communities',
        date: '2025-11-18T09:15:00Z',
        verified: false,
        isWarning: true,
        content: 'Authorities are warning the public about a new investment scam promising high returns. The scheme primarily targets rural residents via WhatsApp. Do not transfer money to unknown accounts.',
        source: 'Police Alert',
        imageUrl: 'https://via.placeholder.com/300x200/FFC107/000000?text=Scam+Alert',
    },
    {
        id: '4',
        headline: 'Agricultural Subsidy Applications Open',
        date: '2025-11-17T08:00:00Z',
        verified: true,
        content: 'Farmers can now apply for the 2026 agricultural subsidy program. Forms are available at all district offices or can be downloaded from this app.',
        source: 'Dept of Agriculture',
        imageUrl: 'https://via.placeholder.com/300x200/2196F3/FFFFFF?text=Agriculture',
    },
];

export const getNews = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_NEWS);
        }, 1000); // Simulate network delay
    });
};

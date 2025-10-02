import React, { useState, useCallback } from 'react';
import PokerCard from './components/PokerCard';
import LoadingSpinner from './components/LoadingSpinner';
import { generateCatImage } from './services/geminiService';
import { CardData, Suit } from './types';
import { RANKS, SUITS, CAT_BREEDS, FACE_RANKS, PAW_PRINT_URL } from './constants';

declare const html2canvas: any;

const App: React.FC = () => {
    const [cards, setCards] = useState<CardData[]>([]);
    const [loadingAction, setLoadingAction] = useState<'hand' | 'single' | 'deck' | 'download' | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

    const isLoading = loadingAction !== null;

    const getRandomElement = <T,>(arr: T[]): T => {
        return arr[Math.floor(Math.random() * arr.length)];
    };
    
    const createPrompt = (rank: string, suit: Suit): string => {
        const catBreed = getRandomElement(CAT_BREEDS);
        return `Photorealistic, highly detailed, artistic portrait of a majestic ${catBreed}. The cat should have a regal and characterful expression. The background MUST be a solid, pure white background. NO other elements, text, borders, or card designs should be in the image. Just the cat.`;
    };

    const generateCards = useCallback(async () => {
        setLoadingAction('hand');
        setError(null);
        setProgress(null);

        try {
            const cardsToGenerate: { rank: string; suit: Suit }[] = [];
            const usedCards = new Set<string>();

            while (cardsToGenerate.length < 3) {
                const rank = getRandomElement(RANKS);
                const suit = getRandomElement(SUITS);
                const cardKey = `${rank}-${suit}`;

                if (!usedCards.has(cardKey)) {
                    usedCards.add(cardKey);
                    cardsToGenerate.push({ rank, suit });
                }
            }
            
            const placeholderCards = cardsToGenerate.map(c => ({ ...c, imageUrl: '' }));
            setCards(placeholderCards);

            for (const card of cardsToGenerate) {
                const prompt = createPrompt(card.rank, card.suit);
                const imageUrl = await generateCatImage(prompt);
                setCards(prevCards => prevCards.map(c => 
                    c.rank === card.rank && c.suit === card.suit ? { ...c, imageUrl } : c
                ));
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setCards([]); // Clear placeholders on error
        } finally {
            setLoadingAction(null);
        }
    }, []);

    const generateOneCard = useCallback(async () => {
        if (cards.length >= 3 && cards.length !== 52) return;
        setLoadingAction('single');
        setError(null);
        setProgress(null);
        const initialCards = cards.length === 52 ? [] : cards;
        if (cards.length === 52) setCards([]);


        try {
            const usedCards = new Set<string>(initialCards.map(c => `${c.rank}-${c.suit}`));
            let newCardData: { rank: string, suit: Suit } | null = null;
            while (newCardData === null) {
                const rank = getRandomElement(RANKS);
                const suit = getRandomElement(SUITS);
                const cardKey = `${rank}-${suit}`;
                if (!usedCards.has(cardKey)) {
                    newCardData = { rank, suit };
                }
            }

            const placeholderCard: CardData = { ...newCardData, imageUrl: '' };
            setCards(prevCards => [...prevCards, placeholderCard]);

            const prompt = createPrompt(newCardData.rank, newCardData.suit);
            const imageUrl = await generateCatImage(prompt);

            setCards(prevCards => prevCards.map(c =>
                c.rank === placeholderCard.rank && c.suit === placeholderCard.suit
                    ? { ...c, imageUrl }
                    : c
            ));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setLoadingAction(null);
        }
    }, [cards]);

    const generateFullDeck = useCallback(async () => {
        setLoadingAction('deck');
        setError(null);
        setProgress(null);
    
        try {
            const fullDeck: CardData[] = [];
            for (const suit of SUITS) {
                for (const rank of RANKS) {
                    fullDeck.push({
                        rank,
                        suit,
                        imageUrl: FACE_RANKS.includes(rank) ? '' : PAW_PRINT_URL,
                    });
                }
            }
            setCards(fullDeck);
    
            const cardsToGenerate = fullDeck.filter(c => c.imageUrl === '');
            const totalToGenerate = cardsToGenerate.length;
            setProgress({ current: 0, total: totalToGenerate });
    
            for (const card of cardsToGenerate) {
                const prompt = createPrompt(card.rank, card.suit);
                const imageUrl = await generateCatImage(prompt);
                
                setCards(prevDeck => prevDeck.map(c =>
                    c.rank === card.rank && c.suit === card.suit ? { ...c, imageUrl } : c
                ));
                
                setProgress(prev => ({
                    current: (prev?.current ?? 0) + 1,
                    total: totalToGenerate
                }));
            }
    
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setCards([]); // Clear deck on error
        } finally {
            setLoadingAction(null);
        }
    }, []);

    const handleDownload = useCallback(async () => {
        const deckContainer = document.getElementById('deck-container');
        if (!deckContainer || cards.length !== 52) return;

        setLoadingAction('download');
        setError(null);

        try {
            const canvas = await html2canvas(deckContainer, {
                backgroundColor: '#111827', // Match body bg-gray-900
                scale: 2, // Increase resolution
            });
            const link = document.createElement('a');
            link.download = 'ai-cat-poker-deck.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            setError('Failed to create download image.');
        } finally {
            setLoadingAction(null);
        }
    }, [cards]);


    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 md:p-8 font-sans">
            <div className="w-full max-w-7xl mx-auto flex flex-col items-center">
                <div className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-2 tracking-tight">AI Cat Poker Cards</h1>
                    <p className="text-lg text-cyan-300">Generate a unique hand or a full deck of feline royalty.</p>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 mb-10">
                    <button onClick={generateCards} disabled={isLoading} className="btn-primary">
                        {loadingAction === 'hand' ? <><LoadingSpinner /><span className="ml-2">Dealing Hand...</span></> : 'Generate Hand (3)'}
                    </button>
                    <button onClick={generateOneCard} disabled={isLoading || (cards.length >= 3 && cards.length !== 52)} className="btn-secondary">
                        {loadingAction === 'single' ? <><LoadingSpinner /><span className="ml-2">Drawing Card...</span></> : 'Draw 1 Card'}
                    </button>
                    <button onClick={generateFullDeck} disabled={isLoading} className="btn-primary">
                        {loadingAction === 'deck' ? <><LoadingSpinner /><span className="ml-2">Building Deck...</span></> : 'Generate Full Deck'}
                    </button>
                    <button onClick={handleDownload} disabled={isLoading || cards.length !== 52} className="btn-secondary">
                        {loadingAction === 'download' ? <><LoadingSpinner /><span className="ml-2">Preparing...</span></> : 'Download Deck as PNG'}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-center mb-8" role="alert">
                        <strong className="font-bold">Error: </strong><span className="block sm:inline">{error}</span>
                    </div>
                )}
                
                {loadingAction === 'deck' && progress && (
                    <div className="w-full max-w-md bg-gray-700 rounded-full h-4 mb-6 relative overflow-hidden">
                        <div className="bg-cyan-500 h-4 rounded-full transition-width duration-300 ease-linear" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900 mix-blend-lighten">{`Generating Images: ${progress.current} / ${progress.total}`}</span>
                    </div>
                )}
                
                <div id="deck-container" className="p-4 rounded-lg">
                    <div className="flex flex-wrap justify-center items-start gap-8">
                        {cards.map((card) => (
                            <PokerCard key={`${card.rank}-${card.suit}`} card={card} />
                        ))}
                    </div>
                </div>

                 {cards.length === 0 && !isLoading && (
                    <div className="text-center text-gray-400 mt-8 min-h-[24rem] flex items-center justify-center">
                        <p>Click a button to generate your cat cards!</p>
                    </div>
                )}
                 <style>{`
                    .btn-primary { @apply flex items-center justify-center bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 text-lg w-full sm:w-auto; }
                    .btn-secondary { @apply flex items-center justify-center bg-teal-500 hover:bg-teal-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 text-lg w-full sm:w-auto; }
                `}</style>
            </div>
        </div>
    );
};

export default App;

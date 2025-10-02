import React from 'react';
import { CardData, Suit } from '../types';
import { PAW_PRINT_URL } from '../constants';

interface PokerCardProps {
    card: CardData;
}

const suitColorClass = (suit: Suit) => {
    return suit === Suit.HEARTS || suit === Suit.DIAMONDS ? 'text-red-500' : 'text-black';
};

const suitName = (suit: Suit): string => {
    switch (suit) {
        case Suit.HEARTS: return 'Hearts';
        case Suit.DIAMONDS: return 'Diamonds';
        case Suit.CLUBS: return 'Clubs';
        case Suit.SPADES: return 'Spades';
        default: return '';
    }
}

const rankName = (rank: string): string => {
    switch (rank) {
        case 'A': return 'Ace';
        case 'K': return 'King';
        case 'Q': return 'Queen';
        case 'J': return 'Jack';
        default: return rank;
    }
}

const CardCorner: React.FC<{ rank: string; suit: Suit }> = ({ rank, suit }) => (
    <div className={`flex flex-col items-center font-bold text-2xl leading-none ${suitColorClass(suit)}`}>
        <span>{rank}</span>
        <span className="mt-[-4px]">{suit}</span>
    </div>
);

const PawPrintIcon: React.FC<{ className?: string; isFlipped?: boolean }> = ({ className, isFlipped = false }) => (
    <div className={`relative ${isFlipped ? 'transform rotate-180' : ''} ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full" fill="currentColor">
            <path d="M63.6,51.3c-7.8-2.3-11.4-9.3-12.2-12.6c-0.2-1.2-0.5-2.3-0.8-3.5c-0.7-2.3-0.7-4.7-2-6.5c-1-1.5-2.6-2.6-4.4-2.8 c-1.2-0.1-2.4,0.1-3.6,0.5c-3.1,1.1-5.1,4.1-5.4,7.4c-0.1,1.4-0.1,2.8,0.2,4.2c0.5,2.7,1.5,5.3,3,7.6c1.2,1.8,2.7,3.4,4.5,4.6 c1.1,0.7,2.3,1.3,3.5,1.8c2.4,1,4.9,1.6,7.5,1.7C60.7,54.4,63.8,53.3,63.6,51.3z" />
            <path d="M37.1,30.3c-3.2-0.9-6.3,0.6-7.8,3.4c-1,1.8-1.3,3.9-0.8,5.8c0.8,3.2,3.7,5.3,6.9,5.4c3.4,0.1,6.5-1.9,7.6-5 c1-2.9,0.2-6-2-7.8C39.9,31,38.5,30.5,37.1,30.3z" />
            <path d="M59.3,27.3c-2.1-1.6-4.9-1.9-7.3-0.8c-2.9,1.3-4.8,4.1-4.8,7.2c0,3,1.8,5.7,4.5,6.9c2.6,1.2,5.6,0.8,7.8-1 c2.6-2.1,3.6-5.4,2.5-8.3C61.4,29.5,60.6,28.3,59.3,27.3z" />
            <path d="M78.6,40.3c1.3-2.6,0.6-5.8-1.7-7.7c-2-1.7-4.7-2-6.9-0.9c-2.7,1.4-4.4,4.2-4.3,7.1c0.1,3,2.2,5.7,5.1,6.4 C74.2,46.1,77.5,43.6,78.6,40.3z" />
            <path d="M36.1,55.5c-0.1-3.2-2.3-6-5.4-6.8c-3.1-0.8-6.2,0.6-7.8,3.3c-1.3,2.1-1.5,4.7-0.6,7c1.3,3.3,4.6,5.3,8.1,4.7 C34.5,63.1,36.2,59.5,36.1,55.5z" />
        </svg>
    </div>
);


// Maps a rank to an array of grid-area names for pip placement.
const PIP_POSITIONS: { [key: string]: string[] } = {
    'A': ['mid-center'], // Ace will show image, but good to have a fallback
    '2': ['top-center', 'bot-center'],
    '3': ['top-center', 'mid-center', 'bot-center'],
    '4': ['top-left', 'top-right', 'bot-left', 'bot-right'],
    '5': ['top-left', 'top-right', 'mid-center', 'bot-left', 'bot-right'],
    '6': ['top-left', 'top-right', 'mid-left', 'mid-right', 'bot-left', 'bot-right'],
    '7': ['top-left', 'top-right', 'top-mid', 'mid-left', 'mid-right', 'bot-left', 'bot-right'],
    '8': ['top-left', 'top-right', 'top-mid', 'mid-left', 'mid-right', 'bot-mid', 'bot-left', 'bot-right'],
    '9': ['top-left', 'top-right', 'top-mid-left', 'top-mid-right', 'mid-center', 'bot-mid-left', 'bot-mid-right', 'bot-left', 'bot-right'],
    '10': ['top-left', 'top-right', 'top-mid', 'top-mid-left', 'top-mid-right', 'bot-mid', 'bot-mid-left', 'bot-mid-right', 'bot-left', 'bot-right'],
};

const CardPipsLayout: React.FC<{ rank: string; suit: Suit }> = ({ rank, suit }) => {
    const positions = PIP_POSITIONS[rank] || [];
    const suitColor = suitColorClass(suit);

    return (
        <div className={`relative flex-grow ${suitColor} p-2`}>
            <div className="h-full w-full grid grid-cols-3 grid-rows-7" style={{
                gridTemplateAreas: `
                    "top-left . top-right"
                    ". top-mid ."
                    "top-mid-left mid-center top-mid-right"
                    "mid-left . mid-right"
                    "bot-mid-left . bot-mid-right"
                    ". bot-mid ."
                    "bot-left . bot-right"
                `
            }}>
                {positions.map(pos => (
                    <div key={pos} className="flex items-center justify-center" style={{ gridArea: pos }}>
                        <PawPrintIcon 
                            className="w-7 h-7" 
                            isFlipped={pos.startsWith('bot')}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

const PokerCard: React.FC<PokerCardProps> = ({ card }) => {
    if (!card) {
        return null;
    }

    const { rank, suit, imageUrl } = card;

    return (
        <div className="bg-gray-50 rounded-xl shadow-2xl w-64 h-96 p-3 flex flex-col relative transform transition-transform duration-500 hover:scale-105 hover:shadow-cyan-300/30">
            <div className="absolute top-3 left-3">
                <CardCorner rank={rank} suit={suit} />
            </div>

            <div 
                className="flex-grow flex flex-col my-4 mx-2 border-2 border-gray-300 rounded-lg overflow-hidden bg-white"
                role="img" 
                aria-label={`A cat representing the ${rankName(rank)} of ${suitName(suit)}`}
            >
                {imageUrl === PAW_PRINT_URL ? (
                    <CardPipsLayout rank={rank} suit={suit} />
                ) : imageUrl ? (
                    <>
                        {/* Top Half */}
                        <div 
                            className="h-1/2 w-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${imageUrl})` }}
                        ></div>
                        {/* Bottom Half - Mirrored */}
                        <div 
                            className="h-1/2 w-full bg-cover bg-center transform scale-x-[-1] scale-y-[-1]"
                            style={{ backgroundImage: `url(${imageUrl})` }}
                        ></div>
                    </>
                ) : (
                    <div className="flex-grow flex items-center justify-center animate-pulse bg-gray-200">
                        <PawPrintIcon 
                             className={`w-16 h-16 animate-spin opacity-50 ${suitColorClass(suit)}`}
                        />
                    </div>
                )}
            </div>
            
            <div className="absolute bottom-3 right-3 transform rotate-180">
                <CardCorner rank={rank} suit={suit} />
            </div>
        </div>
    );
};

export default PokerCard;
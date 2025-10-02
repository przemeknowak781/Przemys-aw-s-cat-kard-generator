
export enum Suit {
  HEARTS = '♥',
  DIAMONDS = '♦',
  CLUBS = '♣',
  SPADES = '♠',
}

export interface CardData {
  rank: string;
  suit: Suit;
  imageUrl: string;
}

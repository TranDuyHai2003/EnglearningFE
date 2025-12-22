import apiClient from "./apiClient";
import {
  DeckVisibility,
  FlashcardDeck,
  FlashcardDeckDetail,
  FlashcardCard,
  ReviewQueueItem,
  FlashcardSummary,
} from "@/lib/types";

export interface DeckPayload {
  title: string;
  description?: string | null;
  visibility: DeckVisibility;
  language_pair: string;
}

export interface CardPayload {
  front_text: string;
  back_text: string;
  ipa_text?: string | null;
  example_text?: string | null;
  audio_url?: string | null;
  image_url?: string | null;
  tags?: string[];
  dict_entry_id?: number | null;
  dict_sense_ids?: number[];
}

export interface LessonDeckPayload extends Omit<DeckPayload, "visibility"> {
  visibility?: DeckVisibility;
  cards?: CardPayload[];
}

export interface ReviewPayload {
  deckId: string;
  cardId: string;
  grade: "again" | "hard" | "good" | "easy";
  idempotencyKey: string;
  durationMs?: number;
}

export interface ListCardsResponse {
  data: FlashcardCard[];
  nextCursor?: string | null;
}

const pickData = <T>(response: any): T => response.data?.data ?? response.data;

export const flashcardsApi = {
  async listDecks(params?: { scope?: string; q?: string }) {
    const res = await apiClient.get("/flashcards/decks", { params });
    return pickData<FlashcardDeck[]>(res);
  },
  async createDeck(payload: DeckPayload) {
    const res = await apiClient.post("/flashcards/decks", payload);
    return pickData<FlashcardDeck>(res);
  },
  async getDeck(deckId: string) {
    const res = await apiClient.get(`/flashcards/decks/${deckId}`);
    return pickData<FlashcardDeckDetail>(res);
  },
  async updateDeck(deckId: string, payload: Partial<DeckPayload>) {
    const res = await apiClient.patch(`/flashcards/decks/${deckId}`, payload);
    return pickData<FlashcardDeck>(res);
  },
  async deleteDeck(deckId: string) {
    await apiClient.delete(`/flashcards/decks/${deckId}`);
  },
  async listCards(deckId: string, params?: { limit?: number; cursor?: string | null }) {
    const res = await apiClient.get(`/flashcards/decks/${deckId}/cards`, {
      params,
    });
    return {
      data: res.data?.data as FlashcardCard[],
      nextCursor: res.data?.nextCursor as string | null,
    } as ListCardsResponse;
  },
  async createCard(deckId: string, payload: CardPayload) {
    const res = await apiClient.post(`/flashcards/decks/${deckId}/cards`, payload);
    return pickData<FlashcardCard>(res);
  },
  async updateCard(cardId: string, payload: Partial<CardPayload>) {
    const res = await apiClient.patch(`/flashcards/cards/${cardId}`, payload);
    return pickData<FlashcardCard>(res);
  },
  async deleteCard(cardId: string) {
    await apiClient.delete(`/flashcards/cards/${cardId}`);
  },
  async getDeckSummary(deckId: string) {
    const res = await apiClient.get(`/flashcards/decks/${deckId}/summary`);
    return pickData<FlashcardSummary>(res);
  },
  async getGlobalSummary() {
    const res = await apiClient.get(`/flashcards/summary`);
    return pickData<FlashcardSummary>(res);
  },
  async listLessonDecks(lessonId: number) {
    const res = await apiClient.get(`/flashcards/lessons/${lessonId}/decks`);
    return pickData<FlashcardDeck[]>(res);
  },
  async createLessonDeck(lessonId: number, payload: LessonDeckPayload) {
    const res = await apiClient.post(`/flashcards/lessons/${lessonId}/decks`, payload);
    return pickData<FlashcardDeck>(res);
  },
  async getReviewQueue(deckId: string, limit = 20) {
    const res = await apiClient.get(`/flashcards/decks/${deckId}/review/queue`, {
      params: { limit },
    });
    return pickData<ReviewQueueItem[]>(res);
  },
  async submitReview(payload: ReviewPayload) {
    const res = await apiClient.post(`/flashcards/review`, payload);
    return {
      state: pickData(res),
      idempotent: res.data?.idempotent ?? false,
    };
  },
};

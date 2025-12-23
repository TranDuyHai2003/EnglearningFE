import apiClient from "./apiClient";
import {
  DictionaryEntryDetail,
  DictionaryLookupResponse,
} from "@/lib/types";

const pickData = <T>(response: any): T => response.data?.data ?? response.data;

export const dictionaryApi = {
  async lookup(term: string, limit = 20) {
    const res = await apiClient.get("/dict/lookup", {
      params: { term, limit },
    });
    return pickData<DictionaryLookupResponse>(res);
  },
  async getEntry(entryId: number) {
    const res = await apiClient.get(`/dict/entry/${entryId}`);
    return pickData<DictionaryEntryDetail>(res);
  },
};

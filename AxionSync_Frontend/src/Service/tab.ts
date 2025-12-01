import httpClient from "./http";
import type { Tab, CreateTabRequest, UpdateTabRequest } from "@/Types/Tab";

class TabService {
  async getTabs() {
    return httpClient.get<Tab[]>("/tabs");
  }

  async getTab(id: number) {
    return httpClient.get<Tab>(`/tabs/${id}`);
  }

  async createTab(data: CreateTabRequest) {
    return httpClient.post<Tab>("/tabs", data);
  }

  async updateTab(id: number, data: UpdateTabRequest) {
    return httpClient.put<Tab>(`/tabs/${id}`, data);
  }

  async deleteTab(id: number) {
    return httpClient.delete(`/tabs/${id}`);
  }
}

export default new TabService();

import { apiClient } from "./apiClient";
import paths from "./paths";
import { Yacht } from "../types/yachts";
import { CreateYachtRequest } from "../types/createYacht";
import {Ride} from "../types/owner"

export const ownerAPI = {
  getOwnerProfile: async (): Promise<any> => {
    const token = localStorage.getItem("token");
    const response = await apiClient.get(paths.ownerProfile, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  getOwnerYachts: async (): Promise<Yacht[]> => {
    const token = localStorage.getItem("token");
    const response = await apiClient.get(paths.ownerYachts, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  getOwnerYachtDetail: async (yachtId: string): Promise<Yacht> => {
    const token = localStorage.getItem("token");
    const response = await apiClient.get(`${paths.ownerYachtDetail}/${yachtId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  getOwnerCurrentRides: async (): Promise<Ride[]> => {
    const token = localStorage.getItem("token");
    const response = await apiClient.get(paths.ownerCurrentRides, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  getOwnerPreviousRides: async (): Promise<Ride[]> => {
    const token = localStorage.getItem("token");
    const response = await apiClient.get(paths.ownerPreviousRides, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  getOwnerPreviousRideDetail: async (rideId: string): Promise<Ride> => {
    const token = localStorage.getItem("token");
    const response = await apiClient.get(`${paths.ownerPreviousRideDetail}/${rideId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  createYacht: async (yacht: CreateYachtRequest): Promise<CreateYachtRequest> => {
    const token = localStorage.getItem("token");
    const response = await apiClient.post(paths.createYacht, yacht, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  updateYacht: async (yachtId: string, yachtData: Partial<CreateYachtRequest>): Promise<CreateYachtRequest> => {
    const token = localStorage.getItem("token");
    const response = await apiClient.put(`${paths.updateYacht}/${yachtId}`, yachtData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  deleteYacht: async (yachtId: string): Promise<void> => {
    const token = localStorage.getItem("token");
    await apiClient.delete(`${paths.deleteYacht}/${yachtId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

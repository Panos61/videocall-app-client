export interface SystemEventData<T = any> {
  type: string;
  payload: T;
  received_at?: number;
}

export interface HostLeftPayload {
  previous_host_id: string;
  new_host_id: string;
  timestamp: number;
}

export interface HostUpdatedPayload {
  current_host_id: string;
  new_host_id: string;
  timestamp: number;
}

export interface RoomKilledPayload {
  timestamp: number;
}

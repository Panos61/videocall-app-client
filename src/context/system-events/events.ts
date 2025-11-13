export interface SystemEventData<T = any> {
  type: string;
  payload: T;
  received_at?: number;
}

export interface HostLeftPayload {
  previous_host_id: string;
  timestamp: number;
}

export interface HostUpdatedPayload {
  new_host_id: string;
  timestamp: number;
}
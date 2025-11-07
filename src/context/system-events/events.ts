export interface SystemEventData<T = any> {
  type: string;
  payload: T;
  received_at?: number;
}

export interface HostLeftPayload {
  previous_host_id: string;
  timestamp: number;
}

export interface HostHandoverPayload {
  candidate_id: string;
  has_accepted: boolean;
  timestamp: number;
}

export interface HostUpdatePayload {
  new_host_id: string;
  timestamp: number;
}
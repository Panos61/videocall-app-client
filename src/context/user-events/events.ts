export interface Reaction {
  id: string;
  reaction_type: string;
  username: string;
}

export interface RaisedHand {
  raised_hand: boolean;
  username: string;
}

export interface ShareScreen {
  trackSid: string;
  username: string;
  active: boolean;
}

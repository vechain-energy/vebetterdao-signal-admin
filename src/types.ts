export interface App {
  id: string;
  name: string;
  metadata: {
    logoUrl: string;
  };
}

export interface User {
  id: string;
  name: string;
}

export interface Transaction {
  id: string;
}

export interface BaseSignal {
  id: string;
  reason: string;
  timestamp: string;
  transaction: Transaction;
  user: User;
  app: App;
}

export interface Signal extends BaseSignal {
  signalCount: number;
}

export interface SignalReset extends BaseSignal {
  previousSignalCount: number;
}

export type SignalItem = Signal | SignalReset;
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

export interface Signal {
  id: string;
  signalCount: number;
  timestamp: string;
  transaction: Transaction;
  user: User;
  app: App;
}
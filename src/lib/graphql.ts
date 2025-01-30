import { createClient, cacheExchange, fetchExchange } from 'urql';

export const client = createClient({
  url: 'https://graph.vet/subgraphs/name/vebetter/dao',
  exchanges: [cacheExchange, fetchExchange],
  requestPolicy: 'cache-and-network',
});

export const SIGNALS_QUERY = `
  query Signals($first: Int!, $skip: Int!, $where: UserSignal_filter) {
    userSignals(
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
      where: $where
    ) {
      id
      signalCount
      reason
      transaction {
        id
      }
      timestamp
      user {
        id
        name
      }
      app {
        name
        id
        metadata {
          logoUrl
        }
      }
    }
  }
`;

export const APPS_QUERY = `
  query Apps {
    apps {
      id
      name
      metadata {
        logoUrl
      }
    }
  }
`;

export const USER_QUERY = `
  query User($id: ID!) {
    account(id: $id) {
      id
      name
      userSignals {
        id
        signalCount
        reason
        timestamp
        transaction {
          id
        }
        app {
          id
          name
        }
      }
    }
  }
`;
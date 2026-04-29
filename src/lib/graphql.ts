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
        metadataURI
        metadata {
          id
          title
          description
          externalUrl
          logoUrl
          bannerUrl
        }
      }
    }
  }
`;

export const SIGNAL_RESETS_QUERY = `
  query SignalResets($first: Int!, $skip: Int!, $where: UserSignalsResetForApp_filter) {
    userSignalsResetForApps(
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
      where: $where
    ) {
      id
      previousSignalCount
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
        metadataURI
        metadata {
          id
          title
          description
          externalUrl
          logoUrl
          bannerUrl
        }
      }
    }
  }
`;

export const APPS_QUERY = `
  query Apps {
    apps(orderBy: name, orderDirection: asc) {
      id
      name
      metadataURI
      metadata {
        id
        title
        description
        externalUrl
        logoUrl
        bannerUrl
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

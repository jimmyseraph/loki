import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
  split,
} from '@apollo/client';
import MainLayout from './main';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

export default function Layout(props: any) {
  const httpLink = new HttpLink({
    uri: '/apiv4',
    headers: {
      'Access-Token': `${localStorage.getItem('token')}`,
    },
  });

  const wsLink = new GraphQLWsLink(
    createClient({
      url: 'ws://localhost:8080/apiv4',
      connectionParams: {
        'Access-Token': `${localStorage.getItem('token')}`,
      },
    }),
  );

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLink,
  );

  const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
    // headers: {
    //     'Access-Token': `${localStorage.getItem('token')}`,
    // },
  });
  return (
    <ApolloProvider client={client}>
      <MainLayout>{props.children}</MainLayout>
    </ApolloProvider>
  );
}

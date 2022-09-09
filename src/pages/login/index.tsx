import './login.css';
import LoginForm from './loginForm';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
function Login() {
  const client = new ApolloClient({
    uri: '/apiv4',
    cache: new InMemoryCache(),
  });
  return (
    <ApolloProvider client={client}>
      <LoginForm />
    </ApolloProvider>
  );
}

export default Login;

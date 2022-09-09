import { Redirect } from 'umi';

export default (props: any) => {
  const { isLogin } = useAuth();
  if (isLogin) {
    return <div>{props.children}</div>;
  } else {
    return <Redirect to="/login" />;
  }
};

function useAuth(): { isLogin: any } {
  const isLogin = localStorage.getItem('token') ? true : false;
  return { isLogin };
}

import { useCookies } from 'react-cookie';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import graphqlRequestClient from '../clients/graphqlRequestClient';
import { useStateContext } from '../context';
import { IUser } from '../context/types';
import { GetMeQuery, useGetMeQuery } from '../generated/graphql';
import { REFRESH_ACCESS_TOKEN } from '../middleware/AuthMiddleware';
import FullScreenLoader from './FullScreenLoader';

const RequireUser = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const [cookies] = useCookies(['logged_in']);
  const location = useLocation();
  const stateContext = useStateContext();

  const { isLoading, isFetching, data, refetch } = useGetMeQuery<
    GetMeQuery,
    Error
  >(
    graphqlRequestClient,
    {},
    {
      retry: 1,
      onSuccess: (data) => {
        stateContext.dispatch({
          type: 'SET_USER',
          payload: data.getMe.user as IUser,
        });
      },
      onError(error: any) {
        error.response.errors.forEach(async (err: any) => {
          if (err.message.includes('not logged in')) {
            try {
              await graphqlRequestClient.request(REFRESH_ACCESS_TOKEN);
              refetch();
            } catch (error) {
              document.location.href = '/login';
            }
          }
        });
      },
    }
  );

  const user = data?.getMe.user;

  const loading = isFetching || isLoading;

  if (loading) {
    return <FullScreenLoader />;
  }

  return (cookies.logged_in || user) &&
    allowedRoles.includes(user?.role as string) ? (
    <Outlet />
  ) : (
    <Navigate to='/login' state={{ from: location }} replace />
  );
};

export default RequireUser;

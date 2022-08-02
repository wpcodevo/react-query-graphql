import { useCookies } from 'react-cookie';
import { useStateContext } from '../context';
import FullScreenLoader from '../components/FullScreenLoader';
import React from 'react';
import { GetMeQuery, useGetMeQuery } from '../generated/graphql';
import graphqlRequestClient from '../clients/graphqlRequestClient';
import { IUser } from '../context/types';
import { gql } from 'graphql-request';

export const REFRESH_ACCESS_TOKEN = gql`
  query {
    refreshAccessToken {
      status
      access_token
    }
  }
`;

type AuthMiddlewareProps = {
  children: React.ReactElement;
};

const AuthMiddleware: React.FC<AuthMiddlewareProps> = ({ children }) => {
  const [cookies] = useCookies(['logged_in']);
  const stateContext = useStateContext();

  const query = useGetMeQuery<GetMeQuery, Error>(
    graphqlRequestClient,
    {},
    {
      retry: 1,
      enabled: !!cookies.logged_in,
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
              query.refetch();
            } catch (error) {
              document.location.href = '/login';
            }
          }
        });
      },
    }
  );

  console.log(query.isLoading);

  if (query.isLoading && cookies.logged_in) {
    return <FullScreenLoader />;
  }

  return children;
};

export default AuthMiddleware;

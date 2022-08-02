import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import graphqlRequestClient from '../clients/graphqlRequestClient';
import { useStateContext } from '../context';
import { LogoutUserQuery, useLogoutUserQuery } from '../generated/graphql';

const Header = () => {
  const stateContext = useStateContext();
  const user = stateContext.state.authUser;

  const queryClient = useQueryClient();
  const { refetch } = useLogoutUserQuery(
    graphqlRequestClient,
    {},
    {
      enabled: false,
      onSuccess(data: LogoutUserQuery) {
        queryClient.clear();
        document.location.href = '/login';
      },
      onError(error: any) {
        error.response.errors.forEach((err: any) => {
          toast(err.message, {
            type: 'error',
            position: 'top-right',
          });
          queryClient.clear();
          document.location.href = '/login';
        });
      },
    }
  );

  const handleLogout = () => {
    refetch();
  };

  return (
    <header className='bg-white h-20'>
      <nav className='h-full flex justify-between container items-center'>
        <div>
          <Link to='/' className='text-ct-dark-600 text-2xl font-semibold'>
            CodevoWeb
          </Link>
        </div>
        <ul className='flex items-center gap-4'>
          <li>
            <Link to='/' className='text-ct-dark-600'>
              Home
            </Link>
          </li>
          {!user && (
            <>
              <li>
                <Link to='/register' className='text-ct-dark-600'>
                  SignUp
                </Link>
              </li>
              <li>
                <Link to='/login' className='text-ct-dark-600'>
                  Login
                </Link>
              </li>
            </>
          )}
          {user && (
            <>
              <li>
                <Link to='/profile' className='text-ct-dark-600'>
                  Profile
                </Link>
              </li>
              <li className='cursor-pointer'>Create Post</li>
              <li className='cursor-pointer' onClick={handleLogout}>
                Logout
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;

import React from 'react';

import { Icon } from '@chakra-ui/react';
import {
  MdHome,
  MdLock,
  MdAdd,
  MdList,
  MdSettings,
  MdPerson,
  MdFileDownload,
} from 'react-icons/md';

// Admin Imports
import Dashboard from 'views/admin/default';
import Generate from 'views/admin/generate';
import List from 'views/admin/list';
import Settings from 'views/admin/settings';
import DownloadSample from 'views/admin/download-sample';
import Profile from 'views/admin/profile';

// Auth Imports
import SignInCentered from 'views/auth/signIn';

const routes = [
  {
    name: 'Dashboard',
    layout: '/admin',
    path: '/default',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <Dashboard />,
  },
  {
    name: 'Generate',
    layout: '/admin',
    path: '/generate',
    icon: <Icon as={MdAdd} width="20px" height="20px" color="inherit" />,
    component: <Generate />,
  },
  {
    name: 'History',
    layout: '/admin',
    path: '/list',
    icon: <Icon as={MdList} width="20px" height="20px" color="inherit" />,
    component: <List />,
  },
  {
    name: 'Download Sample',
    layout: '/admin',
    path: '/download-sample',
    icon: <Icon as={MdFileDownload} width="20px" height="20px" color="inherit" />,
    component: <DownloadSample />,
  },
  {
    name: 'Settings',
    layout: '/admin',
    path: '/settings',
    icon: <Icon as={MdSettings} width="20px" height="20px" color="inherit" />,
    component: <Settings />,
  },
  {
    name: 'Profile',
    layout: '/admin',
    path: '/profile',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: <Profile />,
  },
  {
    name: 'Sign In',
    layout: '/auth',
    path: '/sign-in',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: <SignInCentered />,
  },
];

export default routes;

import React from 'react';
import { configure, addDecorator } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';

addDecorator(storyFn => <BrowserRouter>{storyFn()}</BrowserRouter>);
configure(require.context('../src', true, /\.stories\.jsx$/), module);

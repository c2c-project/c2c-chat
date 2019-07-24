import { configure } from '@storybook/react';

function loadStories() {
    const req = require.context('../stories', true, /\.stories\.js$/);
    console.log(req.keys());
    req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);

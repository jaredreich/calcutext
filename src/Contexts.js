import React from 'react';

export const AppContext = React.createContext({
  activeTextId: '',
  setActiveTextId: () => {},
  texts: [],
  setTexts: () => {},
});

export default null;

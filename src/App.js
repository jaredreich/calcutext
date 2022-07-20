import React, { useEffect, useState } from 'react';

import { AppContext } from './Contexts';
import Banner from './Banner';
import TextArea from './TextArea';
import { createNewText } from './utilities';

const LOCAL_STORAGE_KEY_ACTIVE_TEXT_ID = 'activeTextId';
const LOCAL_STORAGE_KEY_TEXTS = 'texts';
const LOCAL_STORAGE_KEY_SETTINGS = 'settings';

const INITIAL_TEXT = createNewText();

export default function App() {
  const storageUnparsedTexts = global.window.localStorage.getItem(
    LOCAL_STORAGE_KEY_TEXTS,
  );
  const storageTexts = storageUnparsedTexts
    ? JSON.parse(storageUnparsedTexts)
    : [INITIAL_TEXT];
  const storageActiveTextId =
    global.window.localStorage.getItem(LOCAL_STORAGE_KEY_ACTIVE_TEXT_ID) ||
    storageTexts[0].id;
  const storageUnparsedSettings = global.window.localStorage.getItem(
    LOCAL_STORAGE_KEY_SETTINGS,
  );
  const storageSettings = storageUnparsedSettings
    ? JSON.parse(storageUnparsedSettings)
    : {};

  const [activeTextId, setActiveTextId] = useState(storageActiveTextId);
  const [settings, setSettings] = useState(storageSettings);
  const [texts, setTexts] = useState(storageTexts);

  useEffect(() => {
    global.window.localStorage.setItem(
      LOCAL_STORAGE_KEY_ACTIVE_TEXT_ID,
      activeTextId,
    );
    global.window.localStorage.setItem(
      LOCAL_STORAGE_KEY_SETTINGS,
      JSON.stringify(settings),
    );
    global.window.localStorage.setItem(
      LOCAL_STORAGE_KEY_TEXTS,
      JSON.stringify(texts),
    );
  }, [activeTextId, settings, texts]);

  return (
    <>
      <AppContext.Provider
        value={{
          activeTextId,
          setActiveTextId,
          texts,
          setTexts,
          settings,
          setSettings,
        }}
      >
        <div className="app">
          <Banner />
          <TextArea />
        </div>
      </AppContext.Provider>

      <style jsx="true" global="true">
        {`
          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            font-size: 16px;
          }

          html,
          body,
          input,
          textarea,
          pre {
            font-family: SFMono-Regular, Menlo, Monaco, Consolas,
              'Liberation Mono', 'Courier New', monospace;
          }

          @media (max-width: 600px) {
            html,
            body {
              font-size: 12px;
            }
          }

          // Remove tap highlight on iOS
          input,
          textarea,
          button,
          select,
          label,
          a {
            -webkit-tap-highlight-color: transparent;
          }

          input {
            width: 100%;
          }
        `}
      </style>
    </>
  );
}

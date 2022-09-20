import React, { useState } from 'react';
import classNames from 'classnames';

import { AppContext } from './Contexts';
import { COLOR_BLACK, COLOR_GRAY } from './constants';
import {
  iconAdd,
  iconClose,
  iconGitHub,
  iconMenu,
  iconSettings,
  iconTrash,
  logo,
} from './images';
import { createNewText } from './utilities';

export default function Banner() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettings, setIsSettings] = useState(false);

  const handleClickAdd = (texts, setTexts, setActiveTextId) => {
    const textsNew = texts.slice(0);
    const textNew = createNewText();
    textsNew.push(textNew);
    setTexts(textsNew);
    setActiveTextId(textNew.id);
  };

  const handleClickDelete = (
    texts,
    setTexts,
    activeTextId,
    setActiveTextId,
  ) => {
    // Can't delete last text
    if (texts.length === 1) {
      global.window.alert('You cannot delete the last calcutext.');
      return;
    }

    const foundIndex = texts.findIndex((text) => text.id === activeTextId);
    const textsRemaining = texts.slice(0);
    textsRemaining.splice(foundIndex, 1);
    setTexts(textsRemaining);

    // Select the next text to be active, either before or after
    const nextActiveText = texts[foundIndex + 1] || texts[foundIndex - 1];
    setActiveTextId(nextActiveText.id);
  };

  const handleClickSettings = () => {
    setIsSettings(!isSettings);
  };

  const handleClickClose = () => {
    setIsOpen(false);
  };

  const handleClickMenu = () => {
    setIsOpen(!isOpen);
    setIsSettings(false);
  };

  const handleClickText = (text, setActiveTextId) => {
    setActiveTextId(text.id);
    setIsOpen(false);
  };

  const handleChangeSettingsWidth = (width, settings, setSettings) => {
    setSettings({
      ...settings,
      width,
    });
  };

  return (
    <AppContext.Consumer>
      {({
        texts,
        setTexts,
        activeTextId,
        setActiveTextId,
        settings,
        setSettings,
      }) => (
        <>
          {isOpen ? (
            <div className="menu">
              <div className="menu-icons">
                <div
                  className="menu-icon"
                  onClick={() => {
                    if (!isSettings) {
                      handleClickAdd(texts, setTexts, setActiveTextId);
                    }
                  }}
                  onKeyDown={() => {}}
                  role="button"
                  style={isSettings ? { cursor: 'not-allowed' } : {}}
                  tabIndex={0}
                >
                  <img
                    src={
                      isSettings ? iconAdd(COLOR_GRAY) : iconAdd(COLOR_BLACK)
                    }
                    alt="Add"
                  />
                </div>
                <div
                  className="menu-icon"
                  onClick={() => {
                    if (!isSettings) {
                      handleClickDelete(
                        texts,
                        setTexts,
                        activeTextId,
                        setActiveTextId,
                      );
                    }
                  }}
                  onKeyDown={() => {}}
                  role="button"
                  style={isSettings ? { cursor: 'not-allowed' } : {}}
                  tabIndex={0}
                >
                  <img
                    src={
                      isSettings
                        ? iconTrash(COLOR_GRAY)
                        : iconTrash(COLOR_BLACK)
                    }
                    alt="Delete"
                  />
                </div>
                <div
                  className="menu-icon"
                  onClick={handleClickSettings}
                  role="button"
                  onKeyDown={() => {}}
                  tabIndex={0}
                >
                  <img src={iconSettings(COLOR_BLACK)} alt="Settings" />
                </div>
                <div className="menu-icon-spacer" />
                <div
                  className="menu-icon menu-icon-right"
                  onClick={handleClickClose}
                  role="button"
                  onKeyDown={() => {}}
                  tabIndex={0}
                >
                  <img src={iconClose(COLOR_BLACK)} alt="Close" />
                </div>
              </div>
              <div className="menu-content">
                {isSettings ? (
                  <div className="settings-container">
                    <div>
                      <b>
                        <u>Settings</u>
                      </b>
                    </div>
                    <br />
                    <div>
                      <label htmlFor="settings-width">
                        <div>Max-width</div>
                        <input
                          id="settings-width"
                          max="900"
                          min="100"
                          onChange={(event) =>
                            handleChangeSettingsWidth(
                              event.target.value,
                              settings,
                              setSettings,
                            )
                          }
                          placeholder="Enter max-width"
                          type="number"
                          value={settings.width}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  texts.map((text) => (
                    <div
                      className={classNames({
                        'menu-content-item': true,
                        'menu-content-item-active': text.id === activeTextId,
                      })}
                      key={text.id}
                      onClick={() => handleClickText(text, setActiveTextId)}
                      onKeyDown={() => {}}
                      role="button"
                      tabIndex={0}
                    >
                      {text.data.title || '(Untitled)'}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}

          <div className="banner-container">
            <div className="banner">
              <div className="banner-left">
                <div>
                  <img
                    className="banner-left-logo"
                    src={logo}
                    alt="Calcutext Logo"
                  />
                </div>
              </div>
              <div className="banner-right">
                <div className="banner-right-item">
                  <a
                    href="https://github.com/jaredreich/calcutext"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <img src={iconGitHub(COLOR_GRAY)} alt="GitHub" />
                  </a>
                </div>
                <div
                  className="banner-right-item"
                  onClick={handleClickMenu}
                  onKeyDown={() => {}}
                  role="button"
                  tabIndex={0}
                >
                  <img src={iconMenu(COLOR_BLACK)} alt="Menu" />
                </div>
              </div>
            </div>
          </div>

          <style jsx="true">
            {`
              .menu {
                background-color: #fafafa;
                border-left: 1px dashed #d3d3d3;
                height: 100vh;
                overflow-y: auto;
                position: fixed;
                right: 0;
                top: 0;
                width: 280px;
                z-index: 3;
              }

              .menu-icons {
                align-items: center;
                column-gap: 0.75rem;
                display: flex;
                width: 100%;
                padding: 0.75rem 1rem;
                height: 50px;
              }

              .menu-icon {
                cursor: pointer;
                display: flex;
              }
              .menu-icon img {
                height: 24px;
                width: 24px;
              }
              .menu-icon-spacer {
                flex: 1;
              }

              .menu-content {
                margin-bottom: 50px;
                margin-top: 10px;
              }

              .menu-content-item {
                cursor: pointer;
                padding: 0.75rem 1.25rem;
              }
              .menu-content-item:hover {
                background-color: #eaeaea;
              }

              .menu-content-item-active {
                background-color: #eaeaea;
                font-weight: bold;
              }

              .banner-container {
                background-color: #ffffff;
                border-bottom: 1px dashed #d3d3d3;
                height: 50px;
                left: 0;
                position: fixed;
                top: 0;
                width: 100%;
                z-index: 2;
              }

              .banner {
                align-items: center;
                display: flex;
                height: 50px;
                margin: 0 auto;
                padding: 0 1.25rem;
              }

              .banner-left {
                flex: 1;
              }

              .banner-left-logo {
                height: 16px;
              }

              .banner-right {
                display: flex;
                column-gap: 1rem;
              }

              .banner-right-item {
                align-items: center;
                cursor: pointer;
                display: flex;
              }
              .banner-right-item a {
                display: flex;
              }
              .banner-right-item img {
                height: 20px;
                width: 20px;
              }

              .settings-container {
                padding: 0 20px;
              }
            `}
          </style>
        </>
      )}
    </AppContext.Consumer>
  );
}

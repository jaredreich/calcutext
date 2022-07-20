import React from 'react';

import { COLOR_BLACK } from './constants';
import { iconRefresh } from './images';

export default function ActionBubbles({
  // eslint-disable-next-line react/prop-types
  showChangeVariableColor,
  // eslint-disable-next-line react/prop-types
  onChangeVariableColor,
}) {
  return (
    <>
      <div className="actionbubbles">
        {showChangeVariableColor && (
          <div
            className="actionbubbles-button"
            onClick={onChangeVariableColor}
            onKeyDown={() => {}}
            role="button"
            tabIndex={0}
          >
            <img src={iconRefresh(COLOR_BLACK)} alt="Action" />
          </div>
        )}
      </div>

      <style jsx="true">
        {`
          .actionbubbles {
            align-items: center;
            background-color: rgba(25, 50, 75, 0.5);
            background-color: transparent;
            bottom: 20px;
            display: flex;
            position: fixed;
            right: 20px;
            z-index: 1;
          }

          .actionbubbles-button {
            align-items: center;
            background-color: #ffffff;
            border-radius: 50%;
            border: 1px solid #d3d3d3;
            box-shadow: 0 0.5em 1em -0.125em rgba(10, 10, 10, 0.1),
              0 0 0 1px rgba(10, 10, 10, 0.02);
            cursor: pointer;
            display: flex;
            height: 40px;
            justify-content: center;
            width: 40px;
          }

          .actionbubbles-button:hover {
            background-color: #fafafa;
          }

          .actionbubbles-button img {
            height: 15px;
            width: 15px;
          }
        `}
      </style>
    </>
  );
}

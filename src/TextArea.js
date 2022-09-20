import React, { useContext, useEffect, useRef, useState } from 'react';
import { format, parser as Parser, Unit } from 'mathjs';
import { v4 as uuidv4 } from 'uuid';

import ActionBubbles from './ActionBubbles';
import { AppContext } from './Contexts';
import { SETTINGS_WIDTH_MIN } from './constants';
// import { debounce } from './utilities';

// Move these to settings
const PLACEHOLDER = 'Start calculating...';
const PRECISION = 2;
const VARIABLE_COLORS = [
  '#F51720', // red
  '#FA26A0', // pink
  '#BD97CB', // purple
  '#2FF3E0', // cyan
  '#20f517', // green
  '#1720F5', // blue
];

const getRandomVariableColorIndex = () =>
  Math.floor(Math.random() * VARIABLE_COLORS.length);

const getNextVariableColorIndex = (oldIndex) =>
  oldIndex === VARIABLE_COLORS.length - 1 ? 0 : oldIndex + 1;

// STYLING
const FONT_SIZE = '1.25rem';
const LETTER_SPACING = 'normal';
const LINE_HEIGHT = '1.75rem';
const MARGIN_BOTTOM = 0;
const MARGIN_TOP = 0;
const PADDING = `0 1.25rem 0 1.25rem`; // top right bottom left

export default function App() {
  const appContext = useContext(AppContext);
  const { activeTextId, texts, setTexts, settings } = appContext;

  const [lines, setLines] = useState([]);
  const [textareaValue, setTextareaValue] = useState('');
  const [titleValue, setTitleValue] = useState('');
  const [variableColors, setVariableColors] = useState({});
  const [activeVariableName, setActiveVariableName] = useState('');

  const editorElement = useRef(null);
  const isMounted = useRef(false);

  useEffect(() => {
    const activeText = texts.find((text) => text.id === activeTextId);
    const { body, colors, title } = activeText.data;
    update({ body, colors, title });

    global.window.addEventListener('resize', handleResize);
    return () => {
      global.window.removeEventListener('resize', handleResize);
    };
  }, [activeTextId]); // eslint-disable-line

  // Update when active variable name changes
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    update({ body: textareaValue, colors: variableColors, title: titleValue });
  }, [activeVariableName]); // eslint-disable-line

  const getResultFromInput = ({ input, parser }) => {
    try {
      // Pre-parse input
      // Used to ignore underscores in numbers to enable rust-like syntax
      input = input.replace(/\b([\d_]+)/gi, (match) => (match.replace(/_/gi,'')));

      const result = parser.evaluate(input);

      if (typeof result === 'number') {
        if (Math.abs(result) >= 1000000) {
          // huge number
          return format(result, {
            notation: 'exponential',
            precision: PRECISION + 1,
          });
        }
        if (result % 1 !== 0) {
          // number with decimal
          return format(result, { notation: 'fixed', precision: PRECISION });
        }
        return result;
      }

      if (result instanceof Unit) {
        return String(
          result.format({ notation: 'fixed', precision: PRECISION }),
        );
      }

      return null;
    } catch (error) {
      // return error.message;
      return null;
    }
  };

  const getHtmlFromInput = ({ input, parser }) => {
    let html = input;
    const variablesFromParser = parser.getAll();
    Object.keys(variablesFromParser).forEach((varName) => {
      const regex = new RegExp(`\\b${varName}\\b`, 'g');
      html = html.replace(
        regex,
        `<span class="variable variable-${varName}${
          activeVariableName === varName ? ' variable-active' : ''
        }" data-variable="${varName}">${varName}</span>`,
      );
    });
    return html;
  };

  const getLines = ({ parser, body }) => {
    if (!body) return [];

    const inputLines = body.split(/\r?\n/);

    const linesNew = inputLines
      ? inputLines.map((lineValue) => {
          // getResultFromInput must be ran before getHtmlFromInput
          // since parser.evaluate defines variables to be used
          const result = getResultFromInput({ input: lineValue, parser });
          const html = getHtmlFromInput({ input: lineValue, parser });
          return {
            id: uuidv4(),
            input: lineValue,
            html,
            result,
          };
        })
      : [];

    return linesNew;
  };

  const checkAndPopulateVariableColors = ({ colors, parser }) => {
    const variableColorsNew = { ...colors };
    const variablesFromParser = parser.getAll();

    Object.keys(variablesFromParser).forEach((varName) => {
      if (
        typeof variableColorsNew[varName] !== 'number' ||
        variableColorsNew[varName] < 0 ||
        variableColorsNew[varName] >= VARIABLE_COLORS.length
      ) {
        variableColorsNew[varName] = getRandomVariableColorIndex();
      }
    });

    return variableColorsNew;
  };

  const update = ({ colors, body, title }) => {
    const parser = Parser();

    setTitleValue(title);
    setTextareaValue(body);

    const linesNew = getLines({ parser, body });
    setLines(linesNew);

    const colorsNew = checkAndPopulateVariableColors({
      colors,
      parser,
    });
    setVariableColors(colorsNew);

    const textsNew = texts.map((text) => {
      if (text.id === activeTextId) {
        return {
          id: text.id,
          data: {
            body,
            colors: colorsNew,
            title,
          },
        };
      }
      return text;
    });
    setTexts(textsNew);

    setTimeout(() => {
      autoResizeEditor();
    }, 0);
  };

  const handleTitleChange = (event) => {
    update({
      body: textareaValue,
      colors: variableColors,
      title: event.target.value,
    });
  };

  const handleChange = (event) => {
    update({
      body: event.target.value,
      colors: variableColors,
      title: titleValue,
    });
  };

  const handleClick = (event) => {
    const editor = editorElement.current;
    if (!editor) return;

    editor.style.pointerEvents = 'none';
    const elementBelow = global.window.document.elementFromPoint(
      event.clientX,
      event.clientY,
    );
    editor.style.pointerEvents = 'auto';

    const activeVariableNameNew = elementBelow.dataset.variable;
    if (activeVariableNameNew && activeVariableNameNew !== activeVariableName) {
      setActiveVariableName(activeVariableNameNew);
    } else {
      setActiveVariableName('');
    }
  };

  const handleChangeVariableColor = () => {
    const variableColorsNew = { ...variableColors };
    const oldIndex = variableColorsNew[activeVariableName];
    const newIndex = getNextVariableColorIndex(oldIndex);
    variableColorsNew[activeVariableName] = newIndex;

    update({
      body: textareaValue,
      colors: variableColorsNew,
      title: titleValue,
    });
  };

  const handleResize = (/* event */) => {
    // Handle resize here...
  };

  const autoResizeEditor = () => {
    const editor = editorElement.current;
    if (!editor) return;

    editor.style.height = '1px';
    editor.style.height = `${editor.scrollHeight}px`;
  };

  const extraStyles =
    variableColors &&
    Object.keys(variableColors)
      .map((varName) => {
        const variableColorIndex = variableColors[varName];
        const variableColor = VARIABLE_COLORS[variableColorIndex];
        return `.variable-${varName} { color: ${variableColor}; }\n`;
      })
      .join('');

  return (
    <>
      <div className="textarea">
        <div className="container-outer">
          <div className="container-inner">
            <div className="title">
              <input
                className="title-input"
                type="text"
                placeholder="Title here"
                value={titleValue}
                onChange={handleTitleChange}
              />
            </div>
            <div className="container-editor">
              <textarea
                className="editor"
                value={textareaValue}
                placeholder={textareaValue ? null : PLACEHOLDER}
                onChange={handleChange}
                ref={editorElement}
                onClick={handleClick}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />

              <div className="background">
                {lines.map((line) => (
                  <div className="line" key={line.id}>
                    <div
                      className={
                        line.result
                          ? 'line-input'
                          : 'line-input line-input-no-result'
                      }
                      dangerouslySetInnerHTML={{ __html: line.html }}
                    />
                    <div
                      className={
                        line.result
                          ? 'line-result'
                          : 'line-result line-result-no-result'
                      }
                    >
                      <div className="line-result-value">{line.result}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {activeVariableName && (
          <ActionBubbles
            showChangeVariableColor
            onChangeVariableColor={handleChangeVariableColor}
          />
        )}
      </div>

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
        `}
      </style>

      <style jsx="true">
        {`
          .container-outer {
          }

          .container-inner {
            position: relative;
            max-width: ${settings.width || SETTINGS_WIDTH_MIN}px;
            width: 100%;
            margin: 0 auto;
            padding: ${PADDING};
          }

          .title {
            margin-top: 50px;
            padding: 30px 0;
          }

          .title-input {
            border: none;
            font-size: 2rem;
            outline: none;
            width: 100%;
          }

          .container-editor {
            display: grid;
            margin-bottom: 30px;
          }

          .editor {
            background-color: transparent;
            border: none;
            border-right: 1px dashed #f2f2f2;
            caret-color: black;
            color: transparent;
            // color: rgba(100, 100, 100, 0.5);
            font-size: ${FONT_SIZE};
            // font-weight: bold;
            grid-column: 1;
            grid-row: 1;
            left: 0;
            letter-spacing: ${LETTER_SPACING};
            line-height: ${LINE_HEIGHT};
            min-height: ${LINE_HEIGHT};
            overflow: hidden;
            padding: 0;
            margin-bottom: ${MARGIN_BOTTOM}px;
            padding-right: 8px;
            margin-top: ${MARGIN_TOP}px;
            resize: none;
            top: 0;
            width: 70%;
            word-break: break-word;
            z-index: 1;
          }
          .editor:focus {
            outline: none;
          }

          .background {
            font-size: ${FONT_SIZE};
            // font-weight: bold;
            grid-column: 1;
            grid-row: 1;
            letter-spacing: ${LETTER_SPACING};
            overflow: hidden;
            margin-bottom: ${MARGIN_BOTTOM}px;
            margin-top: ${MARGIN_TOP}px;
            resize: none;
            white-space: pre-wrap;
            word-break: break-word;
          }

          .line {
            // border-bottom: 1px dashed #F2F2F2;
            line-height: ${LINE_HEIGHT};
            min-height: ${LINE_HEIGHT};
            position: relative;
            word-break: break-word;
          }

          .line-input {
            // border-right: 1px dashed #F2F2F2;
            color: #444;
            display: inline-block;
            padding-right: 8px;
            width: 70%;
            word-break: break-word;
          }
          .line-input-no-result {
            // border-right: none;
          }

          .line-result {
            border-bottom: 1px dashed #f2f2f2;
            color: #aaaaaa;
            display: inline-block;
            position: absolute;
            right: 0;
            bottom: 0;
            font-weight: normal;
            width: 100%;
            white-space: nowrap;
            text-align: right;
          }
          .line-result-no-result {
            border-bottom: none;
          }

          .line-result-value {
            bottom: 0;
            position: absolute;
            right: 0;
            width: 28%;
          }

          .variable {
          }
          .variable-active {
            text-decoration: underline;
          }

          ${extraStyles}
        `}
      </style>
    </>
  );
}

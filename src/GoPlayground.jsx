import React, {
  useRef, useState, useEffect
} from 'react';

import PropTypes from 'prop-types';
import CodeMirror from 'codemirror';
import 'codemirror/mode/go/go';
import 'codemirror/keymap/sublime';
import 'codemirror/addon/selection/active-line';
import 'codemirror/addon/comment/comment';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/darcula.css';

import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Toolbar from '@material-ui/core/Toolbar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import App from './App';
import FormatButton from './FormatButton';
import Settings from './Settings';
import Errors from './Errors';
import Result from './Result';
import createTheme from './createTheme';
import SendButton from './SendButton';
import Editor from './Editor';

const useStyles = makeStyles((theme) => ({
  '@global': {
    '.CodeMirror': {
      fontSize: '0.8rem',
    },
    '.cm-s-darcula .lineerror, .cm-s-darcula .lineerror *': {
      background: 'rgba(255,100,100,0.1)',
      color: '#ff4040 !important',
    },
    '.cm-s-default .lineerror, .cm-s-default .lineerror *': {
      background: 'rgba(255,221,221,0.25)',
      color: 'red !important',
    },
  },
  root: {
    fontSize: theme.typography.fontSize,
    background: theme.palette.primary.main,
    border: 0,
    color: '#fff',
  },
  toolbar: {},
  header: {
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.primary.contrastText,
    flexGrow: 1,
    '& > *': {
      marginRight: theme.spacing(1),
    },
  },
  title: {
    marginRight: theme.spacing(2),
  },
  editor: {
    fontSize: '0.8rem',
  },
  result: {
    position: 'relative',
    marginTop: theme.spacing(1),
  },
  resultOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: 'flex',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    zIndex: 10,
  },
}));

const errReg = /prog\.go:(\d+):(\d+):(.+)/g;

export default function GoPlayground(props) {
  const {
    id,
    title,
    code,
    color,
    server,
    hideFormat,
    hideHeader,
    readOnly,
    toolBarStyle,
    theme: themeExtend,
    settingsIconStyle,
    editorHeight,
    resultHeight,
    appendButtons,
    useTextOnButton,
    style,
    disableThemeSwitch,
    onColorChange,
    onRun,
    onFormat,
    markOptions,
    expectedResults
  } = props;

  const [theme, setTheme] = useState(createTheme(color, themeExtend));
  const classes = useStyles(theme);
  const [result, setResult] = useState({});
  const [running, setRunning] = useState(false);
  const [textOnButton, setTextOnButton] = useState(useTextOnButton || true);
  const editor = useRef({});
  const runBtn = useRef();
  const formatBtn = useRef();

  useEffect(() => {
    setTextOnButton(useTextOnButton);
  }, [useTextOnButton]);

  useEffect(() => {
    const cm = CodeMirror(editor.current, {
      value: code.trim(),
      mode: 'go',
      lineNumbers: true,
      tabSize: 2,
      smartTabs: true,
      autoSave: true,
      indentWithTabs: true,
      styleActiveLine: !readOnly,
      cursorHeight: readOnly ? 0 : 1,
      viewportMargin: Infinity,
      keyMap: 'sublime',
      extraKeys: {
        'Cmd-Enter': function () {
          runBtn.current.click();
          onRun();
        },
        'Shift-Enter': function () {
          formatBtn.current.click();
          onFormat();
        },
      },
      theme: theme.palette.type === 'light' ? 'default' : 'darcula',
      readOnly,
    });
    console.log(markOptions, "markOptions")
    if (markOptions) {
      cm.markText(markOptions.from, markOptions.to,{  css: "background-color: olive", readOnly: true });
    }


    editor.current.cm = cm;
    editor.current.errors = [];
  }, []);

  function handleThemeChange(newTheme) {
    setTheme(newTheme);
    onColorChange(newTheme.palette.type);
  }

  useEffect(() => {
    editor.current.cm.setOption('theme', theme.palette.type === 'light' ? 'default' : 'darcula');
  }, [theme.palette.type]);

  useEffect(() => {
    editor.current.cm.setSize(null, editorHeight);
  }, [editorHeight]);

  function onResult(json) {
    setResult(json);
    editor.current.errors.forEach((line) => {
      editor.current.cm.removeLineClass(line, '', 'lineerror');
    });
    editor.current.errors = [];
    if (json.Errors) {
      let r = errReg.exec(json.Errors);
      while (r) {
        const line = r[1] - 1;
        editor.current.errors.push(line);
        editor.current.cm.addLineClass(line, '', 'lineerror');
        r = errReg.exec(json.Errors);
      }
    }
    setRunning(false);
  }

  return (
    <MuiThemeProvider theme={theme}>
      <App className={classes.root} style={style} id={id}>
        <Toolbar className={classes.toolbar} style={{ ...toolBarStyle, display: hideHeader ? 'none' : null }}>
          <div className={classes.header} style={{ flex: `0 0 ${editorHeight}` }}>
            {title && <Typography variant="body1" className={classes.title}>{title}</Typography>}
            <SendButton
              ref={{ editor, runBtn }}
              url={`${server}compile`}
              onRun={() => {
                setRunning(true);
                onRun();
              }}
              onResult={onResult}
              onError={alert}
              color="secondary"
              textOnButton={textOnButton}
            >
              Run
            </SendButton>
            {!hideFormat && (
              <FormatButton
                ref={{ editor, formatBtn }}
                editor={editor}
                url={`${server}fmt`}
                onRun={onFormat}
                onResult={setResult}
                onError={alert}
                textOnButton={textOnButton}
              >
                Format
              </FormatButton>
            )}
            {React.Children.map(appendButtons, (e) => React.cloneElement(e, {
              ref: { editor },
              url: `${server}${e.props.path}`,
              textOnButton
            }, e.props.children))}
          </div>
          <Settings
            theme={theme}
            handleThemeChange={handleThemeChange}
            themeExtend={themeExtend}
            settingsIconStyle={settingsIconStyle}
            textOnButton={textOnButton}
            setTextOnButton={setTextOnButton}
            disableThemeSwitch={disableThemeSwitch}
          />
        </Toolbar>
        <Paper>
          <Editor className={classes.editor} ref={editor} style={{ height: editorHeight }} />
        </Paper>
        <div className={classes.result}>
          <Fade in={running} timeout={200}>
            <div className={classes.resultOverlay}><CircularProgress color="secondary" /></div>
          </Fade>
          <Result result={result} loading={running} resultHeight={resultHeight} expect={expectedResults}/>
          <Errors result={result} loading={running} resultHeight={resultHeight} />
        </div>
      </App>
    </MuiThemeProvider>
  );
}

GoPlayground.propTypes = {
  id: PropTypes.string,
  title: PropTypes.node,
  code: PropTypes.string,
  style: PropTypes.objectOf(PropTypes.any),
  color: PropTypes.oneOf(['light', 'dark']),
  theme: PropTypes.objectOf(PropTypes.any),
  server: PropTypes.string,
  readOnly: PropTypes.bool,
  hideHeader: PropTypes.bool,
  hideFormat: PropTypes.bool,
  editorHeight: PropTypes.number,
  resultHeight: PropTypes.number,
  appendButtons: PropTypes.node,
  useTextOnButton: PropTypes.bool,
  // Styles
  toolBarStyle: PropTypes.objectOf(PropTypes.any),
  settingsIconStyle: PropTypes.objectOf(PropTypes.any),

  disableThemeSwitch: PropTypes.bool,

  // Events
  onColorChange: PropTypes.func,
  onRun: PropTypes.func,
  onFormat: PropTypes.func,
};

const noop = () => {
};

GoPlayground.defaultProps = {
  id: null,
  title: null,
  style: {},
  code: '',
  color: 'dark',
  editorHeight: 300,
  resultHeight: 80,
  theme: {},
  server: 'https://play.golang.org/',
  readOnly: false,
  hideHeader: false,
  hideFormat: false,
  appendButtons: null,
  useTextOnButton: true,
  settingsIconStyle: {},
  toolBarStyle: {},
  disableThemeSwitch: false,
  onColorChange: noop,
  onRun: noop,
  onFormat: noop,
};

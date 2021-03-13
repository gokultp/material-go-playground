import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import Grid from '@material-ui/core/Grid';
import orange from '@material-ui/core/colors/orange';
import green from '@material-ui/core/colors/green';

// import GoPlayground xxxxfrom "./dist";
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Message from '@material-ui/icons/Send';
import GoPlayground from './src';
import ShareButton from './src/ShareButton';
import createTheme from './src/createTheme';

const code = `package main

import (
  "fmt"
)

func main() {
  fmt.Println("Hello, playground")
}`;

const code2 = `package main

import (
  "fmt"
  "time"
)

func main() {
  fmt.Println("Hello, playground")
  
  go func() {
    time.Sleep(20)
    fmt.Println("Hello, playground, again!")
  }()
  
  time.Sleep(30)
}`;

const codeLongOutput = `package main

import (
  "fmt"
  "time"
  "math/rand"
)

func main() {
  for i:=0; i<=30; i++ {
    fmt.Println("Hello, playground")
    time.Sleep(time.Duration(rand.Intn(5)))
  }
}`;

const codeError = `package main

import (
  "fmt"
  //"time"
)

func main() {
  fmt.Println("Hello, playground")
  
  go func() {
    time.Sleep(20)
    fmt.Println("Hello, playground, again!")
  }()
  
  time.Sleep(30)
}`;

const codeImports = `package main

import (
  "fmt"
  "github.com/torden/go-strutil"
)

func main() {
  strutil := strutils.NewStringProc()
  example_str := "a\\\\bcdefgz"
  fmt.Println(strutil.StripSlashes(example_str))
}`;


const codeTestFail = `
package main

import (
  "testing"
)

func Abs(i int) int {
  return 5
}

func TestAbs(t *testing.T) {
    got := Abs(-1)
    if got != 1 {
        t.Errorf("Abs(-1) = %d; want 1", got)
    }
}
`;
const codeTestSuccess = `
package main

import (
  "testing"
)

func Abs(i int) int {
  return 1
}

func TestAbs(t *testing.T) {
    got := Abs(-1)
    if got != 1 {
        t.Errorf("Abs(-1) = %d; want 1", got)
    }
}
`;

function useWindowSize() {
  function getSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  const [windowSize, setWindowSize] = useState(getSize);

  useEffect(() => {
    function handleResize() {
      setWindowSize(getSize());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return windowSize;
}

function App() {
  const { width } = useWindowSize();
  return (
    <MuiThemeProvider theme={createTheme()}>
      <AppBar>
        <Toolbar>
          <Typography variant="h6">Golang playground component</Typography>
        </Toolbar>
      </AppBar>
      <div style={{ marginTop: 60 }}>
        <Grid container spacing={2}>
          <Grid item sm={12} xs={12}>
            <GoPlayground
              id="playground"
              markOptions={{from: {line: 1, ch: 1}, to: {line: 10, ch:1}}}
              expectedResults={"Hello, playground\n"}
              code={code2}
              title="Go playground"
              useTextOnButton={width > 500}
              appendButtons={(
                <ShareButton
                  icon={<Message />}
                  path="share"
                  onError={alert}
                >
                  Share
                </ShareButton>
              )}
              onColorChange={(color) => {
                console.log(`Color now is ${color}`);
              }}
            />
          </Grid>
          <Grid item sm={6} xs={12}>
            <GoPlayground
              title="Light theme"
              code={code2}
              color="light"
              useTextOnButton
            />
          </Grid>
          <Grid item sm={6} xs={12}>
            <GoPlayground
              code={code}
              theme={{
                palette: {
                  primary: {
                    main: orange[500],
                  },
                },
                overrides: {
                  MuiButton: {
                    root: {
                      borderRadius: '20px !important',
                    },
                  },
                },
              }}
            />
          </Grid>
          <Grid item sm={6} xs={12}>
            <GoPlayground
              code={code}
              color="light"
              useTextOnButton={false}
              hideFormat
              theme={{
                palette: {
                  primary: {
                    main: green[500],
                  },
                  secondary: {
                    main: orange[500],
                  },
                },
                typography: {
                  fontFamily: 'monospace',
                },
                overrides: {
                  MuiButton: {
                    root: {
                      borderRadius: '20px !important',
                    },
                  },
                },
              }}
            />
          </Grid>
          <Grid item sm={6} xs={12}>
            <GoPlayground
              code={codeError}
              useTextOnButton={false}
              showFormat={false}
              title="With error"
            />
          </Grid>
          <Grid item sm={6} xs={12}>
            <GoPlayground
              code={codeImports}
              useTextOnButton={false}
              showFormat={false}
              title="Imports"
            />
          </Grid>
          <Grid item sm={6} xs={12}>
            <GoPlayground
              code={code}
              readOnly
              hideFormat
              useTextOnButton={false}
              showFormat={false}
              title="Readonly"
            />
          </Grid>
          <Grid item sm={6} xs={12}>
            <GoPlayground
              code={code}
              color="light"
              hideFormat
              toolBarStyle={{
                padding: 0,
              }}
              settingsIconStyle={{
                color: '#aaa',
              }}
              title={(
                <img
                  src="https://golang.org/lib/godoc/images/go-logo-blue.svg"
                  height={33}
                  style={{
                    position: 'relative', top: 3, marginRight: 16, left: 12
                  }}
                />
              )}
              theme={{
                palette: {
                  primary: {
                    main: '#fff',
                  },
                },
              }}
            />
          </Grid>
          <Grid item sm={6} xs={12}>
            <GoPlayground
              code={codeLongOutput}
              hideFormat
              editorHeight={150}
              resultHeight={80}
              useTextOnButton
              title={(
                <span>
                Editor height 150px
                  <br />
                Result height 80px
                </span>
              )}
            />
          </Grid>
          <Grid item sm={6} xs={12}>
            <GoPlayground
              code={code}
              hideHeader
            />
          </Grid>
          <Grid item sm={6} xs={12}>
            <GoPlayground
              code={code}
              hideHeader
              readOnly
              resultHeight={0}
            />
          </Grid>
          <Grid item sm={6} xs={12}>
            <GoPlayground
              title="Test fail"
              code={codeTestFail}
            />
          </Grid>
          <Grid item sm={6} xs={12}>
            <GoPlayground
              title="Test success"
              code={codeTestSuccess}
            />
          </Grid>

        </Grid>
      </div>
    </MuiThemeProvider>
  );
}

render(
  <App />,
  document.getElementById('root'),
);

import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Build from '@material-ui/icons/Build';
import Paper from '@material-ui/core/Paper';
import ResultIcon from './ResultIcon';
import { ServerResponse } from './prop-types/server';

const useStyles = makeStyles((theme) => ({
  success: {
    lineHeight: 1.2,
    display: 'flex',
    alignItems: 'flex-start',
    fontFamily: theme.typography.fontFamily,
    background: theme.palette.background.paper,
    padding: theme.spacing(1 / 2),
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.text.primary,
    fontSize: '0.9rem',
  },

  delay: {
    opacity: 0.5,
    textAlign: 'right',
    fontSize: '0.7rem',
    display: 'inline-block',
    marginLeft: theme.spacing(1 / 2),
    fontFamily: 'monospace',
  },
  buildResult: {
    fontSize: '0.8rem',
    opacity: 0.6,
  },
  successText: {
    paddingTop: 12,
    width: '100%',
    overflow: 'scroll',
  },
  pre: {
    margin: 0,
    fontSize: '0.8rem',
  },
}));


function formatDelay(delay) {
  return `+${delay}ms`;
}

export default function Result({ result, loading, resultHeight, expect }) {
  const classes = useStyles();

  const { Events, IsTest, TestsFailed, Status } = result;

  if (!Events) {
    if (!resultHeight || Events === null) return null;

    return (
      <Paper className={classes.success}>
        <div className={classes.successText} style={{ height: resultHeight || 'auto' }} />
      </Paper>
    );
  }
  let gotExpected = true
  let tmp = "";
  if (!IsTest && expect != null) {
    Events.forEach(({ Message }) => {
      tmp += Message;
    })
    if (tmp != expect) {
      gotExpected = false;
    }
  }

  return (
    <Paper className={classes.success} style={{ opacity: loading ? 0.5 : 1 }}>
      {
        !IsTest && (Status != 0 || !gotExpected) ? <ResultIcon success={false} color={'red'} /> :
          <ResultIcon icon={Status == 0 && IsTest && <Build />} success={!TestsFailed} color={TestsFailed ? 'red' : ' green'} />
      }
      <div className={classes.successText} style={{ height: resultHeight || 'auto', maxHeight: resultHeight || 'auto' }}>
        {Events.map(({ Message, Delay }, i) => {
          if (IsTest) {
            return (
              <div key={i + Message}>
                {Message.split('\n').map((l) => <pre key={l} className={classes.pre}>{l}</pre>)}
              </div>
            );
          }
          return (
            <div key={Message}>
              {Message}
              <span className={classes.delay}>{Delay ? formatDelay(Delay) : null}</span>
            </div>
          );
        })}
        {!gotExpected ?
          <div>
            <h3>Expected Result</h3>

            <div key={expect}>
              {expect}
            </div>
          </div> : null
        }
        <pre className={classes.buildResult}>Program exited.</pre>
      </div>
    </Paper>
  );
}

Result.propTypes = {
  result: ServerResponse.isRequired,
  loading: PropTypes.bool,
  resultHeight: PropTypes.number,
};

Result.defaultProps = {
  loading: false,
  resultHeight: 0,
};

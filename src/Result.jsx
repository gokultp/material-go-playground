import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Paper from '@material-ui/core/Paper';
import ResultIcon from './ResultIcon';

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


export default function Result({ result, loading, resultHeight }) {
  const classes = useStyles();

  const { Events, IsTest } = result;

  if (!Events) {
    if (!resultHeight || Events === null) return null;

    return (
      <Paper className={classes.success}>
        <div className={classes.successText} style={{ height: resultHeight || 'auto' }} />
      </Paper>
    );
  }

  return (
    <Paper className={classes.success} style={{ opacity: loading ? 0.5 : 1 }}>
      <ResultIcon sucess />
      <div className={classes.successText} style={{ height: resultHeight || 'auto', maxHeight: resultHeight || 'auto' }}>
        {Events.map(({ Message, Delay }, i) => {
          if (IsTest) {
            return (
              <div key={i}>
                {Message.split('\n').map((l, i) => <pre key={i} className={classes.pre}>{l}</pre>)}
              </div>
            );
          }

          return (
            <div key={i}>
              {Message}
              <span className={classes.delay}>{Delay ? formatDelay(Delay) : null}</span>
            </div>
          );
        })}
        <pre className={classes.buildResult}>Program exited.</pre>
      </div>
    </Paper>
  );
}

function formatDelay(delay) {
  return `+${delay}ms`;
}
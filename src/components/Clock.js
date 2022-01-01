import React from "react";

class Clock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      session_duration: 25 * 60,
      break_duration: 5 * 60,
      current_type: "SESSION",
      current_time: 0,
      running: false,
      paused: false,
      paused_time: 0,
      timerID: null,
    };
    this.countDown = this.countDown.bind(this);
    this.mns = this.mns.bind(this);
    this.m = this.m.bind(this);
    this.handlePlay = this.handlePlay.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleSessionIncrement = this.handleSessionIncrement.bind(this);
    this.handleSessionDecrement = this.handleSessionDecrement.bind(this);
    this.handleBreakIncrement = this.handleBreakIncrement.bind(this);
    this.handleBreakDecrement = this.handleBreakDecrement.bind(this);
  }

  countDown(time) {
    let start = Date.now();
    let timer = () => {
      this.setState({
        current_time: time - (((Date.now() - start) / 1000) | 0),
      });
    };
    this.setState({ timerID: setInterval(timer, 1000) });
  }

  componentDidUpdate() {
    if (
      this.state.current_time === 0 &&
      this.state.running &&
      !this.state.paused
    ) {
      this.audioPlay();
    }

    if (
      this.state.current_type === "SESSION" &&
      this.state.current_time < 0 &&
      this.state.running &&
      !this.state.paused
    ) {
      clearInterval(this.state.timerID);
      this.setState(
        {
          current_type: "BREAK",
          current_time: this.state.break_duration,
          timerID: null,
        },
        () => this.countDown(this.state.current_time)
      );
    } else if (
      this.state.current_type === "BREAK" &&
      this.state.current_time < 0 &&
      this.state.running &&
      !this.state.paused
    ) {
      clearInterval(this.state.timerID);
      this.setState(
        {
          current_type: "SESSION",
          current_time: this.state.session_duration,
          timerID: null,
        },
        () => this.countDown(this.state.current_time)
      );
    }
  }

  mns(time) {
    let min = (time / 60) | 0;
    let sec = time % 60 | 0;

    min = min < 10 ? "0" + min : min;
    sec = sec < 10 ? "0" + sec : sec;

    return `${min}:${sec}`;
  }

  m(time) {
    let min = (time / 60) | 0;

    return `${min}`;
  }

  handlePlay() {
    if (!this.state.running && this.state.paused) {
      this.setState({
        running: !this.state.running,
        paused: !this.state.paused,
      });
    }
    if (!this.state.running && !this.state.paused) {
      this.setState(
        {
          current_time: this.state.session_duration,
          running: !this.state.running,
        },
        () => this.countDown(this.state.current_time)
      );
    } else if (this.state.running && !this.state.paused) {
      this.setState(
        {
          paused_time: this.state.current_time,
          current_time: 0,
          paused: !this.state.paused,
        },
        () => {
          clearInterval(this.state.timerID);
          this.setState({
            timerID: null,
          });
        }
      );
    } else if (this.state.running && this.state.paused) {
      this.setState(
        {
          current_time: this.state.paused_time,
          paused_time: 0,
          paused: !this.state.paused,
        },
        () => this.countDown(this.state.current_time)
      );
    }
  }

  handleSessionIncrement() {
    if (this.state.session_duration < 60 * 60) {
      this.setState((state) => ({
        session_duration: state.session_duration + 60,
      }));
    }
  }

  handleSessionDecrement() {
    if (this.state.session_duration > 60) {
      this.setState((state) => ({
        session_duration: state.session_duration - 60,
      }));
    }
  }

  handleBreakIncrement() {
    if (this.state.break_duration < 60 * 60) {
      this.setState((state) => ({
        break_duration: state.break_duration + 60,
      }));
    }
  }

  handleBreakDecrement() {
    if (this.state.break_duration > 60) {
      this.setState((state) => ({
        break_duration: state.break_duration - 60,
      }));
    }
  }

  handleReset() {
    clearInterval(this.state.timerID);
    this.audioStop();
    this.setState({
      session_duration: 25 * 60,
      break_duration: 5 * 60,
      current_type: "SESSION",
      current_time: 0,
      running: false,
      paused: false,
      paused_time: 0,
      timerID: null,
    });
  }

  audioPlay() {
    let a = document.getElementById("beep");
    a.play();
  }

  audioStop() {
    let a = document.getElementById("beep");
    a.pause();
    a.currentTime = 0;
  }

  ringStyleSession = {
    border: "0.5rem #37aa9c solid",
  };

  ringStyleBreak = {
    border: "0.5rem #aa3737 solid",
  };

  textStyleSession = {
    color: "#37aa9c",
  };

  textStyleBreak = {
    color: "#aa3737",
  };

  render() {
    return (
      <div id="wrapper">
        <div id="body">
          <div id="break-duration-wrapper" className="control-wrapper">
            <span
              className="material-icons arrow-button"
              id="break-increment"
              onClick={this.handleBreakIncrement}
            >
              expand_less
            </span>
            <div id="break-label">BREAK</div>
            <div id="break-length">{this.m(this.state.break_duration)}</div>
            <span
              className="material-icons arrow-button"
              id="break-decrement"
              onClick={this.handleBreakDecrement}
            >
              expand_more
            </span>
          </div>

          <div id="session-duration-wrapper" className="control-wrapper">
            <span
              className="material-icons arrow-button"
              id="session-increment"
              onClick={this.handleSessionIncrement}
            >
              expand_less
            </span>
            <div id="session-label">SESSION</div>
            <div id="session-length">{this.m(this.state.session_duration)}</div>
            <span
              className="material-icons arrow-button"
              id="session-decrement"
              onClick={this.handleSessionDecrement}
            >
              expand_more
            </span>
          </div>

          <div
            id="timer-label-wrapper"
            style={
              this.state.current_type === "SESSION"
                ? this.ringStyleSession
                : this.ringStyleBreak
            }
          >
            <div id="timer-label">{this.state.current_type}</div>
            <div
              id="time-left"
              style={
                this.state.current_type === "SESSION"
                  ? this.textStyleSession
                  : this.textStyleBreak
              }
            >
              {this.state.running && this.state.paused
                ? this.mns(this.state.paused_time)
                : this.state.current_time === 0 && !this.state.running
                ? this.mns(this.state.session_duration)
                : this.mns(this.state.current_time)}
            </div>
          </div>

          <div id="start_stop-wrapper" className="control-wrapper">
            <div id="start_stop" onClick={this.handlePlay}>
              {this.state.running && !this.state.paused ? (
                <span className="material-icons pause control">pause</span>
              ) : (
                <span className="material-icons play control">play_arrow</span>
              )}
            </div>
          </div>

          <div id="reset-wrapper" className="control-wrapper">
            <div id="reset" onClick={this.handleReset}>
              <span className="material-icons stop control">stop</span>
            </div>
          </div>
        </div>

        <audio
          id="beep"
          preload="auto"
          src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav"
        ></audio>
      </div>
    );
  }
}

export default Clock;

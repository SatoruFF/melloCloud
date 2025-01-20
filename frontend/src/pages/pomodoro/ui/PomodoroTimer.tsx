import { useState, useEffect } from 'react';
import useSound from 'use-sound';

import Header from '../../../features/pomodoro/ui/Header';
import Controls from '../../../features/pomodoro/ui/Controls';
import TimerDisplay from '../../../features/pomodoro/ui/TimerDisplay';
import Button from '../../../features/pomodoro/ui/Button';
import Settings from '../../../features/pomodoro/ui/Settings';

import timesUpSfx from '../assets/timesUp.mp3';
import styles from '../style/pomodoro.module.scss';
import cn from 'classnames';

function PomodoroTimer() {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [timerMode, setTimerMode] = useState('pomo'); // options: pomo, short, long
  const [pomoLength, setPomoLength] = useState(25);
  const [shortLength, setShortLength] = useState(3);
  const [longLength, setLongLength] = useState(15);
  const [fontPref, setFontPref] = useState('kumbh'); // options: kumbh, roboto, space
  const [accentColor, setAccentColor] = useState('default'); // options: default, blue, purple
  const [secondsLeft, setSecondsLeft] = useState(pomoLength * 60);
  const [isActive, setIsActive] = useState(false);
  const [buttonText, setButtonText] = useState('START');

  const [volume, setVolume] = useState(1);
  const [timesUp] = useSound(timesUpSfx, {
    volume: volume,
  });

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setSecondsLeft(secondsLeft => secondsLeft - 1);
      }, 1000);

      if (secondsLeft === 0) {
        clearInterval(interval);
        setIsActive(false);
        setButtonText('');
        timesUp();
      }

      return () => clearInterval(interval);
    }
  }, [isActive, secondsLeft, timesUp]);

  const toggleSettingsVisibility = () => {
    setSettingsVisible(!settingsVisible);
  };

  const formatTimeLeft = seconds => {
    return `${Math.floor(seconds / 60)}:${seconds % 60 > 9 ? seconds % 60 : '0' + (seconds % 60)}`;
  };

  const calcPercentage = () => {
    if (timerMode === 'pomo') {
      return (secondsLeft / (pomoLength * 60)) * 100;
    }
    if (timerMode === 'short') {
      return (secondsLeft / (shortLength * 60)) * 100;
    }
    if (timerMode === 'long') {
      return (secondsLeft / (longLength * 60)) * 100;
    }
  };

  return (
    <div className={cn(styles.pomodoroTimerWrapper)}>
      <div className="pomodoro-content-max">
        <Header title="pomodoro" />
        <Controls
          timerMode={timerMode}
          setTimerMode={setTimerMode}
          setSecondsLeft={setSecondsLeft}
          pomoLength={pomoLength}
          shortLength={shortLength}
          longLength={longLength}
          setIsActive={setIsActive}
          buttonText={buttonText}
          setButtonText={setButtonText}
          volume={volume}
        />
        <TimerDisplay
          timerMode={timerMode}
          percentage={calcPercentage()}
          timeLeft={formatTimeLeft(secondsLeft)}
          isActive={isActive}
          setIsActive={setIsActive}
          buttonText={buttonText}
          setButtonText={setButtonText}
          volume={volume}
          setVolume={setVolume}
        />
        <Button type="settings" toggleVisibility={toggleSettingsVisibility} />
        <Settings
          visible={settingsVisible}
          toggleSettingsVisibility={toggleSettingsVisibility}
          pomoLength={pomoLength}
          setPomoLength={setPomoLength}
          shortLength={shortLength}
          setShortLength={setShortLength}
          longLength={longLength}
          setLongLength={setLongLength}
          fontPref={fontPref}
          setFontPref={setFontPref}
          accentColor={accentColor}
          setAccentColor={setAccentColor}
          closeSettings={toggleSettingsVisibility}
          setSecondsLeft={setSecondsLeft}
          timerMode={timerMode}
        />
      </div>
    </div>
  );
}

export default PomodoroTimer;

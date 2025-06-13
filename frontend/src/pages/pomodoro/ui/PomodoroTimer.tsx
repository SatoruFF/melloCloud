import { useState, useEffect } from "react";
import { Modal, InputNumber, Button as AntButton } from "antd";
import { Settings } from "lucide-react";
import useSound from "use-sound";
import { useTranslation } from "react-i18next";
import styles from "./pomodoro.module.scss";

import startSound from "../../../shared/assets/startTimer.mp3";
import pauseSound from "../../../shared/assets/pauseTimer.mp3";
import timesUpSound from "../../../shared/assets/timesUp.mp3";
import slideSound from "../../../shared/assets/slide.mp3";

const formatTime = (seconds: number) => {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
};

const Pomodoro = () => {
  const { t } = useTranslation();

  const [workDuration, setWorkDuration] = useState(25 * 60);
  const [breakDuration, setBreakDuration] = useState(5 * 60);
  const [longBreakDuration, setLongBreakDuration] = useState(15 * 60);
  const [cyclesBeforeLongBreak, setCyclesBeforeLongBreak] = useState(4);

  const [timeLeft, setTimeLeft] = useState(workDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [cycleCount, setCycleCount] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);

  const [playStart] = useSound(startSound);
  const [playPause] = useSound(pauseSound);
  const [playTimesUp] = useSound(timesUpSound);
  const [playSlide] = useSound(slideSound);

  const totalTime = isWorkSession
    ? workDuration
    : cycleCount % cyclesBeforeLongBreak === 0
      ? longBreakDuration
      : breakDuration;

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          playTimesUp();
          playSlide();

          const nextIsWork = !isWorkSession;
          setIsWorkSession(nextIsWork);

          if (nextIsWork) {
            return workDuration;
          } else {
            const nextCycle = cycleCount + 1;
            setCycleCount(nextCycle);
            return nextCycle % cyclesBeforeLongBreak === 0 ? longBreakDuration : breakDuration;
          }
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isWorkSession, cycleCount, workDuration, breakDuration, longBreakDuration]);

  useEffect(() => {
    if (!isRunning) {
      if (isWorkSession) {
        setTimeLeft(workDuration);
      } else {
        const isLongBreak = cycleCount % cyclesBeforeLongBreak === 0;
        setTimeLeft(isLongBreak ? longBreakDuration : breakDuration);
      }
    }
  }, [workDuration, breakDuration, longBreakDuration, cyclesBeforeLongBreak, isWorkSession, isRunning]);

  const handleStartPause = () => {
    setIsRunning((prev) => {
      prev ? playPause() : playStart();
      return !prev;
    });
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(isWorkSession ? workDuration : breakDuration);
    playSlide();
  };

  return (
    <div className={`${styles.pomodoro} animate__animated animate__fadeIn`}>
      <h1 className={styles.title}>{t("pomodoro.title")}</h1>

      {/* Прогресс бар */}
      <div className={styles.progressWrapper}>
        <div
          className={styles.progress}
          style={{
            width: `${((totalTime - timeLeft) / totalTime) * 100}%`,
          }}
        />
      </div>

      <div className={styles.timer}>{formatTime(timeLeft)}</div>
      <div className={styles.status}>
        {isWorkSession
          ? t("pomodoro.workTime")
          : cycleCount % cyclesBeforeLongBreak === 0
            ? t("pomodoro.longBreak")
            : t("pomodoro.shortBreak")}
      </div>

      <div className={styles.controls}>
        <button onClick={handleStartPause}>{isRunning ? t("pomodoro.pause") : t("pomodoro.start")}</button>
        <button onClick={handleReset}>{t("pomodoro.reset")}</button>
        <button onClick={() => setModalOpen(true)}>
          <Settings size={18} />
        </button>
      </div>

      <Modal
        title={t("pomodoro.settings")}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        className={styles.customModal}
        centered
      >
        <div className={styles.settings}>
          <label>
            {t("pomodoro.workMinutes")}:
            <InputNumber min={1} value={workDuration / 60} onChange={(val) => setWorkDuration((val || 1) * 60)} />
          </label>
          <label>
            {t("pomodoro.breakMinutes")}:
            <InputNumber min={1} value={breakDuration / 60} onChange={(val) => setBreakDuration((val || 1) * 60)} />
          </label>
          <label>
            {t("pomodoro.longBreakMinutes")}:
            <InputNumber
              min={1}
              value={longBreakDuration / 60}
              onChange={(val) => setLongBreakDuration((val || 1) * 60)}
            />
          </label>
          <label>
            {t("pomodoro.cyclesBeforeLongBreak")}:
            <InputNumber min={1} value={cyclesBeforeLongBreak} onChange={(val) => setCyclesBeforeLongBreak(val || 1)} />
          </label>
        </div>
      </Modal>
    </div>
  );
};

export default Pomodoro;

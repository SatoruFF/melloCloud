import { useSearchParams } from "react-router-dom";
import { useCallback } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { useTranslation } from "react-i18next";
import styles from "./video-call.module.scss";

const JITSI_DOMAIN = "meet.jit.si";

const VideoCall = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const room = searchParams.get("room");
  const displayName = searchParams.get("displayName") || t("chats.videoCall.guest");

  const handleReadyToClose = useCallback(() => {
    window.close();
  }, []);

  if (!room || !room.trim()) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.error}>
          <p>{t("chats.videoCall.noRoom")}</p>
          <p className={styles.hint}>{t("chats.videoCall.hint")}</p>
        </div>
      </div>
    );
  }

  const roomName = room.replace(/[^a-zA-Z0-9-_]/g, "") || "mellocloud-call";

  return (
    <div className={styles.wrapper}>
      <JitsiMeeting
        domain={JITSI_DOMAIN}
        roomName={roomName}
        userInfo={{
          displayName,
        }}
        configOverwrite={{
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          enableWelcomePage: false,
          prejoinPageEnabled: true,
          disableDeepLinking: true,
        }}
        interfaceConfigOverwrite={{
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          TOOLBAR_BUTTONS: [
            "microphone",
            "camera",
            "closedcaptions",
            "desktop",
            "fullscreen",
            "fodeviceselection",
            "hangup",
            "profile",
            "chat",
            "recording",
            "livestreaming",
            "etherpad",
            "sharedvideo",
            "settings",
            "raisehand",
            "videoquality",
            "filmstrip",
            "invite",
            "feedback",
            "stats",
            "shortcuts",
            "tileview",
            "select-background",
            "mute-everyone",
            "security",
          ],
        }}
        getIFrameRef={(iframeRef) => {
          if (iframeRef) {
            iframeRef.style.height = "100%";
            iframeRef.style.width = "100%";
          }
        }}
        onReadyToClose={handleReadyToClose}
      />
    </div>
  );
};

export default VideoCall;

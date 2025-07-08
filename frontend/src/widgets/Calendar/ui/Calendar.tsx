import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import multiMonthPlugin from "@fullcalendar/multimonth";
import * as Dialog from "@radix-ui/react-dialog";
import styles from "./calendar.module.scss";

export default function Calendar() {
  const [selectedEvent, setSelectedEvent] = useState<{
    title: string;
    start: Date;
    end: Date;
  } | null>(null);

  return (
    <div className={styles.calendarWrapper}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, multiMonthPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          start: "prev,next today",
          center: "title",
          end: "dayGridMonth,timeGridWeek,timeGridDay,listWeek,multiMonthYear",
        }}
        editable
        selectable
        nowIndicator
        eventClick={(info) => {
          setSelectedEvent({
            title: info.event.title,
            start: info.event.start || new Date(),
            end: info.event.end || new Date(),
          });
        }}
        events={[
          {
            title: "💼 Встреча с клиентом",
            start: new Date().toISOString(),
            end: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          },
          {
            title: "📞 Zoom-call с командой",
            start: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            end: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
          },
        ]}
      />

      <Dialog.Root open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.overlay} />
          <Dialog.Content className={styles.modal}>
            {selectedEvent && (
              <div className={styles.card}>
                <h2>{selectedEvent.title}</h2>
                <p>
                  <b>Начало:</b> {selectedEvent.start.toLocaleString("ru-RU")}
                </p>
                <p>
                  <b>Окончание:</b> {selectedEvent.end.toLocaleString("ru-RU")}
                </p>
              </div>
            )}
            <Dialog.Close className={styles.closeButton}>✖</Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

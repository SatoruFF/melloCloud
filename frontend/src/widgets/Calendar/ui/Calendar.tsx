import React, { useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import multiMonthPlugin from "@fullcalendar/multimonth";
import * as Dialog from "@radix-ui/react-dialog";
import { Calendar as CalendarIcon, Clock, MapPin, Users, Tag, X } from "lucide-react";
import styles from "./calendar.module.scss";

interface EventData {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  attendees?: string[];
  color?: string;
  category?: string;
}

export default function Calendar() {
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const calendarRef = useRef<any>(null);

  const sampleEvents = [
    {
      id: "1",
      title: "Встреча с клиентом",
      start: new Date().toISOString(),
      end: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      description: "Обсуждение нового проекта и бюджета",
      location: "Офис, комната переговоров А",
      attendees: ["Алексей", "Мария", "Иван"],
      color: "#1890ff",
      category: "Встреча",
    },
    {
      id: "2",
      title: "Zoom-call с командой",
      start: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      end: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      description: "Еженедельный синк по проектам",
      location: "Zoom",
      attendees: ["Команда разработки"],
      color: "#52c41a",
      category: "Онлайн",
    },
    {
      id: "3",
      title: "Дедлайн по проекту",
      start: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
      description: "Финальная сдача MVP клиенту",
      color: "#ff4d4f",
      category: "Дедлайн",
    },
    {
      id: "4",
      title: "Кофе-брейк с коллегой",
      start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 1800000).toISOString(),
      description: "Неформальная встреча",
      location: "Кафе рядом с офисом",
      color: "#faad14",
      category: "Личное",
    },
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className={styles.calendarWrapper}>
      <div className={styles.calendarContainer}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, multiMonthPlugin]}
          initialView="multiMonthYear"
          headerToolbar={{
            start: "prev,next today",
            center: "title",
            end: "multiMonthYear,dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
          buttonText={{
            today: "Сегодня",
            month: "Месяц",
            week: "Неделя",
            day: "День",
            list: "Список",
            multiMonthYear: "Год",
          }}
          locale="ru"
          editable
          selectable
          selectMirror
          dayMaxEvents={2}
          nowIndicator
          height="auto"
          eventClick={(info) => {
            const event = sampleEvents.find((e) => e.id === info.event.id);
            if (event) {
              setSelectedEvent({
                ...event,
                start: info.event.start || new Date(),
                end: info.event.end || new Date(),
              });
            }
          }}
          eventContent={(arg) => {
            return (
              <div className={styles.eventContent}>
                <span className={styles.eventTitle}>{arg.event.title}</span>
                {arg.view.type.includes("time") && (
                  <span className={styles.eventTime}>{formatTime(arg.event.start!)}</span>
                )}
              </div>
            );
          }}
          events={sampleEvents}
          multiMonthMinWidth={360}
          multiMonthMaxColumns={3}
          fixedWeekCount={false}
        />
      </div>

      {/* Event Details Modal */}
      <Dialog.Root open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.overlay} />
          <Dialog.Content className={styles.modal}>
            {selectedEvent && (
              <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                  <div className={styles.headerTop}>
                    <h2 className={styles.modalTitle}>{selectedEvent.title}</h2>
                    <Dialog.Close asChild>
                      <button className={styles.closeButton}>
                        <X size={18} />
                      </button>
                    </Dialog.Close>
                  </div>
                  {selectedEvent.category && (
                    <span className={styles.categoryBadge} style={{ borderColor: selectedEvent.color }}>
                      <Tag size={12} />
                      {selectedEvent.category}
                    </span>
                  )}
                </div>

                <div className={styles.modalBody}>
                  <div className={styles.detailRow}>
                    <CalendarIcon size={16} className={styles.icon} />
                    <div className={styles.detailContent}>
                      <span className={styles.detailLabel}>Дата</span>
                      <span className={styles.detailValue}>{formatDate(selectedEvent.start)}</span>
                    </div>
                  </div>

                  <div className={styles.detailRow}>
                    <Clock size={16} className={styles.icon} />
                    <div className={styles.detailContent}>
                      <span className={styles.detailLabel}>Время</span>
                      <span className={styles.detailValue}>
                        {formatTime(selectedEvent.start)} - {formatTime(selectedEvent.end)}
                      </span>
                    </div>
                  </div>

                  {selectedEvent.location && (
                    <div className={styles.detailRow}>
                      <MapPin size={16} className={styles.icon} />
                      <div className={styles.detailContent}>
                        <span className={styles.detailLabel}>Место</span>
                        <span className={styles.detailValue}>{selectedEvent.location}</span>
                      </div>
                    </div>
                  )}

                  {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                    <div className={styles.detailRow}>
                      <Users size={16} className={styles.icon} />
                      <div className={styles.detailContent}>
                        <span className={styles.detailLabel}>Участники</span>
                        <div className={styles.attendeesList}>
                          {selectedEvent.attendees.map((attendee, idx) => (
                            <span key={idx} className={styles.attendeeBadge}>
                              {attendee}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedEvent.description && (
                    <div className={styles.descriptionBlock}>
                      <span className={styles.detailLabel}>Описание</span>
                      <p className={styles.description}>{selectedEvent.description}</p>
                    </div>
                  )}
                </div>

                <div className={styles.modalFooter}>
                  <button className={styles.secondaryButton}>Отменить</button>
                  <button className={styles.primaryButton}>Редактировать</button>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

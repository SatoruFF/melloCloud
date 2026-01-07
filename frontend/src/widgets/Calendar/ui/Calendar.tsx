import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import type { EventClickArg, DateSelectArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import multiMonthPlugin from "@fullcalendar/multimonth";
import * as Dialog from "@radix-ui/react-dialog";
import { Calendar as CalendarIcon, Clock, MapPin, Users, Tag, X, Edit2, Trash2, Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import { useTranslation } from "react-i18next";
import styles from "./calendar.module.scss";
import {
  useGetEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} from "../../../entities/event";
import {
  getEventsSelector,
  setEvents,
  addEvent as addEventToStore,
  updateEvent as updateEventInStore,
  removeEvent as removeEventFromStore,
} from "../../../entities/event";

interface EventData {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  attendees?: any[];
  color?: string;
  category?: string;
  allDay?: boolean;
}

interface EventFormData {
  title: string;
  description: string;
  location: string;
  color: string;
  category: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  allDay: boolean;
}

export default function Calendar() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const calendarRef = useRef<FullCalendar>(null);

  // RTK Query
  const { data: eventsData, isLoading, refetch } = useGetEventsQuery();
  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();

  // Local state
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    location: "",
    color: "#1890ff",
    category: "",
    startDate: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endDate: new Date().toISOString().split("T")[0],
    endTime: "10:00",
    allDay: false,
  });

  // Redux state
  const events = useSelector(getEventsSelector);

  // Sync events to Redux
  useEffect(() => {
    if (eventsData) {
      dispatch(setEvents(eventsData));
    }
  }, [eventsData, dispatch]);

  // Format events for FullCalendar
  const calendarEvents = events.map((event) => ({
    id: event.id.toString(),
    title: event.title,
    start: event.startDate,
    end: event.endDate,
    backgroundColor: event.color,
    borderColor: event.color,
    allDay: event.allDay,
    extendedProps: {
      description: event.description,
      location: event.location,
      category: event.category,
      attendees: event.attendees,
    },
  }));

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

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      color: "#1890ff",
      category: "",
      startDate: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endDate: new Date().toISOString().split("T")[0],
      endTime: "10:00",
      allDay: false,
    });
    setIsEditing(false);
  };

  const handleCreateEvent = async () => {
    if (!formData.title.trim()) {
      message.error(t("planner.events.errors.titleRequired"));
      return;
    }

    try {
      const startDateTime = formData.allDay
        ? new Date(formData.startDate).toISOString()
        : new Date(`${formData.startDate}T${formData.startTime}`).toISOString();

      const endDateTime = formData.allDay
        ? new Date(formData.endDate).toISOString()
        : new Date(`${formData.endDate}T${formData.endTime}`).toISOString();

      const result = await createEvent({
        title: formData.title,
        description: formData.description || undefined,
        location: formData.location || undefined,
        color: formData.color,
        category: formData.category || undefined,
        startDate: startDateTime,
        endDate: endDateTime,
        allDay: formData.allDay,
      }).unwrap();

      dispatch(addEventToStore(result));
      message.success(t("planner.events.messages.created"));
      setIsFormOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || t("planner.events.errors.createFailed"));
    }
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent || !formData.title.trim()) {
      message.error(t("planner.events.errors.titleRequired"));
      return;
    }

    try {
      const startDateTime = formData.allDay
        ? new Date(formData.startDate).toISOString()
        : new Date(`${formData.startDate}T${formData.startTime}`).toISOString();

      const endDateTime = formData.allDay
        ? new Date(formData.endDate).toISOString()
        : new Date(`${formData.endDate}T${formData.endTime}`).toISOString();

      const result = await updateEvent({
        eventId: selectedEvent.id,
        title: formData.title,
        description: formData.description || undefined,
        location: formData.location || undefined,
        color: formData.color,
        category: formData.category || undefined,
        startDate: startDateTime,
        endDate: endDateTime,
        allDay: formData.allDay,
      }).unwrap();

      dispatch(updateEventInStore(result));
      message.success(t("planner.events.messages.updated"));
      setIsFormOpen(false);
      setSelectedEvent(null);
      resetForm();
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || t("planner.events.errors.updateFailed"));
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      await deleteEvent(selectedEvent.id).unwrap();
      dispatch(removeEventFromStore(Number(selectedEvent.id)));
      message.success(t("planner.events.messages.deleted"));
      setSelectedEvent(null);
      refetch();
    } catch (error: any) {
      message.error(error?.data?.message || t("planner.events.errors.deleteFailed"));
    }
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = events.find((e) => e.id.toString() === clickInfo.event.id);
    if (event) {
      setSelectedEvent({
        id: event.id.toString(),
        title: event.title,
        start: new Date(event.startDate),
        end: new Date(event.endDate),
        description: event.description,
        location: event.location,
        category: event.category,
        color: event.color,
        attendees: event.attendees,
        allDay: event.allDay,
      });
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const start = selectInfo.start;
    const end = selectInfo.end;

    setFormData({
      ...formData,
      startDate: start.toISOString().split("T")[0],
      startTime: start.toTimeString().slice(0, 5),
      endDate: end.toISOString().split("T")[0],
      endTime: end.toTimeString().slice(0, 5),
      allDay: selectInfo.allDay,
    });
    setIsFormOpen(true);
  };

  const handleEditClick = () => {
    if (!selectedEvent) return;

    setFormData({
      title: selectedEvent.title,
      description: selectedEvent.description || "",
      location: selectedEvent.location || "",
      color: selectedEvent.color || "#1890ff",
      category: selectedEvent.category || "",
      startDate: new Date(selectedEvent.start).toISOString().split("T")[0],
      startTime: new Date(selectedEvent.start).toTimeString().slice(0, 5),
      endDate: new Date(selectedEvent.end).toISOString().split("T")[0],
      endTime: new Date(selectedEvent.end).toTimeString().slice(0, 5),
      allDay: selectedEvent.allDay || false,
    });
    setIsEditing(true);
    setIsFormOpen(true);
    setSelectedEvent(null);
  };

  const handleFormChange = (field: keyof EventFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className={styles.calendarWrapper}>
        <div className={styles.loadingState}>{t("planner.events.loading")}</div>
      </div>
    );
  }

  return (
    <div className={styles.calendarWrapper}>
      <div className={styles.calendarHeader}>
        <h1 className={styles.pageTitle}>{t("planner.events.title")}</h1>
        <button
          className={styles.createButton}
          onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}
        >
          <Plus size={16} />
          {t("planner.events.actions.create")}
        </button>
      </div>

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
            today: t("planner.events.views.today"),
            month: t("planner.events.views.month"),
            week: t("planner.events.views.week"),
            day: t("planner.events.views.day"),
            list: t("planner.events.views.list"),
            multiMonthYear: t("planner.events.views.year"),
          }}
          locale="ru"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={2}
          nowIndicator={true}
          height="auto"
          eventClick={handleEventClick}
          select={handleDateSelect}
          eventContent={(arg) => {
            return (
              <div className={styles.eventContent}>
                <span className={styles.eventTitle}>{arg.event.title}</span>
                {arg.view.type.includes("time") && arg.event.start && (
                  <span className={styles.eventTime}>{formatTime(arg.event.start)}</span>
                )}
              </div>
            );
          }}
          events={calendarEvents}
          multiMonthMinWidth={360}
          multiMonthMaxColumns={3}
          fixedWeekCount={false}
        />
      </div>

      {/* Event Details Modal */}
      <Dialog.Root open={!!selectedEvent && !isFormOpen} onOpenChange={() => setSelectedEvent(null)}>
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
                      <span className={styles.detailLabel}>{t("planner.events.fields.date")}</span>
                      <span className={styles.detailValue}>{formatDate(selectedEvent.start)}</span>
                    </div>
                  </div>

                  <div className={styles.detailRow}>
                    <Clock size={16} className={styles.icon} />
                    <div className={styles.detailContent}>
                      <span className={styles.detailLabel}>{t("planner.events.fields.time")}</span>
                      <span className={styles.detailValue}>
                        {formatTime(selectedEvent.start)} - {formatTime(selectedEvent.end)}
                      </span>
                    </div>
                  </div>

                  {selectedEvent.location && (
                    <div className={styles.detailRow}>
                      <MapPin size={16} className={styles.icon} />
                      <div className={styles.detailContent}>
                        <span className={styles.detailLabel}>{t("planner.events.fields.location")}</span>
                        <span className={styles.detailValue}>{selectedEvent.location}</span>
                      </div>
                    </div>
                  )}

                  {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                    <div className={styles.detailRow}>
                      <Users size={16} className={styles.icon} />
                      <div className={styles.detailContent}>
                        <span className={styles.detailLabel}>{t("planner.events.fields.attendees")}</span>
                        <div className={styles.attendeesList}>
                          {selectedEvent.attendees.map((attendee: any, idx: number) => (
                            <span key={idx} className={styles.attendeeBadge}>
                              {attendee.user?.userName || attendee.user?.email || t("planner.events.fields.attendee")}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedEvent.description && (
                    <div className={styles.descriptionBlock}>
                      <span className={styles.detailLabel}>{t("planner.events.fields.description")}</span>
                      <p className={styles.description}>{selectedEvent.description}</p>
                    </div>
                  )}
                </div>

                <div className={styles.modalFooter}>
                  <button className={styles.dangerButton} onClick={handleDeleteEvent} disabled={isDeleting}>
                    <Trash2 size={14} />
                    {isDeleting ? t("planner.events.actions.deleting") : t("planner.events.actions.delete")}
                  </button>
                  <div className={styles.footerRight}>
                    <button className={styles.secondaryButton} onClick={() => setSelectedEvent(null)}>
                      {t("planner.events.actions.close")}
                    </button>
                    <button className={styles.primaryButton} onClick={handleEditClick}>
                      <Edit2 size={14} />
                      {t("planner.events.actions.edit")}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Create/Edit Form Modal */}
      <Dialog.Root open={isFormOpen} onOpenChange={setIsFormOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.overlay} />
          <Dialog.Content className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <div className={styles.headerTop}>
                  <h2 className={styles.modalTitle}>
                    {isEditing ? t("planner.events.form.editTitle") : t("planner.events.form.createTitle")}
                  </h2>
                  <Dialog.Close asChild>
                    <button className={styles.closeButton} onClick={resetForm}>
                      <X size={18} />
                    </button>
                  </Dialog.Close>
                </div>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t("planner.events.form.title")}*</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={formData.title}
                    onChange={(e) => handleFormChange("title", e.target.value)}
                    placeholder={t("planner.events.form.titlePlaceholder")}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t("planner.events.form.description")}</label>
                  <textarea
                    className={styles.formTextarea}
                    value={formData.description}
                    onChange={(e) => handleFormChange("description", e.target.value)}
                    placeholder={t("planner.events.form.descriptionPlaceholder")}
                    rows={3}
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t("planner.events.form.category")}</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={formData.category}
                      onChange={(e) => handleFormChange("category", e.target.value)}
                      placeholder={t("planner.events.form.categoryPlaceholder")}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t("planner.events.form.color")}</label>
                    <input
                      type="color"
                      className={styles.formColorInput}
                      value={formData.color}
                      onChange={(e) => handleFormChange("color", e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t("planner.events.form.location")}</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={formData.location}
                    onChange={(e) => handleFormChange("location", e.target.value)}
                    placeholder={t("planner.events.form.locationPlaceholder")}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formCheckbox}>
                    <input
                      type="checkbox"
                      checked={formData.allDay}
                      onChange={(e) => handleFormChange("allDay", e.target.checked)}
                    />
                    <span>{t("planner.events.form.allDay")}</span>
                  </label>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t("planner.events.form.startDate")}</label>
                    <div className={styles.dateTimeRow}>
                      <input
                        type="date"
                        className={styles.formInput}
                        value={formData.startDate}
                        onChange={(e) => handleFormChange("startDate", e.target.value)}
                      />
                      {!formData.allDay && (
                        <input
                          type="time"
                          className={styles.formInput}
                          value={formData.startTime}
                          onChange={(e) => handleFormChange("startTime", e.target.value)}
                        />
                      )}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t("planner.events.form.endDate")}</label>
                    <div className={styles.dateTimeRow}>
                      <input
                        type="date"
                        className={styles.formInput}
                        value={formData.endDate}
                        onChange={(e) => handleFormChange("endDate", e.target.value)}
                      />
                      {!formData.allDay && (
                        <input
                          type="time"
                          className={styles.formInput}
                          value={formData.endTime}
                          onChange={(e) => handleFormChange("endTime", e.target.value)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  className={styles.secondaryButton}
                  onClick={() => {
                    setIsFormOpen(false);
                    resetForm();
                  }}
                >
                  {t("planner.events.actions.cancel")}
                </button>
                <button
                  className={styles.primaryButton}
                  onClick={isEditing ? handleUpdateEvent : handleCreateEvent}
                  disabled={isCreating || isUpdating}
                >
                  {isCreating || isUpdating
                    ? t("planner.events.actions.saving")
                    : isEditing
                      ? t("planner.events.actions.save")
                      : t("planner.events.actions.create")}
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

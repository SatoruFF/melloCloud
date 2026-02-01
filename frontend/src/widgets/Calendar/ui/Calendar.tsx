import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import type { EventClickArg, DateSelectArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import multiMonthPlugin from "@fullcalendar/multimonth";
import * as Dialog from "@radix-ui/react-dialog";
import { Calendar as CalendarIcon, Clock, MapPin, Users, Tag, X, Trash2, Plus, Share2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { message, Drawer, DatePicker } from "antd";
import luxonGenerateConfig from "@rc-component/picker/generate/luxon";
import type { DateTime } from "luxon";
import { DateTime as LuxonDateTime } from "luxon";
import { useTranslation } from "react-i18next";

const LuxonDatePicker = DatePicker.generatePicker<DateTime>(luxonGenerateConfig);
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
import { getUserSelector } from "../../../entities/user";
import { ShareModal } from "../../../features/sharing/ui/ShareModal/ShareModal";
import { ResourceType } from "../../../entities/sharing";

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
  const currentUser = useSelector(getUserSelector);
  const currentUserId = currentUser?.id;

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareTarget, setShareTarget] = useState<{ id: number; title: string } | null>(null);

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
        : new Date(
            `${formData.startDate}T${formData.startTime || "09:00"}`,
          ).toISOString();

      const endDateTime = formData.allDay
        ? new Date(formData.endDate).toISOString()
        : new Date(
            `${formData.endDate}T${formData.endTime || "10:00"}`,
          ).toISOString();

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
        : new Date(
            `${formData.startDate}T${formData.startTime || "09:00"}`,
          ).toISOString();

      const endDateTime = formData.allDay
        ? new Date(formData.endDate).toISOString()
        : new Date(
            `${formData.endDate}T${formData.endTime || "10:00"}`,
          ).toISOString();

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
      refetch();
      if (isFormOpen) {
        setIsFormOpen(false);
        setSelectedEvent(null);
        resetForm();
      } else {
        // Редактирование в drawer — оставляем drawer открытым с обновлёнными данными
        const start = new Date(result.startDate);
        const end = new Date(result.endDate);
        setSelectedEvent({
          id: result.id.toString(),
          title: result.title,
          start,
          end,
          description: result.description,
          location: result.location,
          category: result.category,
          color: result.color,
          attendees: result.attendees,
          allDay: result.allDay,
        });
        setFormData({
          title: result.title,
          description: result.description || "",
          location: result.location || "",
          color: result.color || "#1890ff",
          category: result.category || "",
          startDate: start.toISOString().split("T")[0],
          startTime: start.toTimeString().slice(0, 5),
          endDate: end.toISOString().split("T")[0],
          endTime: end.toTimeString().slice(0, 5),
          allDay: result.allDay ?? false,
        });
      }
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
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      setSelectedEvent({
        id: event.id.toString(),
        title: event.title,
        start,
        end,
        description: event.description,
        location: event.location,
        category: event.category,
        color: event.color,
        attendees: event.attendees,
        allDay: event.allDay,
      });
      // Синхронизируем форму для редактирования прямо в drawer
      setFormData({
        title: event.title,
        description: event.description || "",
        location: event.location || "",
        color: event.color || "#1890ff",
        category: event.category || "",
        startDate: start.toISOString().split("T")[0],
        startTime: start.toTimeString().slice(0, 5),
        endDate: end.toISOString().split("T")[0],
        endTime: end.toTimeString().slice(0, 5),
        allDay: event.allDay ?? false,
      });
    }
  };

  const selectedFullEvent = selectedEvent ? events.find((e) => e.id.toString() === selectedEvent.id) : null;
  const isEventOwner = selectedFullEvent && currentUserId !== undefined && selectedFullEvent.userId === currentUserId;

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

  const handleFormChange = (field: keyof EventFormData, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "allDay" && value === false) {
        if (!next.startTime) next.startTime = "09:00";
        if (!next.endTime) next.endTime = "10:00";
      }
      return next;
    });
  };

  const defaultStartTime = "09:00";
  const defaultEndTime = "10:00";
  const startPickerValue = (() => {
    if (formData.allDay && formData.startDate) {
      const d = LuxonDateTime.fromFormat(formData.startDate, "yyyy-MM-dd");
      return d.invalid ? null : d;
    }
    if (formData.startDate) {
      const s = formData.startTime || defaultStartTime;
      const d = LuxonDateTime.fromISO(`${formData.startDate}T${s}`);
      return d.invalid ? null : d;
    }
    return null;
  })();
  const endPickerValue = (() => {
    if (formData.allDay && formData.endDate) {
      const d = LuxonDateTime.fromFormat(formData.endDate, "yyyy-MM-dd");
      return d.invalid ? null : d;
    }
    if (formData.endDate) {
      const s = formData.endTime || defaultEndTime;
      const d = LuxonDateTime.fromISO(`${formData.endDate}T${s}`);
      return d.invalid ? null : d;
    }
    return null;
  })();

  const handleStartChange = (date: DateTime | null) => {
    if (!date || date.invalid) return;
    setFormData((prev) => ({
      ...prev,
      startDate: date.toFormat("yyyy-MM-dd"),
      ...(prev.allDay ? {} : { startTime: date.toFormat("HH:mm") }),
    }));
  };
  const handleEndChange = (date: DateTime | null) => {
    if (!date || date.invalid) return;
    setFormData((prev) => ({
      ...prev,
      endDate: date.toFormat("yyyy-MM-dd"),
      ...(prev.allDay ? {} : { endTime: date.toFormat("HH:mm") }),
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
          noEventsContent={() => t("planner.events.noEvents")}
          noEventsClassNames={[styles.noEventsMessage]}
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

      {/* Event Details — Drawer: просмотр и редактирование в одном месте */}
      <Drawer
        title={isEventOwner ? formData.title : selectedEvent?.title}
        placement="right"
        width={420}
        open={!!selectedEvent && !isFormOpen}
        onClose={() => setSelectedEvent(null)}
        rootClassName={styles.eventDrawer}
        className={styles.eventDrawer}
        closeIcon={<X size={18} style={{ color: "#fff" }} />}
        styles={{
          header: { background: "#0a0a0a", borderBottomColor: "#27272a", color: "#fff" },
          body: { background: "#0a0a0a", color: "#f1f5f9" },
          wrapper: { background: "#0a0a0a" },
          content: { background: "#0a0a0a" },
        }}
      >
        {selectedEvent && (
          <div className={styles.drawerInner}>
            <div className={styles.drawerBody}>
              {isEventOwner ? (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.detailLabel}>{t("planner.events.form.title")}*</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={formData.title}
                      onChange={(e) => handleFormChange("title", e.target.value)}
                      placeholder={t("planner.events.form.titlePlaceholder")}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.detailLabel}>{t("planner.events.form.description")}</label>
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
                      <label className={styles.detailLabel}>{t("planner.events.form.category")}</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={formData.category}
                        onChange={(e) => handleFormChange("category", e.target.value)}
                        placeholder={t("planner.events.form.categoryPlaceholder")}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.detailLabel}>{t("planner.events.form.color")}</label>
                      <input
                        type="color"
                        className={styles.formColorInput}
                        value={formData.color}
                        onChange={(e) => handleFormChange("color", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.detailLabel}>{t("planner.events.form.location")}</label>
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
                      <label className={styles.detailLabel}>{t("planner.events.form.startDate")}</label>
                      <LuxonDatePicker
                        value={startPickerValue?.invalid ? null : startPickerValue}
                        onChange={handleStartChange}
                        className={styles.datePicker}
                        popupClassName={styles.datePickerDropdown}
                        allowClear={false}
                        format={formData.allDay ? "dd.MM.yyyy" : "dd.MM.yyyy HH:mm"}
                        showTime={
                          !formData.allDay ? { format: "HH:mm" } : false
                        }
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.detailLabel}>{t("planner.events.form.endDate")}</label>
                      <LuxonDatePicker
                        value={endPickerValue?.invalid ? null : endPickerValue}
                        onChange={handleEndChange}
                        className={styles.datePicker}
                        popupClassName={styles.datePickerDropdown}
                        allowClear={false}
                        format={formData.allDay ? "dd.MM.yyyy" : "dd.MM.yyyy HH:mm"}
                        showTime={
                          !formData.allDay ? { format: "HH:mm" } : false
                        }
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {selectedEvent.category && (
                    <span
                      className={styles.categoryBadge}
                      style={{ borderColor: selectedEvent.color ?? "#3f3f46" }}
                    >
                      <Tag size={12} />
                      {selectedEvent.category}
                    </span>
                  )}
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
                              {attendee.user?.userName ||
                                attendee.user?.email ||
                                t("planner.events.fields.attendee")}
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
                </>
              )}
            </div>

            <div className={styles.drawerFooter}>
              {isEventOwner && (
                <button
                  className={styles.dangerButton}
                  onClick={handleDeleteEvent}
                  disabled={isDeleting}
                >
                  <Trash2 size={14} />
                  {isDeleting ? t("planner.events.actions.deleting") : t("planner.events.actions.delete")}
                </button>
              )}
              <div className={styles.footerRight}>
                {isEventOwner && (
                  <button
                    className={styles.secondaryButton}
                    onClick={() => {
                      setShareTarget({ id: Number(selectedEvent.id), title: selectedEvent.title });
                      setShareModalOpen(true);
                    }}
                  >
                    <Share2 size={14} />
                    {t("sharing.modal.share")}
                  </button>
                )}
                <button className={styles.secondaryButton} onClick={() => setSelectedEvent(null)}>
                  {t("planner.events.actions.close")}
                </button>
                {isEventOwner && (
                  <button
                    className={styles.primaryButton}
                    onClick={handleUpdateEvent}
                    disabled={isUpdating}
                  >
                    {isUpdating ? t("planner.events.actions.saving") : t("planner.events.actions.save")}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Шейринг — в модалке (поверх drawer) */}
      {shareTarget && (
        <ShareModal
          open={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setShareTarget(null);
          }}
          resourceType={ResourceType.EVENT}
          resourceId={shareTarget.id}
          resourceName={shareTarget.title}
          zIndex={1050}
        />
      )}

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
                    <LuxonDatePicker
                      value={startPickerValue?.invalid ? null : startPickerValue}
                      onChange={handleStartChange}
                      className={styles.datePicker}
                      popupClassName={styles.datePickerDropdown}
                      allowClear={false}
                      format={formData.allDay ? "dd.MM.yyyy" : "dd.MM.yyyy HH:mm"}
                      showTime={
                        !formData.allDay ? { format: "HH:mm" } : false
                      }
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t("planner.events.form.endDate")}</label>
                    <LuxonDatePicker
                      value={endPickerValue?.invalid ? null : endPickerValue}
                      onChange={handleEndChange}
                      className={styles.datePicker}
                      popupClassName={styles.datePickerDropdown}
                      allowClear={false}
                      format={formData.allDay ? "dd.MM.yyyy" : "dd.MM.yyyy HH:mm"}
                      showTime={
                        !formData.allDay ? { format: "HH:mm" } : false
                      }
                    />
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

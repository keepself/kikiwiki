package com.kikiwiki.backend.notification;

import com.kikiwiki.backend.schedule.ScheduleItem;
import com.kikiwiki.backend.schedule.ScheduleItemRepository;
import com.kikiwiki.backend.todo.TodoItem;
import com.kikiwiki.backend.todo.TodoItemRepository;
import com.kikiwiki.backend.todo.TodoStatus;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

// 오늘/내일이 마감인 할 일, 오늘/내일 시작하는 일정을 모아서 이메일 한 통으로 보냄 (SMTP로 Gmail에
// 발송하면 그 다음부터는 Gmail 앱 자체의 알림 기능을 그대로 빌려 쓰는 셈 - 별도 푸시 인프라 없이 알림 효과를 냄)
@Service
public class DigestMailService {

    private final TodoItemRepository todoItemRepository;
    private final ScheduleItemRepository scheduleItemRepository;
    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;

    @Value("${app.notification.recipient}")
    private String recipientEmail;

    public DigestMailService(
            TodoItemRepository todoItemRepository,
            ScheduleItemRepository scheduleItemRepository,
            NotificationRepository notificationRepository,
            JavaMailSender mailSender
    ) {
        this.todoItemRepository = todoItemRepository;
        this.scheduleItemRepository = scheduleItemRepository;
        this.notificationRepository = notificationRepository;
        this.mailSender = mailSender;
    }

    // 보낼 내용이 있었으면 true, 없어서 스킵했으면 false (수동 트리거 응답에 씀)
    public boolean sendDailyDigest() {
        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);

        List<TodoItem> todosToday = todoItemRepository.findAllByDueDateAndDeletedAtIsNullAndStatusNot(today, TodoStatus.DONE);
        List<TodoItem> todosTomorrow = todoItemRepository.findAllByDueDateAndDeletedAtIsNullAndStatusNot(tomorrow, TodoStatus.DONE);
        List<ScheduleItem> schedulesToday = scheduleItemRepository.findAllByStartDateAndDeletedAtIsNull(today);
        List<ScheduleItem> schedulesTomorrow = scheduleItemRepository.findAllByStartDateAndDeletedAtIsNull(tomorrow);

        if (todosToday.isEmpty() && todosTomorrow.isEmpty() && schedulesToday.isEmpty() && schedulesTomorrow.isEmpty()) {
            return false;
        }

        String body = buildBody(todosToday, todosTomorrow, schedulesToday, schedulesTomorrow);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(recipientEmail);
        message.setSubject("kikiwiki - " + today + " 마감/일정 알림");
        message.setText(body);
        mailSender.send(message);

        for (TodoItem item : todosToday) {
            saveNotificationIfNew("오늘 마감: " + item.getTitle(), NotificationSourceType.TODO, item.getId(), today);
        }
        for (TodoItem item : todosTomorrow) {
            saveNotificationIfNew("내일 마감: " + item.getTitle(), NotificationSourceType.TODO, item.getId(), today);
        }
        for (ScheduleItem item : schedulesToday) {
            saveNotificationIfNew("오늘 일정: " + item.getTitle(), NotificationSourceType.SCHEDULE, item.getId(), today);
        }
        for (ScheduleItem item : schedulesTomorrow) {
            saveNotificationIfNew("내일 일정: " + item.getTitle(), NotificationSourceType.SCHEDULE, item.getId(), today);
        }

        return true;
    }

    // 오늘 이미 같은 항목으로 알림을 만들었으면 건너뜀 (다이제스트가 하루에 두 번 실행돼도 중복 안 쌓이게)
    private void saveNotificationIfNew(String message, NotificationSourceType sourceType, Long sourceId, LocalDate today) {
        if (notificationRepository.existsBySourceTypeAndSourceIdAndSentForDate(sourceType, sourceId, today)) {
            return;
        }
        notificationRepository.save(new Notification(message, sourceType, sourceId, today));
    }

    private String buildBody(
            List<TodoItem> todosToday, List<TodoItem> todosTomorrow,
            List<ScheduleItem> schedulesToday, List<ScheduleItem> schedulesTomorrow
    ) {
        StringBuilder sb = new StringBuilder();
        sb.append(LocalDate.now()).append(" 기준 알림입니다.\n\n");

        appendTodoSection(sb, "[오늘 마감인 할 일]", todosToday);
        appendTodoSection(sb, "[내일 마감인 할 일]", todosTomorrow);
        appendScheduleSection(sb, "[오늘 시작하는 일정]", schedulesToday);
        appendScheduleSection(sb, "[내일 시작하는 일정]", schedulesTomorrow);

        return sb.toString();
    }

    private void appendTodoSection(StringBuilder sb, String title, List<TodoItem> items) {
        if (items.isEmpty()) return;
        sb.append(title).append("\n");
        for (TodoItem item : items) {
            sb.append("- ").append(item.getTitle()).append("\n");
        }
        sb.append("\n");
    }

    private void appendScheduleSection(StringBuilder sb, String title, List<ScheduleItem> items) {
        if (items.isEmpty()) return;
        sb.append(title).append("\n");
        for (ScheduleItem item : items) {
            sb.append("- ").append(item.getTitle()).append("\n");
        }
        sb.append("\n");
    }
}

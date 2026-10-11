package com.parking.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.opencsv.CSVWriter;
import com.parking.dto.AnalyticsDto;
import com.parking.model.ParkingRecord;
import com.parking.model.Role;
import com.parking.model.SessionStatus;
import com.parking.model.SlotStatus;
import com.parking.repository.ParkingRecordRepository;
import com.parking.repository.ParkingSlotRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    private static final Logger log = LoggerFactory.getLogger(ReportService.class);

    private final ParkingRecordRepository parkingRecordRepository;
    private final ParkingSlotRepository parkingSlotRepository;

    public ReportService(ParkingRecordRepository parkingRecordRepository,
                         ParkingSlotRepository parkingSlotRepository) {
        this.parkingRecordRepository = parkingRecordRepository;
        this.parkingSlotRepository = parkingSlotRepository;
    }

    public byte[] exportCsv(String userId, Role role, LocalDate from, LocalDate to) {
        List<ParkingRecord> records = getRecordsForRange(userId, role, from, to);
        StringWriter sw = new StringWriter();
        try (CSVWriter writer = new CSVWriter(sw)) {
            writer.writeNext(new String[]{
                    "Record ID",
                    "User ID",
                    "Vehicle Number",
                    "Slot Number",
                    "Entry Time",
                    "Exit Time",
                    "Status"
            });

            DateTimeFormatter dtf = DateTimeFormatter.ISO_INSTANT;
            for (ParkingRecord r : records) {
                writer.writeNext(new String[]{
                        r.getId(),
                        r.getUserId(),
                        r.getVehicleNumber(),
                        r.getSlotNumber(),
                        r.getEntryTime() != null ? dtf.format(r.getEntryTime()) : "",
                        r.getExitTime() != null ? dtf.format(r.getExitTime()) : "",
                        r.getStatus() != null ? r.getStatus().name() : ""
                });
            }
        } catch (Exception e) {
            log.error("Error generating CSV: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating CSV export", e);
        }

        return sw.toString().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] exportPdf(String userId, Role role, LocalDate from, LocalDate to) {
        List<ParkingRecord> records = getRecordsForRange(userId, role, from, to);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document doc = new Document(pdfDoc);

            Paragraph title = new Paragraph("Vehicle Parking System - Activity Report")
                    .setFontSize(18)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER);
            doc.add(title);

            Paragraph subtitle = new Paragraph("Generated on: " + Instant.now().toString())
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(ColorConstants.GRAY);
            doc.add(subtitle);

            doc.add(new Paragraph("\n"));

            Table table = new Table(UnitValue.createPercentArray(new float[]{25, 20, 15, 20, 20}))
                    .useAllAvailableWidth();

            table.addHeaderCell(new Cell().add(new Paragraph("Vehicle")).setBold().setBackgroundColor(ColorConstants.LIGHT_GRAY));
            table.addHeaderCell(new Cell().add(new Paragraph("Slot")).setBold().setBackgroundColor(ColorConstants.LIGHT_GRAY));
            table.addHeaderCell(new Cell().add(new Paragraph("Status")).setBold().setBackgroundColor(ColorConstants.LIGHT_GRAY));
            table.addHeaderCell(new Cell().add(new Paragraph("Entry Time")).setBold().setBackgroundColor(ColorConstants.LIGHT_GRAY));
            table.addHeaderCell(new Cell().add(new Paragraph("Exit Time")).setBold().setBackgroundColor(ColorConstants.LIGHT_GRAY));

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")
                    .withZone(ZoneId.systemDefault());

            for (ParkingRecord r : records) {
                table.addCell(new Cell().add(new Paragraph(r.getVehicleNumber() != null ? r.getVehicleNumber() : "-")));
                table.addCell(new Cell().add(new Paragraph(r.getSlotNumber() != null ? r.getSlotNumber() : "-")));
                table.addCell(new Cell().add(new Paragraph(r.getStatus() != null ? r.getStatus().name() : "-")));
                table.addCell(new Cell().add(new Paragraph(r.getEntryTime() != null ? formatter.format(r.getEntryTime()) : "-")));
                table.addCell(new Cell().add(new Paragraph(r.getExitTime() != null ? formatter.format(r.getExitTime()) : "-")));
            }

            doc.add(table);
            doc.close();
        } catch (Exception e) {
            log.error("Error generating PDF: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating PDF export", e);
        }

        return out.toByteArray();
    }

    public AnalyticsDto getAnalytics(String userId, Role role, String period, LocalDate from, LocalDate to) {
        LocalDate startDate;
        LocalDate endDate = LocalDate.now();

        if ("today".equalsIgnoreCase(period)) {
            startDate = LocalDate.now();
        } else if ("30d".equalsIgnoreCase(period)) {
            startDate = LocalDate.now().minusDays(30);
        } else if ("custom".equalsIgnoreCase(period) && from != null && to != null) {
            startDate = from;
            endDate = to;
        } else { // default "7d"
            startDate = LocalDate.now().minusDays(7);
        }

        List<ParkingRecord> records = getRecordsForRange(userId, role, startDate, endDate);

        long activeSessions = records.stream().filter(r -> r.getStatus() == SessionStatus.ACTIVE).count();
        long completedSessions = records.stream().filter(r -> r.getStatus() == SessionStatus.COMPLETED).count();

        long totalSlots = parkingSlotRepository.count();
        long occupiedSlots = parkingSlotRepository.countByStatus(SlotStatus.OCCUPIED);
        double utilization = totalSlots > 0 ? ((double) occupiedSlots / totalSlots) * 100.0 : 0.0;

        // Group by day for timeline
        Map<String, long[]> dayMetrics = new LinkedHashMap<>();
        LocalDate curr = startDate;
        while (!curr.isAfter(endDate)) {
            dayMetrics.put(curr.toString(), new long[]{0, 0});
            curr = curr.plusDays(1);
        }

        DateTimeFormatter dayFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd").withZone(ZoneId.systemDefault());

        for (ParkingRecord r : records) {
            if (r.getEntryTime() != null) {
                String entryDay = dayFormatter.format(r.getEntryTime());
                if (dayMetrics.containsKey(entryDay)) {
                    dayMetrics.get(entryDay)[0]++;
                }
            }
            if (r.getExitTime() != null) {
                String exitDay = dayFormatter.format(r.getExitTime());
                if (dayMetrics.containsKey(exitDay)) {
                    dayMetrics.get(exitDay)[1]++;
                }
            }
        }

        List<AnalyticsDto.DailyMetric> timeline = new ArrayList<>();
        dayMetrics.forEach((date, counts) -> {
            timeline.add(AnalyticsDto.DailyMetric.builder()
                    .date(date)
                    .entries(counts[0])
                    .exits(counts[1])
                    .build());
        });

        return AnalyticsDto.builder()
                .period(period != null ? period : "7d")
                .totalSessions(records.size())
                .activeSessions(activeSessions)
                .completedSessions(completedSessions)
                .slotUtilizationRate(Math.round(utilization * 100.0) / 100.0)
                .timeline(timeline)
                .build();
    }

    private List<ParkingRecord> getRecordsForRange(String userId, Role role, LocalDate from, LocalDate to) {
        Instant start = from != null ? from.atStartOfDay(ZoneId.systemDefault()).toInstant() : Instant.now().minus(30, ChronoUnit.DAYS);
        Instant end = to != null ? to.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant() : Instant.now().plus(1, ChronoUnit.DAYS);

        if (role == Role.ADMIN) {
            return parkingRecordRepository.findByEntryTimeBetween(start, end);
        } else {
            return parkingRecordRepository.findByUserIdAndEntryTimeBetween(userId, start, end);
        }
    }
}

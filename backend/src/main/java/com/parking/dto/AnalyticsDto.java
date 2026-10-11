package com.parking.dto;

import java.util.List;
import java.util.Map;

public class AnalyticsDto {
    private String period;
    private long totalSessions;
    private long activeSessions;
    private long completedSessions;
    private double slotUtilizationRate; // percentage
    private Map<String, Long> sessionsByVehicleType;
    private Map<String, Long> sessionsBySlotType;
    private List<DailyMetric> timeline;

    public AnalyticsDto() {}

    public AnalyticsDto(String period, long totalSessions, long activeSessions, long completedSessions,
                        double slotUtilizationRate, Map<String, Long> sessionsByVehicleType,
                        Map<String, Long> sessionsBySlotType, List<DailyMetric> timeline) {
        this.period = period;
        this.totalSessions = totalSessions;
        this.activeSessions = activeSessions;
        this.completedSessions = completedSessions;
        this.slotUtilizationRate = slotUtilizationRate;
        this.sessionsByVehicleType = sessionsByVehicleType;
        this.sessionsBySlotType = sessionsBySlotType;
        this.timeline = timeline;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String period;
        private long totalSessions;
        private long activeSessions;
        private long completedSessions;
        private double slotUtilizationRate;
        private Map<String, Long> sessionsByVehicleType;
        private Map<String, Long> sessionsBySlotType;
        private List<DailyMetric> timeline;

        public Builder period(String period) { this.period = period; return this; }
        public Builder totalSessions(long totalSessions) { this.totalSessions = totalSessions; return this; }
        public Builder activeSessions(long activeSessions) { this.activeSessions = activeSessions; return this; }
        public Builder completedSessions(long completedSessions) { this.completedSessions = completedSessions; return this; }
        public Builder slotUtilizationRate(double rate) { this.slotUtilizationRate = rate; return this; }
        public Builder sessionsByVehicleType(Map<String, Long> map) { this.sessionsByVehicleType = map; return this; }
        public Builder sessionsBySlotType(Map<String, Long> map) { this.sessionsBySlotType = map; return this; }
        public Builder timeline(List<DailyMetric> timeline) { this.timeline = timeline; return this; }

        public AnalyticsDto build() {
            return new AnalyticsDto(period, totalSessions, activeSessions, completedSessions,
                    slotUtilizationRate, sessionsByVehicleType, sessionsBySlotType, timeline);
        }
    }

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }
    public long getTotalSessions() { return totalSessions; }
    public void setTotalSessions(long totalSessions) { this.totalSessions = totalSessions; }
    public long getActiveSessions() { return activeSessions; }
    public void setActiveSessions(long activeSessions) { this.activeSessions = activeSessions; }
    public long getCompletedSessions() { return completedSessions; }
    public void setCompletedSessions(long completedSessions) { this.completedSessions = completedSessions; }
    public double getSlotUtilizationRate() { return slotUtilizationRate; }
    public void setSlotUtilizationRate(double slotUtilizationRate) { this.slotUtilizationRate = slotUtilizationRate; }
    public Map<String, Long> getSessionsByVehicleType() { return sessionsByVehicleType; }
    public void setSessionsByVehicleType(Map<String, Long> map) { this.sessionsByVehicleType = map; }
    public Map<String, Long> getSessionsBySlotType() { return sessionsBySlotType; }
    public void setSessionsBySlotType(Map<String, Long> map) { this.sessionsBySlotType = map; }
    public List<DailyMetric> getTimeline() { return timeline; }
    public void setTimeline(List<DailyMetric> timeline) { this.timeline = timeline; }

    public static class DailyMetric {
        private String date;
        private long entries;
        private long exits;

        public DailyMetric() {}

        public DailyMetric(String date, long entries, long exits) {
            this.date = date;
            this.entries = entries;
            this.exits = exits;
        }

        public static DailyMetricBuilder builder() { return new DailyMetricBuilder(); }

        public static class DailyMetricBuilder {
            private String date;
            private long entries;
            private long exits;

            public DailyMetricBuilder date(String date) { this.date = date; return this; }
            public DailyMetricBuilder entries(long entries) { this.entries = entries; return this; }
            public DailyMetricBuilder exits(long exits) { this.exits = exits; return this; }
            public DailyMetric build() { return new DailyMetric(date, entries, exits); }
        }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public long getEntries() { return entries; }
        public void setEntries(long entries) { this.entries = entries; }
        public long getExits() { return exits; }
        public void setExits(long exits) { this.exits = exits; }
    }
}

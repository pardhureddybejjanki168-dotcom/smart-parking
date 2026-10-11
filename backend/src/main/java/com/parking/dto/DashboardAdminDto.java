package com.parking.dto;

public class DashboardAdminDto {
    private long totalUsers;
    private long totalVehicles;
    private long totalSlots;
    private long availableSlots;
    private long occupiedSlots;
    private long reservedSlots;
    private long activeSessions;
    private long completedToday;

    public DashboardAdminDto() {
    }

    public DashboardAdminDto(long totalUsers, long totalVehicles, long totalSlots,
                             long availableSlots, long occupiedSlots, long reservedSlots,
                             long activeSessions, long completedToday) {
        this.totalUsers = totalUsers;
        this.totalVehicles = totalVehicles;
        this.totalSlots = totalSlots;
        this.availableSlots = availableSlots;
        this.occupiedSlots = occupiedSlots;
        this.reservedSlots = reservedSlots;
        this.activeSessions = activeSessions;
        this.completedToday = completedToday;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private long totalUsers;
        private long totalVehicles;
        private long totalSlots;
        private long availableSlots;
        private long occupiedSlots;
        private long reservedSlots;
        private long activeSessions;
        private long completedToday;

        public Builder totalUsers(long totalUsers) {
            this.totalUsers = totalUsers;
            return this;
        }

        public Builder totalVehicles(long totalVehicles) {
            this.totalVehicles = totalVehicles;
            return this;
        }

        public Builder totalSlots(long totalSlots) {
            this.totalSlots = totalSlots;
            return this;
        }

        public Builder availableSlots(long availableSlots) {
            this.availableSlots = availableSlots;
            return this;
        }

        public Builder occupiedSlots(long occupiedSlots) {
            this.occupiedSlots = occupiedSlots;
            return this;
        }

        public Builder reservedSlots(long reservedSlots) {
            this.reservedSlots = reservedSlots;
            return this;
        }

        public Builder activeSessions(long activeSessions) {
            this.activeSessions = activeSessions;
            return this;
        }

        public Builder completedToday(long completedToday) {
            this.completedToday = completedToday;
            return this;
        }

        public DashboardAdminDto build() {
            return new DashboardAdminDto(totalUsers, totalVehicles, totalSlots, availableSlots,
                    occupiedSlots, reservedSlots, activeSessions, completedToday);
        }
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalVehicles() {
        return totalVehicles;
    }

    public void setTotalVehicles(long totalVehicles) {
        this.totalVehicles = totalVehicles;
    }

    public long getTotalSlots() {
        return totalSlots;
    }

    public void setTotalSlots(long totalSlots) {
        this.totalSlots = totalSlots;
    }

    public long getAvailableSlots() {
        return availableSlots;
    }

    public void setAvailableSlots(long availableSlots) {
        this.availableSlots = availableSlots;
    }

    public long getOccupiedSlots() {
        return occupiedSlots;
    }

    public void setOccupiedSlots(long occupiedSlots) {
        this.occupiedSlots = occupiedSlots;
    }

    public long getReservedSlots() {
        return reservedSlots;
    }

    public void setReservedSlots(long reservedSlots) {
        this.reservedSlots = reservedSlots;
    }

    public long getActiveSessions() {
        return activeSessions;
    }

    public void setActiveSessions(long activeSessions) {
        this.activeSessions = activeSessions;
    }

    public long getCompletedToday() {
        return completedToday;
    }

    public void setCompletedToday(long completedToday) {
        this.completedToday = completedToday;
    }
}

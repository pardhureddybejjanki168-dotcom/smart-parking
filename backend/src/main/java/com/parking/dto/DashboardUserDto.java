package com.parking.dto;

public class DashboardUserDto {
    private long totalSlots;
    private long availableSlots;
    private long occupiedSlots;
    private long reservedSlots;
    private long userActiveSessions;
    private long userVehicles;

    public DashboardUserDto() {
    }

    public DashboardUserDto(long totalSlots, long availableSlots, long occupiedSlots,
                            long reservedSlots, long userActiveSessions, long userVehicles) {
        this.totalSlots = totalSlots;
        this.availableSlots = availableSlots;
        this.occupiedSlots = occupiedSlots;
        this.reservedSlots = reservedSlots;
        this.userActiveSessions = userActiveSessions;
        this.userVehicles = userVehicles;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private long totalSlots;
        private long availableSlots;
        private long occupiedSlots;
        private long reservedSlots;
        private long userActiveSessions;
        private long userVehicles;

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

        public Builder userActiveSessions(long userActiveSessions) {
            this.userActiveSessions = userActiveSessions;
            return this;
        }

        public Builder userVehicles(long userVehicles) {
            this.userVehicles = userVehicles;
            return this;
        }

        public DashboardUserDto build() {
            return new DashboardUserDto(totalSlots, availableSlots, occupiedSlots, reservedSlots, userActiveSessions, userVehicles);
        }
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

    public long getUserActiveSessions() {
        return userActiveSessions;
    }

    public void setUserActiveSessions(long userActiveSessions) {
        this.userActiveSessions = userActiveSessions;
    }

    public long getUserVehicles() {
        return userVehicles;
    }

    public void setUserVehicles(long userVehicles) {
        this.userVehicles = userVehicles;
    }
}

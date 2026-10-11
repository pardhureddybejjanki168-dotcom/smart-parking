package com.parking.dto;

import com.parking.model.SlotStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateSlotStatusRequest {
    @NotNull(message = "Slot status is required")
    private SlotStatus status;

    public UpdateSlotStatusRequest() {
    }

    public UpdateSlotStatusRequest(SlotStatus status) {
        this.status = status;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private SlotStatus status;

        public Builder status(SlotStatus status) {
            this.status = status;
            return this;
        }

        public UpdateSlotStatusRequest build() {
            return new UpdateSlotStatusRequest(status);
        }
    }

    public SlotStatus getStatus() {
        return status;
    }

    public void setStatus(SlotStatus status) {
        this.status = status;
    }
}

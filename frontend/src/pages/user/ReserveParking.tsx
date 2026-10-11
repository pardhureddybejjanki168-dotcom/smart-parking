import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { vehicleApi, slotApi, reservationApi } from '../../api/client';
import { Vehicle, ParkingSlot, SlotType } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { SlotCard } from '../../components/ui/SlotCard';
import { Check, Calendar, Car, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { format, addHours } from 'date-fns';
import toast from 'react-hot-toast';

export const ReserveParkingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedSlotId = searchParams.get('slotId');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Data
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);

  // Selections
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [startTime, setStartTime] = useState<string>(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 15);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  });
  const [endTime, setEndTime] = useState<string>(() => {
    const d = addHours(new Date(), 2);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  });
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [createdReservationId, setCreatedReservationId] = useState<string | null>(null);

  useEffect(() => {
    const loadInitData = async () => {
      try {
        const [vRes, sRes] = await Promise.allSettled([
          vehicleApi.list(),
          slotApi.list(),
        ]);

        if (vRes.status === 'fulfilled') {
          const vData = (vRes.value as any)?.data || vRes.value;
          const list = Array.isArray(vData) ? vData : vData?.content || [];
          setVehicles(list);
          if (list.length > 0) setSelectedVehicle(list[0]);
        }

        if (sRes.status === 'fulfilled') {
          const sData = (sRes.value as any)?.data || sRes.value;
          const sList: ParkingSlot[] = Array.isArray(sData) ? sData : sData?.content || [];
          setSlots(sList);
          if (preselectedSlotId) {
            const found = sList.find((s) => s.id === preselectedSlotId);
            if (found && found.status === 'AVAILABLE') {
              setSelectedSlot(found);
            }
          }
        }
      } catch {
        toast.error('Failed to load reservation data');
      } finally {
        setLoading(false);
      }
    };

    loadInitData();
  }, [preselectedSlotId]);

  const availableSlots = useMemo(() => {
    return slots.filter((slot) => {
      const isAvailable = slot.status === 'AVAILABLE';
      const matchesType =
        selectedTypeFilter === 'ALL' || slot.slotType === selectedTypeFilter;
      return isAvailable && matchesType;
    });
  }, [slots, selectedTypeFilter]);

  const handleNext = () => {
    if (step === 1 && !selectedVehicle) {
      toast.error('Please select a vehicle');
      return;
    }
    if (step === 2 && !selectedSlot) {
      toast.error('Please select an available parking bay');
      return;
    }
    if (step === 3) {
      if (!startTime || !endTime) {
        toast.error('Please select start and end dates');
        return;
      }
      if (new Date(startTime) >= new Date(endTime)) {
        toast.error('End time must be after start time');
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleConfirmReservation = async () => {
    if (!selectedVehicle || !selectedSlot) return;
    setSubmitting(true);
    try {
      // datetime-local input produces 'YYYY-MM-DDTHH:mm' which represents local time
      const startDate = new Date(startTime);
      const endDate = new Date(endTime);

      const res = await reservationApi.create({
        vehicleId: selectedVehicle.id,
        slotId: selectedSlot.id,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      });
      const data = (res as any)?.data || res;
      setCreatedReservationId(data.id || 'CONFIRMED');
      toast.success('Parking bay reserved successfully!');
      setStep(5); // Confirmation screen
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to complete reservation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Stepper Progress */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          {[
            { num: 1, label: 'Vehicle' },
            { num: 2, label: 'Bay' },
            { num: 3, label: 'Schedule' },
            { num: 4, label: 'Confirm' },
          ].map((item, idx) => (
            <div key={item.num} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${
                  step > item.num
                    ? 'bg-emerald-500 text-white'
                    : step === item.num
                    ? 'bg-navy-700 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step > item.num ? <Check className="w-4 h-4" /> : item.num}
              </div>
              <span className={`hidden sm:inline ${step === item.num ? 'text-navy-700 font-bold' : ''}`}>
                {item.label}
              </span>
              {idx < 3 && <div className="hidden sm:block w-8 sm:w-16 h-0.5 bg-slate-200 ml-2" />}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Select Vehicle */}
      {step === 1 && (
        <Card title="Step 1: Choose Your Vehicle" subtitle="Select which vehicle will use this slot">
          {vehicles.length === 0 ? (
            <div className="py-8 text-center space-y-4">
              <p className="text-slate-500 text-sm">You haven't registered any vehicles yet.</p>
              <Link to="/vehicles/new">
                <Button variant="primary">Add a Vehicle First</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  onClick={() => setSelectedVehicle(v)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-center justify-between ${
                    selectedVehicle?.id === v.id
                      ? 'border-navy-700 bg-navy-50/30'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">
                        {v.make} {v.model} ({v.registrationNumber})
                      </p>
                      <p className="text-xs text-slate-500">
                        {v.vehicleType.replace('_', ' ')} • {v.color}
                      </p>
                    </div>
                  </div>
                  {selectedVehicle?.id === v.id && (
                    <div className="w-6 h-6 rounded-full bg-navy-700 text-white flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              <div className="flex justify-end pt-4">
                <Button variant="primary" onClick={handleNext} disabled={!selectedVehicle}>
                  Next: Select Bay <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Step 2: Select Bay */}
      {step === 2 && (
        <Card
          title="Step 2: Choose an Available Parking Bay"
          subtitle="Click on any open bay to reserve"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-slate-500 font-medium">
              Showing {availableSlots.length} available bays
            </span>
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5"
            >
              <option value="ALL">All Types</option>
              <option value="FOUR_WHEELER">Four Wheeler</option>
              <option value="TWO_WHEELER">Two Wheeler</option>
              <option value="ELECTRIC">Electric</option>
              <option value="ACCESSIBLE">Accessible</option>
            </select>
          </div>

          {availableSlots.length === 0 ? (
            <p className="py-8 text-center text-slate-500 text-sm">
              No available parking bays for the selected filter.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-1 scrollbar-thin">
              {availableSlots.map((slot) => (
                <div
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition text-center select-none ${
                    selectedSlot?.id === slot.id
                      ? 'border-navy-700 bg-navy-50 ring-2 ring-navy-700'
                      : 'border-emerald-200 bg-emerald-50 hover:border-emerald-400'
                  }`}
                >
                  <p className="font-extrabold text-lg text-slate-800">{slot.slotNumber}</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    {slot.slotType.replace('_', ' ')}
                  </p>
                  <p className="text-[10px] font-semibold text-emerald-700 uppercase mt-1">
                    Available
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between pt-6 border-t border-slate-100 mt-4">
            <Button variant="secondary" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button variant="primary" onClick={handleNext} disabled={!selectedSlot}>
              Next: Select Times <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Pick Times */}
      {step === 3 && (
        <Card title="Step 3: Reservation Schedule" subtitle="Specify when you will park">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-100 focus:border-navy-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-100 focus:border-navy-700"
              />
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t border-slate-100 mt-6">
            <Button variant="secondary" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button variant="primary" onClick={handleNext}>
              Review Booking <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Review and Confirm */}
      {step === 4 && (
        <Card title="Step 4: Confirm Booking" subtitle="Please verify the reservation details">
          <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div className="flex justify-between py-2 border-b border-slate-200/60">
              <span className="text-sm text-slate-500">Selected Vehicle</span>
              <span className="text-sm font-bold text-slate-800">
                {selectedVehicle?.make} {selectedVehicle?.model} ({selectedVehicle?.registrationNumber})
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200/60">
              <span className="text-sm text-slate-500">Parking Bay</span>
              <span className="text-sm font-bold text-navy-700">
                Slot #{selectedSlot?.slotNumber} ({selectedSlot?.slotType.replace('_', ' ')})
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200/60">
              <span className="text-sm text-slate-500">Start Time</span>
              <span className="text-sm font-semibold text-slate-800">
                {format(new Date(startTime), 'PP p')}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-slate-500">End Time</span>
              <span className="text-sm font-semibold text-slate-800">
                {format(new Date(endTime), 'PP p')}
              </span>
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t border-slate-100 mt-6">
            <Button variant="secondary" onClick={handleBack} disabled={submitting}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmReservation}
              loading={submitting}
            >
              Confirm & Book Bay
            </Button>
          </div>
        </Card>
      )}

      {/* Step 5: Success Confirmation Screen */}
      {step === 5 && (
        <Card className="text-center py-8">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Reservation Confirmed!</h2>
          <p className="text-slate-500 mt-2 max-w-md mx-auto text-sm">
            Bay #{selectedSlot?.slotNumber} has been reserved for vehicle {selectedVehicle?.registrationNumber}.
          </p>

          <div className="mt-8 flex justify-center gap-3">
            <Link to="/reservations">
              <Button variant="primary">View My Reservations</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="secondary">Go to Dashboard</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
};

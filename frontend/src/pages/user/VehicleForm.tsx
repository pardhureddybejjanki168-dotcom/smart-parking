import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { vehicleApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { VehicleType } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { ArrowLeft, Car } from 'lucide-react';
import toast from 'react-hot-toast';

const vehicleSchema = z.object({
  registrationNumber: z
    .string()
    .min(3, 'Registration number is too short')
    .max(20, 'Registration number is too long')
    .toUpperCase(),
  vehicleType: z.enum(['TWO_WHEELER', 'FOUR_WHEELER', 'ACCESSIBLE', 'ELECTRIC', 'OTHER']),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  color: z.string().min(1, 'Color is required'),
  ownerName: z.string().min(2, 'Owner name is required'),
  ownerPhone: z.string().min(7, 'Owner phone is required'),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

export const VehicleForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id && id !== 'new');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(isEdit);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      registrationNumber: '',
      vehicleType: 'FOUR_WHEELER',
      make: '',
      model: '',
      color: '',
      ownerName: user?.fullName || '',
      ownerPhone: user?.phone || '',
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchVehicle = async () => {
        try {
          const res = await vehicleApi.get(id);
          const data = (res as any)?.data || res;
          setValue('registrationNumber', data.registrationNumber);
          setValue('vehicleType', data.vehicleType);
          setValue('make', data.make);
          setValue('model', data.model);
          setValue('color', data.color);
          setValue('ownerName', data.ownerName);
          setValue('ownerPhone', data.ownerPhone);
        } catch {
          toast.error('Failed to load vehicle details');
          navigate('/vehicles');
        } finally {
          setLoading(false);
        }
      };
      fetchVehicle();
    }
  }, [id, isEdit, setValue, navigate]);

  const onSubmit = async (data: VehicleFormData) => {
    try {
      if (isEdit && id) {
        await vehicleApi.update(id, data);
        toast.success('Vehicle updated successfully');
      } else {
        await vehicleApi.create({
          ...data,
          userId: user?.id,
          active: true,
        });
        toast.success('Vehicle registered successfully');
      }
      navigate('/vehicles');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save vehicle');
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/vehicles">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {isEdit ? 'Edit Vehicle Details' : 'Register New Vehicle'}
        </h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Registration Number"
              placeholder="e.g. MH 12 AB 1234"
              {...register('registrationNumber')}
              error={errors.registrationNumber?.message}
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Type</label>
              <select
                {...register('vehicleType')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-navy-100 focus:border-navy-700"
              >
                <option value="FOUR_WHEELER">Four Wheeler (Car/SUV)</option>
                <option value="TWO_WHEELER">Two Wheeler (Motorcycle/Scooter)</option>
                <option value="ELECTRIC">Electric Vehicle (EV)</option>
                <option value="ACCESSIBLE">Accessible Vehicle</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.vehicleType && (
                <p className="mt-1 text-xs text-rose-600">{errors.vehicleType.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Make / Brand"
              placeholder="e.g. Honda, Tesla, Toyota"
              {...register('make')}
              error={errors.make?.message}
            />
            <Input
              label="Model"
              placeholder="e.g. Civic, Model 3"
              {...register('model')}
              error={errors.model?.message}
            />
            <Input
              label="Color"
              placeholder="e.g. Silver, White, Black"
              {...register('color')}
              error={errors.color?.message}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <Input
              label="Owner Full Name"
              placeholder="Full Name"
              {...register('ownerName')}
              error={errors.ownerName?.message}
            />
            <Input
              label="Contact Phone"
              placeholder="Contact Number"
              {...register('ownerPhone')}
              error={errors.ownerPhone?.message}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link to="/vehicles">
              <Button variant="secondary" type="button">
                Cancel
              </Button>
            </Link>
            <Button variant="primary" type="submit" loading={isSubmitting}>
              <Car className="w-4 h-4 mr-1.5" />
              {isEdit ? 'Save Changes' : 'Register Vehicle'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

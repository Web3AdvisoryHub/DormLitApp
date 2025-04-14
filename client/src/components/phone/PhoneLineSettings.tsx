import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface PhoneLineSettings {
  callRate: number;
  textRate: number;
  isAvailable: boolean;
  availabilityHours: {
    start: string;
    end: string;
  };
  platformFee: number;
}

export function PhoneLineSettings() {
  const [settings, setSettings] = useState<PhoneLineSettings>({
    callRate: 1.99,
    textRate: 0.99,
    isAvailable: true,
    availabilityHours: {
      start: '09:00',
      end: '17:00'
    },
    platformFee: 0.1 // 10% platform fee
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setLoading(true);
    try {
      await apiRequest('/api/phone-lines/settings', {
        method: 'POST',
        data: settings
      });
      toast({
        title: 'Settings saved',
        description: 'Your phone line settings have been updated'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-6 bg-gray-900 rounded-lg"
    >
      <h2 className="text-2xl font-bold">Phone Line Settings</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="isAvailable">Phone Line Available</Label>
          <Switch
            id="isAvailable"
            checked={settings.isAvailable}
            onCheckedChange={(checked) => 
              setSettings(prev => ({ ...prev, isAvailable: checked }))
            }
          />
        </div>

        {settings.isAvailable && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Available From</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={settings.availabilityHours.start}
                  onChange={(e) => 
                    setSettings(prev => ({
                      ...prev,
                      availabilityHours: {
                        ...prev.availabilityHours,
                        start: e.target.value
                      }
                    }))
                  }
                  className="bg-gray-800"
                />
              </div>
              <div>
                <Label htmlFor="endTime">Available Until</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={settings.availabilityHours.end}
                  onChange={(e) => 
                    setSettings(prev => ({
                      ...prev,
                      availabilityHours: {
                        ...prev.availabilityHours,
                        end: e.target.value
                      }
                    }))
                  }
                  className="bg-gray-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="callRate">Call Rate (per minute)</Label>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">$</span>
                  <Input
                    id="callRate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings.callRate}
                    onChange={(e) => 
                      setSettings(prev => ({
                        ...prev,
                        callRate: parseFloat(e.target.value)
                      }))
                    }
                    className="bg-gray-800"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="textRate">Text Message Rate</Label>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">$</span>
                  <Input
                    id="textRate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings.textRate}
                    onChange={(e) => 
                      setSettings(prev => ({
                        ...prev,
                        textRate: parseFloat(e.target.value)
                      }))
                    }
                    className="bg-gray-800"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="platformFee">Platform Fee</Label>
              <div className="flex items-center">
                <Input
                  id="platformFee"
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={settings.platformFee}
                  onChange={(e) => 
                    setSettings(prev => ({
                      ...prev,
                      platformFee: parseFloat(e.target.value)
                    }))
                  }
                  className="bg-gray-800"
                />
                <span className="text-gray-400 ml-2">%</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                This is the percentage we take from each transaction
              </p>
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={handleSave}
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Saving...' : 'Save Settings'}
      </Button>
    </motion.div>
  );
} 
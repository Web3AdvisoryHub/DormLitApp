import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'vr';

interface DeviceCapabilities {
  supportsTouch: boolean;
  supportsMotion: boolean;
  supportsVR: boolean;
  isHighEnd: boolean;
}

export const useDevice = () => {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    supportsTouch: false,
    supportsMotion: false,
    supportsVR: false,
    isHighEnd: false
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      // Detect device type
      const width = window.innerWidth;
      let type: DeviceType = 'desktop';
      
      if (width <= 768) {
        type = 'mobile';
      } else if (width <= 1024) {
        type = 'tablet';
      }

      // Check for VR capabilities
      if ('xr' in navigator) {
        type = 'vr';
      }

      setDeviceType(type);

      // Detect capabilities
      const newCapabilities: DeviceCapabilities = {
        supportsTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        supportsMotion: 'DeviceMotionEvent' in window,
        supportsVR: 'xr' in navigator,
        isHighEnd: checkHighEndDevice()
      };

      setCapabilities(newCapabilities);
    };

    // Initial detection
    updateDeviceInfo();

    // Update on resize
    window.addEventListener('resize', updateDeviceInfo);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
    };
  }, []);

  // Check if device is high-end based on various factors
  const checkHighEndDevice = (): boolean => {
    // Check for high-end GPU
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (!gl) return false;

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return false;

    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    
    // Check for high-end GPUs
    const highEndGPUs = [
      'nvidia',
      'geforce',
      'rtx',
      'gtx',
      'radeon',
      'rx',
      'intel iris',
      'apple m1',
      'apple m2'
    ];

    return highEndGPUs.some(gpu => 
      renderer.toLowerCase().includes(gpu)
    );
  };

  return {
    deviceType,
    capabilities,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    isVR: deviceType === 'vr',
    isHighEnd: capabilities.isHighEnd
  };
}; 
import { useCallback, useEffect, useState } from "react";

export default function GyroscopePage() {
  const [deviceOrientation, setDeviceOrientation] =
    useState<DeviceOrientationEvent | null>(null);

  const handleDeviceOrientation = useCallback((e: DeviceOrientationEvent) => {
    setDeviceOrientation(e);
  }, []);

  useEffect(() => {
    window.addEventListener("deviceorientation", handleDeviceOrientation);
    return () =>
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
  }, [handleDeviceOrientation]);

  return (
    <div className="mt-20 text-black">
      <p>
        Alpha:
        {deviceOrientation?.alpha}
      </p>
      <p>
        Beta:
        {deviceOrientation?.beta}
      </p>
      <p>
        Gamma:
        {deviceOrientation?.gamma}
      </p>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";

export function useImagePreload({ srcArray }: { srcArray: string[] }) {
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (srcArray.length === 0) {
      setLoaded(true);
      return;
    }

    const imgPromises = srcArray.map((src) => new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve();
      img.onerror = () => reject();
    }));

    Promise.allSettled(imgPromises)
      .then((values: PromiseSettledResult<unknown>[]) => {
        console.log(values)
        setLoaded(true)
      });
  }, [srcArray]);

  return loaded;
}
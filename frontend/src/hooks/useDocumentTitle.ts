import { useEffect } from 'react';

interface Options {
  restoreOnUnmount?: boolean;
  restoreTo?: string;
}

export function useDocumentTitle(title: string, options: Options = {}) {
  const { restoreOnUnmount = true, restoreTo } = options;

  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    return () => {
      if (restoreOnUnmount) {
        document.title = restoreTo ?? prevTitle;
      }
    };
  }, [title, restoreOnUnmount, restoreTo]);
}

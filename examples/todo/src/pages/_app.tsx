import type { AppProps } from 'next/app';
import { useLayoutEffect, useState } from 'react';

const CustomApp = ({ Component, pageProps }: AppProps) => {
    const [mounted, setMounted] = useState(false);

    useLayoutEffect(() => {
        setMounted(true)
    }, []);

    if (!mounted) {
        return null;
    }
    return <Component {...pageProps} />;
};

export default CustomApp;

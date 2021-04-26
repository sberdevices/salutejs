import type { AppProps } from 'next/app';

const CustomApp = ({ Component, pageProps }: AppProps) => {
    if (!process.browser) {
        return null;
    }
    return <Component {...pageProps} />;
};

export default CustomApp;

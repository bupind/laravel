/* prettier-ignore */
import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import ReactDOMServer from 'react-dom/server';
import { LanguageProvider } from './hooks/use-language';

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        resolve: (name) => {
            const pages = import.meta.glob('./pages/**/*.tsx', {
                eager: true,
            });
            return pages[`./pages/${name}.tsx`];
        },
        setup: ({ App, props }) => (
            <LanguageProvider>
                <App {...props} />
            </LanguageProvider>
        ),
    }),
);

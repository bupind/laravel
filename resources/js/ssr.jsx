import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import ReactDOMServer from 'react-dom/server';
import { LanguageProvider } from './hooks/use-language';
import BackendLayout from './layouts/backend-layout';
import FrontendLayout from './layouts/frontend-layout';

const frontendLayout = (page) => <FrontendLayout>{page}</FrontendLayout>;
const backendLayout = (page) => <BackendLayout>{page}</BackendLayout>;

function withDefaultLayout(name, pageModule) {
    if (name.startsWith('frontend/') && pageModule?.default && pageModule.default.layout === undefined) {
        pageModule.default.layout = frontendLayout;
    }

    if (name.startsWith('backend/errors/') && pageModule?.default && pageModule.default.layout === undefined) {
        pageModule.default.layout = backendLayout;
    }

    return pageModule;
}

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        resolve: (name) => {
            const pages = import.meta.glob('./pages/**/*.tsx', {
                eager: true,
            });
            return withDefaultLayout(name, pages[`./pages/${name}.tsx`]);
        },
        setup: ({ App, props }) => (
            <LanguageProvider
                messages={page.props?.translations ?? {}}
                locales={page.props?.translation_locales ?? []}
                defaultLocale={page.props?.translation_default_locale ?? page.props?.translation_locales?.[0]?.code ?? 'id'}
                scope={page.props?.translation_scope ?? 'backend'}
            >
                <App {...props} />
            </LanguageProvider>
        ),
    }),
);

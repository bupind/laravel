import ErrorPage from '@/components/error-page';
import FrontendLayout from '@/layouts/frontend-layout';
import { type ReactNode } from 'react';

interface Props {
    message?: string;
}

function FrontendError404({ message }: Props) {
    return <ErrorPage context="frontend" status={404} message={message} />;
}

FrontendError404.layout = (page: ReactNode) => <FrontendLayout>{page}</FrontendLayout>;

export default FrontendError404;

import ErrorPage from '@/components/error-page';
import FrontendLayout from '@/layouts/frontend-layout';
import { type ReactNode } from 'react';

interface Props {
    message?: string;
}

function FrontendError400({ message }: Props) {
    return <ErrorPage context="frontend" status={400} message={message} />;
}

FrontendError400.layout = (page: ReactNode) => <FrontendLayout>{page}</FrontendLayout>;

export default FrontendError400;

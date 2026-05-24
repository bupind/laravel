import ErrorPage from '@/components/error-page';
import FrontendLayout from '@/layouts/frontend-layout';
import { type ReactNode } from 'react';

interface Props {
    message?: string;
}

function FrontendError403({ message }: Props) {
    return <ErrorPage context="frontend" status={403} message={message} />;
}

FrontendError403.layout = (page: ReactNode) => <FrontendLayout>{page}</FrontendLayout>;

export default FrontendError403;

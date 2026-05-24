import ErrorPage from '@/components/error-page';
import FrontendLayout from '@/layouts/frontend-layout';
import { type ReactNode } from 'react';

interface Props {
    message?: string;
}

function FrontendError401({ message }: Props) {
    return <ErrorPage context="frontend" status={401} message={message} />;
}

FrontendError401.layout = (page: ReactNode) => <FrontendLayout>{page}</FrontendLayout>;

export default FrontendError401;

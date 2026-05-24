import ErrorPage from '@/components/error-page';
import FrontendLayout from '@/layouts/frontend-layout';
import { type ReactNode } from 'react';

interface Props {
    message?: string;
}

function FrontendError500({ message }: Props) {
    return <ErrorPage context="frontend" status={500} message={message} />;
}

FrontendError500.layout = (page: ReactNode) => <FrontendLayout>{page}</FrontendLayout>;

export default FrontendError500;

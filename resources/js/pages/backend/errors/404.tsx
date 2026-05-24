import ErrorPage from '@/components/error-page';
import BackendLayout from '@/layouts/backend-layout';
import { type ReactNode } from 'react';

interface Props {
    message?: string;
}

function BackendError404({ message }: Props) {
    return <ErrorPage context="backend" status={404} message={message} />;
}

BackendError404.layout = (page: ReactNode) => <BackendLayout>{page}</BackendLayout>;

export default BackendError404;

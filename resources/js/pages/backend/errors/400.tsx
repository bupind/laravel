import ErrorPage from '@/components/error-page';
import BackendLayout from '@/layouts/backend-layout';
import { type ReactNode } from 'react';

interface Props {
    message?: string;
}

function BackendError400({ message }: Props) {
    return <ErrorPage context="backend" status={400} message={message} />;
}

BackendError400.layout = (page: ReactNode) => <BackendLayout>{page}</BackendLayout>;

export default BackendError400;

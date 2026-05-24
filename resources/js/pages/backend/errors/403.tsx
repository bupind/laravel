import ErrorPage from '@/components/error-page';
import BackendLayout from '@/layouts/backend-layout';
import { type ReactNode } from 'react';

interface Props {
    message?: string;
}

function BackendError403({ message }: Props) {
    return <ErrorPage context="backend" status={403} message={message} />;
}

BackendError403.layout = (page: ReactNode) => <BackendLayout>{page}</BackendLayout>;

export default BackendError403;

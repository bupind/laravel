import ErrorPage from '@/components/error-page';
import BackendLayout from '@/layouts/backend-layout';
import { type ReactNode } from 'react';

interface Props {
    message?: string;
}

function BackendError401({ message }: Props) {
    return <ErrorPage context="backend" status={401} message={message} />;
}

BackendError401.layout = (page: ReactNode) => <BackendLayout>{page}</BackendLayout>;

export default BackendError401;
